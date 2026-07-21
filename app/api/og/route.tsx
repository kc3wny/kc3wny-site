import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// Satori (next/og's layout engine) can't reliably rasterize the logo's SVG
// directly — it needs numeric width/height for <img> and errors on complex
// vector paths. Pre-rasterize to PNG with sharp instead.
async function getLogoPng(): Promise<{
	dataUrl: string;
	width: number;
	height: number;
}> {
	const logoPath = join(process.cwd(), "public", "logo", "v4_text.svg");
	const svgBuffer = await readFile(logoPath);
	const pngBuffer = await sharp(svgBuffer)
		.resize({ width: 600 })
		.png()
		.toBuffer();
	const { width, height } = await sharp(pngBuffer).metadata();

	return {
		dataUrl: `data:image/png;base64,${pngBuffer.toString("base64")}`,
		width: width ?? 600,
		height: height ?? 295,
	};
}

export async function GET() {
	const logo = await getLogoPng();

	return new ImageResponse(
		<div
			style={{
				background: "white",
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={logo.dataUrl}
				alt="Logo"
				width={logo.width}
				height={logo.height}
				style={{ objectFit: "contain" }}
			/>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
