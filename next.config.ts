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

const nextConfig: NextConfig = {
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
	// sharp's linux-x64/libvips binaries are also forced in here: the tracer can't follow
	// sharp's runtime platform-detection require() calls, so it silently drops them otherwise —
	// even with serverExternalPackages set — causing ERR_DLOPEN_FAILED in production.
	outputFileTracingIncludes: {
		"/api/content-image": [
			"./content/**/*",
			"./node_modules/@img/sharp-linux-x64/**/*",
			"./node_modules/@img/sharp-libvips-linux-x64/**/*",
		],
		"/api/og": [
			"./node_modules/@img/sharp-linux-x64/**/*",
			"./node_modules/@img/sharp-libvips-linux-x64/**/*",
		],
	},

	experimental: {
		optimizeCss: true,
		useTypeScriptCli: true,
	},

	typescript: {
		ignoreBuildErrors: true, // Added update
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
