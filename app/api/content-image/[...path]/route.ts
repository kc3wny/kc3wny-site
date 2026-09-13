import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * `w` snaps to one of these instead of honouring any integer. Each distinct
 * width is a separate sharp re-encode of a full-size source, so leaving it
 * open lets one client force thousands of them (and blow out the CDN cache)
 * by walking `w=1,2,3…`.
 */
const ALLOWED_WIDTHS = [120, 240, 360, 480, 720, 960, 1200, 1600, 2400];

const CONTENT_ROOT = path.resolve(process.cwd(), "content");

/**
 * Only these are servable. Without an allowlist this route is a general
 * "read any file under content/" endpoint — sharp rejects non-images, but
 * that's an accident of sharp's parser rather than a rule we enforce.
 */
const ALLOWED_EXTENSIONS = new Set([
	".jpg",
	".jpeg",
	".png",
	".webp",
	".avif",
	".gif",
	".svg",
]);

/**
 * True if the resolved file really sits inside content/. Comparing resolved
 * paths with a trailing separator matters: a plain `startsWith(CONTENT_ROOT)`
 * would also accept a sibling directory like `content-backup/`.
 */
function isInsideContentRoot(fullPath: string): boolean {
	return (
		fullPath === CONTENT_ROOT || fullPath.startsWith(CONTENT_ROOT + path.sep)
	);
}

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
	const requestedWidth = widthParam
		? Number.parseInt(widthParam, 10)
		: Number.NaN;
	const targetWidth = Number.isFinite(requestedWidth)
		? (ALLOWED_WIDTHS.find((w) => w >= requestedWidth) ??
			ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1])
		: undefined;

	// Reject dot-segments outright rather than trying to neutralize them —
	// this also keeps content/.originals/ (unprocessed camera files, EXIF and
	// GPS intact) unreachable, since it's only a backup, never published.
	if (pathSegments.some((segment) => segment.startsWith("."))) {
		return new NextResponse("Invalid path", { status: 403 });
	}

	const fullPath = path.resolve(CONTENT_ROOT, imagePath);
	if (!isInsideContentRoot(fullPath)) {
		return new NextResponse("Invalid path", { status: 403 });
	}

	const ext = path.extname(fullPath).toLowerCase();
	if (!ALLOWED_EXTENSIONS.has(ext)) {
		return new NextResponse("Unsupported image type", { status: 415 });
	}

	try {
		const fileBuffer = fs.readFileSync(fullPath);
		const baseName = path.basename(fullPath, ext);

		// SVGs are served as-is (rasterizing them would defeat the point), and
		// an SVG rendered on our own origin can carry <script>. These files are
		// author-written, but the sandbox + null CSP means even a malicious one
		// that landed in content/ couldn't run script or phone home.
		if (ext === ".svg") {
			return new NextResponse(fileBuffer, {
				headers: {
					"Content-Type": "image/svg+xml",
					"Cache-Control": "public, max-age=31536000, immutable",
					"Content-Disposition": contentDisposition(`${baseName}${ext}`),
					"Content-Security-Policy":
						"default-src 'none'; style-src 'unsafe-inline'; sandbox",
					"X-Content-Type-Options": "nosniff",
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
				"X-Content-Type-Options": "nosniff",
			},
		});
	} catch (error) {
		console.error("Error loading image:", error);
		return new NextResponse("Image not found", { status: 404 });
	}
}
