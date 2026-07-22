import { headers } from "next/headers";
import { createClient, type RedisClientType } from "redis";

/**
 * Atomically increments and returns the site's visitor counter, backed by
 * the Redis database connected via Vercel's Marketplace integration
 * (visit_REDIS_URL). The client is cached at module scope so warm
 * serverless invocations reuse the same connection instead of reconnecting
 * on every request.
 *
 * Rate-limited to one increment per IP per second (via a short-lived Redis
 * key) so refresh-spamming scripts can't inflate the count — repeat hits
 * within the window just read the current value back without bumping it.
 *
 * Falls back to a fixed placeholder if the database isn't configured (e.g.
 * local dev without `vercel env pull`) or unreachable, so the page never
 * breaks without it.
 */
const FALLBACK_COUNT = 42571;
const RATE_LIMIT_SECONDS = 1;

let client: RedisClientType | undefined;

async function getClient(): Promise<RedisClientType | undefined> {
	const url = process.env.visit_REDIS_URL;
	if (!url) return undefined;

	if (!client) {
		client = createClient({ url });
		client.on("error", (err) => console.error("Redis client error:", err));
	}
	if (!client.isOpen) {
		await client.connect();
	}
	return client;
}

async function getClientIp(): Promise<string> {
	const headerList = await headers();
	// Vercel sets x-forwarded-for on every request; the first entry is the
	// original client. Fall back to a shared bucket if it's ever missing
	// (e.g. local dev) rather than skipping rate limiting entirely.
	const forwardedFor = headerList.get("x-forwarded-for");
	if (forwardedFor) return forwardedFor.split(",")[0].trim();
	return headerList.get("x-real-ip") || "unknown";
}

export async function incrementVisitorCount(): Promise<number> {
	try {
		const redis = await getClient();
		if (!redis) return FALLBACK_COUNT;

		const ip = await getClientIp();
		// Atomic "claim this IP's slot for the next second" — only the first
		// request from a given IP within the window actually increments.
		const claimed = await redis.set(`visitor_rl:${ip}`, "1", {
			condition: "NX",
			expiration: { type: "EX", value: RATE_LIMIT_SECONDS },
		});

		if (claimed) {
			return await redis.incr("visitor_count");
		}

		const current = await redis.get("visitor_count");
		return current ? Number.parseInt(current, 10) : FALLBACK_COUNT;
	} catch (err) {
		console.error("Failed to increment visitor count:", err);
		return FALLBACK_COUNT;
	}
}
