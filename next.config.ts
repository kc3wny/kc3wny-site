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

	// Tell Vercel's output file tracer to include content/ images with the API route bundle
	outputFileTracingIncludes: {
		"/api/content-image": ["./content/**/*"],
	},

	experimental: {
		optimizeCss: true,
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
