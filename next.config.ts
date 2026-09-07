import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Get git information at build time
function getGitInfo() {
	try {
		const commitSha = execSync("git rev-parse HEAD").toString().trim();
		const commitDate = execSync("git log -1 --format=%cI").toString().trim();
		const commitCount = execSync("git rev-list --count HEAD").toString().trim();
		// The home page renders dynamically per-request (for the visitor counter),
		// which on Vercel runs in a serverless function with no git repo available —
		// so content/home.md's "last updated" date has to be resolved here, at
		// build time, and passed through as a plain env var instead.
		const homeUpdatedAt = execSync("git log -1 --format=%cI -- content/home.md")
			.toString()
			.trim();

		return {
			NEXT_PUBLIC_GIT_COMMIT_SHA: commitSha,
			NEXT_PUBLIC_GIT_COMMIT_DATE: commitDate,
			NEXT_PUBLIC_GIT_REVISION: `${commitCount}`,
			NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
			HOME_CONTENT_UPDATED_AT: homeUpdatedAt,
		};
	} catch (error) {
		console.warn("Failed to get git info:", error);
		return {};
	}
}

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy.
 *
 * `script-src` has to allow 'unsafe-inline': every page here is prerendered
 * as static HTML, and Next's hydration bootstrap is an inline <script>. A
 * nonce would have to be minted per request, which means middleware and
 * dynamic rendering on every page — trading the whole site's static delivery
 * for a directive that guards an attack surface this site doesn't have (no
 * user input is ever rendered; the only HTML built from content is markdown
 * the repo owner writes, and that still goes through DOMPurify).
 *
 * `style-src` likewise needs it for React `style={{…}}` attributes and the
 * critical CSS that `optimizeCss` inlines.
 *
 * Everything else is locked to same-origin, so an injected tag still can't
 * pull code from, or exfiltrate to, another origin.
 */
const csp = [
	"default-src 'self'",
	// va.vercel-scripts.com only serves the debug build of the analytics
	// scripts; in production they're proxied same-origin under /_vercel/.
	`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob:",
	// Fonts are self-hosted by next/font at build time — no Google origins.
	"font-src 'self'",
	`connect-src 'self' https://vitals.vercel-insights.com${isDev ? " ws: wss:" : ""}`,
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"frame-src 'none'",
	"manifest-src 'self'",
	"worker-src 'self' blob:",
	...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
	{ key: "Content-Security-Policy", value: csp },
	// Belt-and-braces alongside frame-ancestors, for older browsers.
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{
		key: "Permissions-Policy",
		value:
			"accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), xr-spatial-tracking=()",
	},
	{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },
	{ key: "X-DNS-Prefetch-Control", value: "on" },
	// Vercel sets HSTS on production domains already; stating it here keeps
	// the guarantee if the site is ever served from anywhere else.
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	},
];

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
			{
				// Social platforms fetch the OG card server-side, but leaving it
				// embeddable cross-origin keeps previews working everywhere.
				source: "/api/og",
				headers: [
					{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
				],
			},
		];
	},

	images: {
		// Source images are already resized/compressed at build time (scripts/process-images.mjs)
		// and served through /api/content-image, so Next's on-the-fly optimizer (and the
		// format/size/SVG/CSP settings that only apply to it) is unnecessary here.
		unoptimized: true,
	},

	// sharp picks its native binary at runtime based on platform, which the bundler
	// can't statically trace — keeping it external ensures Vercel's output file tracer
	// copies the whole package (including the linux-x64 libvips binary) instead of
	// missing it, which otherwise throws ERR_DLOPEN_FAILED in production.
	serverExternalPackages: ["sharp"],

	// Tell Vercel's output file tracer to include content/ images with the API route bundle.
	// sharp's linux-x64/libvips native binaries are also forced in here: sharp loads them via
	// a runtime-computed path that the tracer can't follow statically, so it silently drops
	// them otherwise — even with serverExternalPackages set — causing ERR_DLOPEN_FAILED in
	// production.
	//
	// Both the hoisted and the nested @img locations are listed. The nested copy used to be
	// the only correct one, because next pulled in a second, older sharp and the hoisted copy
	// could have been that one instead. The pnpm-workspace.yaml override now pins a single
	// sharp version tree-wide, so the hoisted copy is unambiguous — and pnpm hoists it there,
	// leaving no nested copy at all. Keeping both entries means neither layout silently
	// resolves to nothing if that changes again; a glob that matches nothing is a no-op.
	outputFileTracingIncludes: {
		"/api/content-image/[...path]": [
			"./content/**/*",
			"./node_modules/@img/sharp-linux-x64/**/*",
			"./node_modules/@img/sharp-libvips-linux-x64/**/*",
			"./node_modules/sharp/node_modules/@img/sharp-linux-x64/**/*",
			"./node_modules/sharp/node_modules/@img/sharp-libvips-linux-x64/**/*",
		],
		"/api/og": [
			"./node_modules/@img/sharp-linux-x64/**/*",
			"./node_modules/@img/sharp-libvips-linux-x64/**/*",
			"./node_modules/sharp/node_modules/@img/sharp-linux-x64/**/*",
			"./node_modules/sharp/node_modules/@img/sharp-libvips-linux-x64/**/*",
		],
	},

	experimental: {
		optimizeCss: true,
		useTypeScriptCli: true,
	},

	typescript: {
		// Fail the build on type errors rather than shipping past them —
		// `tsc --noEmit` is currently clean, so this costs nothing today and
		// stops a silent regression from reaching production later.
		ignoreBuildErrors: false,
	},

	async redirects() {
		return [
			{
				source: "/card",
				destination: "/",
				permanent: true,
			},
		];
	},

	env: {
		...getGitInfo(),
	},
};

export default nextConfig;
