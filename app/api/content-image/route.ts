import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * Serves an image from content/, re-encoded as JPEG (auto-rotated per EXIF).
 * Source images are already resized/compressed at build time
 * (scripts/process-images.mjs); this just serves them under a stable,
 * content-addressed-by-path URL that markdown frontmatter can reference.
 */
export async function GET(request: NextRequest) {
	const imagePath = request.nextUrl.searchParams.get("path");

	if (!imagePath) {
		return new NextResponse("Image path is required", { status: 400 });
	}

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

		// For SVG files, just return the original
		if (ext === ".svg") {
			return new NextResponse(fileBuffer, {
				headers: {
					"Content-Type": "image/svg+xml",
					"Cache-Control": "public, max-age=31536000, immutable",
				},
			});
		}

		const outputBuffer = await sharp(fileBuffer)
			.rotate() // auto-orient based on EXIF
			.jpeg({ quality: 85, progressive: true })
			.toBuffer();

		return new NextResponse(new Uint8Array(outputBuffer), {
			headers: {
				"Content-Type": "image/jpeg",
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	} catch (error) {
		console.error("Error loading image:", error);
		return new NextResponse("Image not found", { status: 404 });
	}
}
