import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
	const logoPath = join(process.cwd(), "public", "logo", "v4_text.svg");
	const logoSvg = await readFile(logoPath, "utf-8");

	const svgBuffer = Buffer.from(logoSvg);
	const base64Svg = svgBuffer.toString("base64");

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
				src={`data:image/svg+xml;base64,${base64Svg}`}
				alt="Logo"
				width="600"
				height="295"
				style={{ objectFit: "contain" }}
			/>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
