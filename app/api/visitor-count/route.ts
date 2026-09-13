import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getVisitorCount, incrementVisitorCount } from "@/lib/visitor-count";

/**
 * The counter increment moved here (out of the home page's own render path)
 * so the page itself can go back to being static and fast — the client
 * fetches this after paint instead of every request blocking on Redis.
 *
 * This is a GET with a side effect, so anyone can point an <img> at it from
 * another site and drive the count up. Sec-Fetch-Site lets us tell those
 * apart from our own page's fetch and serve them a read-only answer. It's
 * absent on old browsers and direct navigations, which we still allow —
 * the per-IP rate limit is the backstop, and the cost of being wrong here
 * is a cosmetic counter, not integrity.
 */
export async function GET() {
	const site = (await headers()).get("sec-fetch-site");
	const isCrossOrigin = site === "cross-site" || site === "same-site";

	const count = isCrossOrigin
		? await getVisitorCount()
		: await incrementVisitorCount();

	return NextResponse.json(
		{ count },
		{
			headers: {
				"Cache-Control": "no-store",
				"X-Content-Type-Options": "nosniff",
			},
		},
	);
}
