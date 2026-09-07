import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MIN_WIDTH = 32;
const MAX_WIDTH = 2400;

/**
 * `inline` (not `attachment`) so the image still renders in the tab instead
 * of downloading — this is only a "Save As" filename hint. The tab title
 * itself comes from the URL path (see the route folder name below), since
 * browsers ignore Content-Disposition for that.
 */
function contentDisposition(filename: string): string {
	const asciiFallback = filename
		.replace(/[^\x20-\x7e]/g, "_")
		.replace(/"/g, "");
	return `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

/**
 * Serves an image from content/, re-encoded as JPEG (auto-rotated per EXIF).
 * Source images are already resized/compressed at build time
 * (scripts/process-images.mjs); this just serves them under a stable,
 * content-addressed URL that markdown frontmatter can reference.
 *
 * The path is a real URL path (not a `?path=` query param) specifically so
 * that opening an image directly in a tab shows its filename — browsers
 * title a standalone image view from the URL's pathname, not its query
 * string or Content-Disposition.
 *
 * An optional `w` query param downsizes to a thumbnail width (e.g. for grid
 * previews) — bounded so it can't be abused to force arbitrary upscaling or
 * oversized re-encodes.
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path: pathSegments } = await params;
	const imagePath = pathSegments.join("/");
	const widthParam = request.nextUrl.searchParams.get("w");
	const width = widthParam ? Number.parseInt(widthParam, 10) : undefined;
	const targetWidth =
		width && Number.isFinite(width)
			? Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH)
			: undefined;

	// Security: prevent directory traversal
	const safePath = path.normalize(imagePath).replace(/^(\.\.[/\\])+/, "");
	const fullPath = path.join(process.cwd(), "content", safePath);

	// Ensure the file is within the content directory
	if (!fullPath.startsWith(path.join(process.cwd(), "content"))) {
		return new NextResponse("Invalid path", { status: 403 });
	}

	try {
		const fileBuffer = fs.readFileSync(fullPath);
		const ext = path.extname(fullPath).toLowerCase();
		const baseName = path.basename(fullPath, ext);

		// For SVG files, just return the original
		if (ext === ".svg") {
			return new NextResponse(fileBuffer, {
				headers: {
					"Content-Type": "image/svg+xml",
					"Cache-Control": "public, max-age=31536000, immutable",
					"Content-Disposition": contentDisposition(`${baseName}${ext}`),
				},
			});
		}

		let pipeline = sharp(fileBuffer).rotate(); // auto-orient based on EXIF
		if (targetWidth) {
			pipeline = pipeline.resize(targetWidth, null, {
				withoutEnlargement: true,
				fit: "inside",
			});
		}
		const outputBuffer = await pipeline
			.jpeg({ quality: 85, progressive: true })
			.toBuffer();

		return new NextResponse(new Uint8Array(outputBuffer), {
			headers: {
				"Content-Type": "image/jpeg",
				"Cache-Control": "public, max-age=31536000, immutable",
				// Output is always re-encoded to JPEG here, so use a .jpg name
				// regardless of the source extension.
				"Content-Disposition": contentDisposition(`${baseName}.jpg`),
			},
		});
	} catch (error) {
		console.error("Error loading image:", error);
		return new NextResponse("Image not found", { status: 404 });
	}
}
