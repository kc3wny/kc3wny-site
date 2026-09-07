"use client";

import { useEffect, useState } from "react";
import { FALLBACK_COUNT } from "@/lib/visitor-count-constants";

/**
 * Renders the build-time fallback immediately (so the page stays static and
 * paints instantly), then swaps in the live, rate-limited count fetched from
 * /api/visitor-count right after mount.
 */
export function VisitorCounter() {
	const [count, setCount] = useState(FALLBACK_COUNT);

	useEffect(() => {
		let cancelled = false;
		fetch("/api/visitor-count")
			.then((res) => res.json())
			.then((data: { count: number }) => {
				if (!cancelled) setCount(data.count);
			})
			.catch(() => {
				// Keep the fallback showing — a failed fetch shouldn't be visible.
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return <span className="odo">{String(count).padStart(7, "0")}</span>;
}
