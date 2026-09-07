#!/usr/bin/env node
/**
 * Script to set build environment variables from git
 * This is automatically run during build but can be used for testing
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function getGitInfo() {
	try {
		const commitSha = execSync("git rev-parse HEAD").toString().trim();
		const commitDate = execSync("git log -1 --format=%cI").toString().trim();
		const commitCount = execSync("git rev-list --count HEAD").toString().trim();

		return {
			NEXT_PUBLIC_GIT_COMMIT_SHA: commitSha,
			NEXT_PUBLIC_GIT_COMMIT_DATE: commitDate,
			NEXT_PUBLIC_GIT_REVISION: commitCount,
			NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Failed to get git info:", error.message);
		return null;
	}
}

const gitInfo = getGitInfo();

if (gitInfo) {
	console.log("Build Information:");
	console.log("==================");
	console.log(`Commit SHA: ${gitInfo.NEXT_PUBLIC_GIT_COMMIT_SHA}`);
	console.log(`Commit Date: ${gitInfo.NEXT_PUBLIC_GIT_COMMIT_DATE}`);
	console.log(`Revision: ${gitInfo.NEXT_PUBLIC_GIT_REVISION}`);
	console.log(`Build Date: ${gitInfo.NEXT_PUBLIC_BUILD_DATE}`);
	console.log("==================");

	// Merge into .env.local rather than replacing it — that file also holds
	// real credentials (visit_REDIS_URL, whatever `vercel env pull` wrote),
	// and clobbering it silently destroys them.
	const envPath = path.join(process.cwd(), ".env.local");
	const existing = fs.existsSync(envPath)
		? fs.readFileSync(envPath, "utf8").split(/\r?\n/)
		: [];

	const managed = new Set(Object.keys(gitInfo));
	const preserved = existing.filter((line) => {
		const key = line.split("=")[0]?.trim();
		return line.trim() !== "" && !managed.has(key);
	});

	const envContent = [
		...preserved,
		...Object.entries(gitInfo).map(([key, value]) => `${key}=${value}`),
	].join("\n");

	fs.writeFileSync(envPath, `${envContent}\n`, { mode: 0o600 });
	console.log(
		`\nMerged build info into ${envPath} (${preserved.length} existing entries kept)`,
	);
} else {
	console.error("Could not retrieve git information");
	process.exit(1);
}
