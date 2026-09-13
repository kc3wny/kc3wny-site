export type WebringSite = {
	readonly name: string;
	readonly url: string;
};

/** The other ring members — this site is not listed in its own ring. */
export const WEBRING: readonly WebringSite[] = [
	{ name: "jemoka.com", url: "https://www.jemoka.com/" },
	{ name: "shetaye.me", url: "https://shetaye.me/" },
];
