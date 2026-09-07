import { headers } from "next/headers";
import { createClient, type RedisClientType } from "redis";
import { FALLBACK_COUNT } from "@/lib/visitor-count-constants";

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

/** Conservative IPv4/IPv6 shape check — anything else becomes "unknown". */
function isPlausibleIp(value: string): boolean {
	if (value.length === 0 || value.length > 45) return false;
	return /^[0-9a-fA-F:.]+$/.test(value);
}

async function getClientIp(): Promise<string> {
	const headerList = await headers();
	// x-vercel-forwarded-for is set by the platform and can't be spoofed by
	// the client; x-forwarded-for is only the fallback for other hosts. The
	// value goes into a Redis key, so it's shape-checked either way —
	// otherwise a client that can influence the header could mint unbounded
	// keys (memory growth) or smuggle delimiters into the key namespace.
	const candidate =
		headerList.get("x-vercel-forwarded-for") ??
		headerList.get("x-forwarded-for")?.split(",")[0] ??
		headerList.get("x-real-ip") ??
		"";
	const trimmed = candidate.trim();
	return isPlausibleIp(trimmed) ? trimmed : "unknown";
}

/** Reads the counter without touching it (cross-origin hits, see the route). */
export async function getVisitorCount(): Promise<number> {
	try {
		const redis = await getClient();
		if (!redis) return FALLBACK_COUNT;
		const current = await redis.get("visitor_count");
		return current ? Number.parseInt(current, 10) : FALLBACK_COUNT;
	} catch (err) {
		console.error("Failed to read visitor count:", err);
		return FALLBACK_COUNT;
	}
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
