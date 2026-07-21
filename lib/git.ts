import { execFileSync } from "node:child_process";
import * as fs from "node:fs";

/**
 * Last-modified timestamp for a file, sourced from git history so it updates
 * automatically whenever the file is edited — no manual frontmatter to
 * maintain. Falls back to the filesystem mtime if git is unavailable or the
 * file has no history yet (e.g. a shallow clone).
 */
export function getFileUpdatedAt(filePath: string): string {
	try {
		const output = execFileSync(
			"git",
			["log", "-1", "--format=%cI", "--", filePath],
			{
				cwd: process.cwd(),
				stdio: ["ignore", "pipe", "ignore"],
			},
		)
			.toString()
			.trim();
		if (output) return output;
	} catch {
		// git unavailable — fall through to filesystem mtime
	}
	return fs.statSync(filePath).mtime.toISOString();
}
