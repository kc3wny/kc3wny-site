import * as fs from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";

export interface Photo {
	slug: string;
	src: string;
	location?: string;
	description?: string;
	/** ISO timestamp — EXIF capture date, back-filled into frontmatter by scripts/process-images.mjs. */
	capturedAt: string;
}

const photographyDirectory = path.join(process.cwd(), "content", "photography");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/**
 * Anchor-safe id for a photo, derived from its filename — the grid links each
 * thumbnail to `#<slug>` to open its lightbox, and filenames here are raw
 * camera/scan names that routinely carry spaces, commas and periods.
 */
function slugify(name: string): string {
	return (
		name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "") || "photo"
	);
}

/**
 * Every photo is a single file in content/photography/, with metadata in an
 * optional sidecar `.md` of the same basename (`sunset.jpg` ↔ `sunset.md`).
 * The image is what makes a photo exist, so dropping a file in the folder is
 * enough to publish it; `pnpm run process:images` then writes the sidecar with
 * the EXIF `capturedAt`, and location/description are added by hand.
 *
 * Newest first, matching the Project Index's convention.
 */
export function getAllPhotos(): Photo[] {
	if (!fs.existsSync(photographyDirectory)) return [];

	const entries = fs.readdirSync(photographyDirectory, { withFileTypes: true });
	const photos: Photo[] = [];
	const usedSlugs = new Set<string>();

	for (const entry of entries) {
		if (!entry.isFile()) continue;

		const ext = path.extname(entry.name).toLowerCase();
		if (!IMAGE_EXTENSIONS.has(ext)) continue;

		const baseName = path.basename(entry.name, path.extname(entry.name));
		const imagePath = path.join(photographyDirectory, entry.name);
		const sidecarPath = path.join(photographyDirectory, `${baseName}.md`);

		const data = fs.existsSync(sidecarPath)
			? matter(fs.readFileSync(sidecarPath, "utf8")).data
			: {};

		const stats = fs.statSync(imagePath);

		// Two files can slugify to the same anchor (`a-1.jpg` and `a 1.jpg`);
		// suffix the later one so its lightbox stays reachable.
		let slug = slugify(baseName);
		for (let n = 2; usedSlugs.has(slug); n++)
			slug = `${slugify(baseName)}-${n}`;
		usedSlugs.add(slug);

		photos.push({
			slug,
			// `?v=` is a cache key, not something the route reads. Images are
			// served `immutable` for a year, and process-images.mjs rewrites
			// photos in place — so without a token that changes with the file,
			// re-cropping a photo would leave every CDN edge and returning
			// visitor pinned to the old one. mtime+size is enough to notice.
			src:
				`/api/content-image/photography/${encodeURIComponent(entry.name)}` +
				`?v=${Math.trunc(stats.mtimeMs).toString(36)}${stats.size.toString(36)}`,
			location: data.location,
			description: data.description,
			capturedAt: data.capturedAt ?? stats.mtime.toISOString(),
		});
	}

	return photos.sort((a, b) => {
		const delta =
			new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime();
		// Undated scans all land on the same mtime; fall back to the slug so the
		// order doesn't drift between builds.
		return delta !== 0 ? delta : a.slug.localeCompare(b.slug);
	});
}
