import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { buildInfo } from "@/lib/build-info";
import { buildProjectPdf, FONT_DIR, imageFilePath } from "@/lib/project-pdf";
import type { Project } from "@/lib/projects";

/**
 * Build cache for the project PDFs, so a build only re-renders the projects
 * that actually changed — the same idea as scripts/process-images.mjs and
 * its .image-cache.json, but the PDFs are build output rather than edited
 * sources, so they live under .next/cache/ (which Vercel restores between
 * builds) instead of being committed.
 *
 * Each PDF is stored under a hash of everything that can change it: the
 * project's markdown and frontmatter, its last-updated date, every image it
 * shows, the fonts and logo, the layout code itself, and the react-pdf
 * version. Editing any of those re-renders just the affected PDFs; editing
 * the layout re-renders all of them.
 */

const CACHE_DIR = path.join(process.cwd(), ".next", "cache", "project-pdfs");

// Bump to force every PDF to re-render (e.g. after a change the hash can't see).
const CACHE_VERSION = 1;

/** Read once per process: shared by every project's key. */
let sharedInputs: string | undefined;

function hashFiles(hash: crypto.Hash, files: string[]) {
	for (const file of files) {
		hash.update(file);
		hash.update(fs.existsSync(file) ? fs.readFileSync(file) : "missing");
	}
}

function getSharedInputs(): string {
	if (sharedInputs) return sharedInputs;
	const hash = crypto.createHash("sha256");
	hash.update(String(CACHE_VERSION));
	hash.update(buildInfo.commitYear); // printed in the copyright line
	const root = process.cwd();
	hashFiles(hash, [
		path.join(root, "lib", "project-pdf.tsx"),
		path.join(root, "lib", "project-content.ts"),
		path.join(root, "public", "logo", "v4_wide_text.svg"),
		path.join(root, "node_modules", "@react-pdf", "renderer", "package.json"),
		path.join(root, "node_modules", "@react-pdf", "hyphenate", "package.json"),
		...fs
			.readdirSync(FONT_DIR)
			.sort()
			.map((name) => path.join(FONT_DIR, name)),
	]);
	sharedInputs = hash.digest("hex");
	return sharedInputs;
}

function cacheKey(project: Project): string {
	const hash = crypto.createHash("sha256");
	hash.update(getSharedInputs());
	// Only the fields the PDF shows — sectionId, for one, shifts whenever a
	// project is added and would otherwise invalidate every PDF.
	hash.update(
		JSON.stringify([
			project.slug,
			project.title,
			project.description,
			project.publishedAt,
			project.updatedAt,
			project.award,
			project.metrics,
			project.images,
			project.content,
		]),
	);
	const sources = [
		project.images?.hero,
		...(project.images?.figures ?? []).map((figure) => figure.src),
	];
	hashFiles(
		hash,
		sources
			.map((src) => (src ? imageFilePath(src) : undefined))
			.filter((file) => file !== undefined),
	);
	return hash.digest("hex").slice(0, 16);
}

/** The project's PDF, from the build cache when nothing it depends on changed. */
export async function getProjectPdf(project: Project): Promise<Buffer> {
	const key = cacheKey(project);
	const cached = path.join(CACHE_DIR, `${project.slug}.${key}.pdf`);
	try {
		const buffer = await fs.promises.readFile(cached);
		console.log(`PDF ${project.slug}: unchanged, reused from cache`);
		return buffer;
	} catch {
		// Not cached yet — render below.
	}

	const pdf = await renderToBuffer(await buildProjectPdf(project));
	console.log(`PDF ${project.slug}: rendered`);

	// Best-effort: a read-only or missing cache dir just means no caching.
	try {
		await fs.promises.mkdir(CACHE_DIR, { recursive: true });
		for (const name of await fs.promises.readdir(CACHE_DIR)) {
			if (name.startsWith(`${project.slug}.`) && name.endsWith(".pdf")) {
				await fs.promises.rm(path.join(CACHE_DIR, name), { force: true });
			}
		}
		await fs.promises.writeFile(cached, pdf);
	} catch (error) {
		console.warn(`PDF ${project.slug}: couldn't write build cache:`, error);
	}
	return pdf;
}
