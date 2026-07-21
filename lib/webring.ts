export type WebringSite = {
	readonly name: string;
	readonly url: string;
};

/** This site, plus the other rings members, in ring order. */
export const WEBRING: readonly WebringSite[] = [
	{ name: "jemoka.com", url: "https://www.jemoka.com/" },
	{ name: "shetaye.me", url: "https://shetaye.me/" },
];

const SELF_INDEX = 0;

export const WEBRING_PREV =
	WEBRING[(SELF_INDEX - 1 + WEBRING.length) % WEBRING.length];
export const WEBRING_NEXT = WEBRING[(SELF_INDEX + 1) % WEBRING.length];

/** Other ring members, excluding this site — used for the "Random" link. */
export const WEBRING_OTHERS = WEBRING.filter((_, i) => i !== SELF_INDEX);
