/**
 * Process all content images: optimize for web delivery.
 *
 * Run: node scripts/process-images.mjs
 *
 * This will:
 * - Optimize images over 500KB (resize to max 2400px, compress to quality 85)
 * - Convert PNGs without transparency to JPEG
 * - Create backups of originals in content/.originals/ (local only, not on CI)
 * - Track everything in .image-cache.json to skip processed images on subsequent runs
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "..", "content");
const backupDir = path.join(contentDir, ".originals");
const cacheFile = path.join(__dirname, "..", ".image-cache.json");

// Detect if running in CI environment (Vercel, GitHub Actions, etc.)
const isCI = process.env.CI === "true" || process.env.VERCEL === "1";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const MAX_WIDTH = 2400; // Max width for any image
const JPEG_QUALITY = 85;

// Size threshold - only optimize images larger than this (in bytes)
const SIZE_THRESHOLD = 500 * 1024; // 500 KB

/**
 * Generate a hash of file contents for cache invalidation.
 * This works across git clones (unlike mtime which resets on checkout).
 */
function getFileHash(buffer) {
	return crypto.createHash("md5").update(buffer).digest("hex");
}

/**
 * Load the image cache
 */
function loadCache() {
	try {
		if (fs.existsSync(cacheFile)) {
			return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
		}
	} catch {
		// Ignore cache read errors
	}
	return {};
}

/**
 * Save the image cache
 */
function saveCache(cache) {
	fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

/**
 * Recursively find all image files in content directory
 */
function findAllImages(dir, baseDir = dir) {
	const images = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.name === ".originals") continue; // Skip backup folder

		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			images.push(...findAllImages(fullPath, baseDir));
		} else if (
			IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())
		) {
			const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
			const stat = fs.statSync(fullPath);
			images.push({ relativePath, fullPath, size: stat.size });
		}
	}

	return images;
}

/**
 * Optimize a single image (resize, compress)
 */
async function optimizeImage(fileBuffer, ext) {
	const sharpInstance = sharp(fileBuffer)
		.rotate() // Auto-orient based on EXIF
		.resize(MAX_WIDTH, null, {
			withoutEnlargement: true,
			fit: "inside",
		});

	let outputBuffer;
	let newExt = ext;

	if (ext === ".png") {
		const metadata = await sharp(fileBuffer).metadata();

		if (metadata.hasAlpha) {
			// Keep as PNG but optimize
			outputBuffer = await sharpInstance
				.png({ quality: 80, compressionLevel: 9 })
				.toBuffer();
		} else {
			// Convert to JPEG (smaller than WebP for photos)
			outputBuffer = await sharpInstance
				.jpeg({ quality: JPEG_QUALITY, progressive: true })
				.toBuffer();
			newExt = ".jpg";
		}
	} else {
		// JPEG optimization
		outputBuffer = await sharpInstance
			.jpeg({ quality: JPEG_QUALITY, progressive: true })
			.toBuffer();
	}

	return { buffer: outputBuffer, newExt };
}

/**
 * Process a single image: optimize if needed
 */
async function processImage(fullPath, relativePath, size, cache) {
	const ext = path.extname(fullPath).toLowerCase();
	const fileBuffer = fs.readFileSync(fullPath);
	let hash = getFileHash(fileBuffer);

	// Check if already processed with same hash
	const cached = cache[relativePath];
	if (cached && cached.hash === hash) {
		return { skipped: true };
	}

	let optimized = false;
	let saved = 0;
	let newRelativePath = relativePath;
	let formatChange = false;

	// Optimization pass (only for large files)
	if (size > SIZE_THRESHOLD) {
		const { buffer: optimizedBuffer, newExt } = await optimizeImage(
			fileBuffer,
			ext,
		);
		const potentialSaved = size - optimizedBuffer.length;
		const significantSavings = potentialSaved > size * 0.1;
		formatChange = newExt !== ext;

		if (significantSavings || formatChange) {
			// Backup original (only locally, skip in CI)
			if (!isCI) {
				const backupPath = path.join(backupDir, relativePath);
				fs.mkdirSync(path.dirname(backupPath), { recursive: true });
				fs.copyFileSync(fullPath, backupPath);
			}

			// Write optimized file
			if (formatChange) {
				const newPath = fullPath.replace(ext, newExt);
				fs.writeFileSync(newPath, optimizedBuffer);
				fs.unlinkSync(fullPath);
				newRelativePath = relativePath.replace(ext, newExt);
				// Remove old path from cache
				delete cache[relativePath];
			} else {
				fs.writeFileSync(fullPath, optimizedBuffer);
			}

			// Update hash to match the written file
			hash = getFileHash(optimizedBuffer);
			optimized = true;
			saved = potentialSaved;
		}
	}

	// Update cache
	cache[newRelativePath] = {
		hash,
		size: optimized ? size - saved : fileBuffer.length,
		optimized: optimized || (cached?.optimized ?? false),
	};

	return {
		skipped: false,
		optimized,
		saved,
		formatChange,
		oldPath: relativePath,
		newPath: newRelativePath,
	};
}

async function main() {
	console.log("🖼️  Processing content images...");
	const images = findAllImages(contentDir);
	const cache = loadCache();

	console.log(`   Found ${images.length} images`);

	// Create backup directory (only locally, not in CI)
	if (!isCI && !fs.existsSync(backupDir)) {
		fs.mkdirSync(backupDir, { recursive: true });
	}

	let processed = 0;
	let skipped = 0;
	let optimizedCount = 0;
	let totalSaved = 0;

	// Process images in batches
	const BATCH_SIZE = 5;
	for (let i = 0; i < images.length; i += BATCH_SIZE) {
		const batch = images.slice(i, i + BATCH_SIZE);

		await Promise.all(
			batch.map(async ({ relativePath, fullPath, size }) => {
				try {
					const result = await processImage(
						fullPath,
						relativePath,
						size,
						cache,
					);

					if (result.skipped) {
						skipped++;
					} else {
						processed++;
						if (result.optimized) {
							optimizedCount++;
							totalSaved += result.saved;
							if (result.formatChange) {
								console.log(
									`   ✓ ${result.oldPath} → ${path.basename(result.newPath)} (saved ${(result.saved / 1024 / 1024).toFixed(1)}MB)`,
								);
							} else {
								console.log(
									`   ✓ ${relativePath} (saved ${(result.saved / 1024 / 1024).toFixed(1)}MB)`,
								);
							}
						} else {
							console.log(`   ✓ ${relativePath}`);
						}
					}
				} catch (error) {
					console.error(`   ✗ ${relativePath}: ${error.message}`);
				}
			}),
		);
	}

	// Remove entries for deleted images
	const currentPaths = new Set(images.map((i) => i.relativePath));
	for (const cachedPath of Object.keys(cache)) {
		if (!currentPaths.has(cachedPath)) {
			// Check if it was renamed (format change)
			const wasRenamed = images.some((img) => {
				const ext = path.extname(img.relativePath);
				return (
					cachedPath === img.relativePath.replace(ext, ".png") ||
					cachedPath === img.relativePath.replace(ext, ".jpg")
				);
			});
			if (!wasRenamed) {
				delete cache[cachedPath];
				console.log(`   🗑️  Removed stale: ${cachedPath}`);
			}
		}
	}

	// Save cache
	saveCache(cache);

	// Summary
	console.log("");
	if (skipped === images.length) {
		console.log("✅ All images already processed!");
	} else {
		console.log(`✅ Processing complete!`);
		console.log(`   Processed: ${processed}, Skipped: ${skipped}`);
		if (optimizedCount > 0) {
			console.log(
				`   Optimized: ${optimizedCount}, Saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB`,
			);
		}
		if (!isCI && optimizedCount > 0) {
			console.log(`   Originals backed up to: content/.originals/`);
		}
	}
}

main().catch(console.error);
