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

function findImageFile(dir: string): string | undefined {
	return fs
		.readdirSync(dir)
		.find((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()));
}

/** Newest first, matching the Project Index's convention. */
export function getAllPhotos(): Photo[] {
	if (!fs.existsSync(photographyDirectory)) return [];

	const entries = fs.readdirSync(photographyDirectory, { withFileTypes: true });
	const photos: Photo[] = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const dir = path.join(photographyDirectory, entry.name);
		const indexPath = path.join(dir, "index.md");
		if (!fs.existsSync(indexPath)) continue;

		const imageFile = findImageFile(dir);
		if (!imageFile) continue;

		const { data } = matter(fs.readFileSync(indexPath, "utf8"));

		photos.push({
			slug: entry.name,
			src: `/api/content-image/photography/${entry.name}/${imageFile}`,
			location: data.location,
			description: data.description,
			capturedAt: data.capturedAt ?? fs.statSync(dir).mtime.toISOString(),
		});
	}

	return photos.sort(
		(a, b) =>
			new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime(),
	);
}
