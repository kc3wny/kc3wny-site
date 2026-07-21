import { createClient, type RedisClientType } from "redis";

/**
 * Atomically increments and returns the site's visitor counter, backed by
 * the Redis database connected via Vercel's Marketplace integration
 * (visit_REDIS_URL). The client is cached at module scope so warm
 * serverless invocations reuse the same connection instead of reconnecting
 * on every request.
 *
 * Falls back to a fixed placeholder if the database isn't configured (e.g.
 * local dev without `vercel env pull`) or unreachable, so the page never
 * breaks without it.
 */
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

export async function incrementVisitorCount(): Promise<number> {
	try {
		const redis = await getClient();
		if (!redis) return 42571;
		return await redis.incr("visitor_count");
	} catch (err) {
		console.error("Failed to increment visitor count:", err);
		return 42571;
	}
}
