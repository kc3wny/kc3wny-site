"use client";

import { WEBRING_OTHERS } from "@/lib/webring";

/** Jumps to a random other ring member — picked fresh on each click, not baked in at render. */
export function WebringRandomLink() {
	return (
		<a
			href={WEBRING_OTHERS[0].url}
			target="_blank"
			rel="noopener noreferrer"
			onClick={(e) => {
				e.preventDefault();
				const pick =
					WEBRING_OTHERS[Math.floor(Math.random() * WEBRING_OTHERS.length)];
				window.open(pick.url, "_blank", "noopener,noreferrer");
			}}
		>
			[ Random ]
		</a>
	);
}
