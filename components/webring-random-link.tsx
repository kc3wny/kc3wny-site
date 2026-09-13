"use client";

import { WEBRING } from "@/lib/webring";

/** Jumps to a random ring member — picked fresh on each click, not baked in at render. */
export function WebringRandomLink() {
	return (
		<a
			href={WEBRING[0].url}
			target="_blank"
			rel="noopener noreferrer"
			onClick={(e) => {
				e.preventDefault();
				const pick = WEBRING[Math.floor(Math.random() * WEBRING.length)];
				window.open(pick.url, "_blank", "noopener,noreferrer");
			}}
		>
			[ Random ]
		</a>
	);
}
