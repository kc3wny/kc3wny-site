import { NextResponse } from "next/server";
import { incrementVisitorCount } from "@/lib/visitor-count";

/**
 * The counter increment moved here (out of the home page's own render path)
 * so the page itself can go back to being static and fast — the client
 * fetches this after paint instead of every request blocking on Redis.
 */
export async function GET() {
	const count = await incrementVisitorCount();
	return NextResponse.json(
		{ count },
		{ headers: { "Cache-Control": "no-store" } },
	);
}
