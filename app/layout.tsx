import type React from "react";
import type { Metadata, Viewport } from "next";
import { EB_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const garamond = EB_Garamond({
	subsets: ["latin"],
	style: ["normal", "italic"],
	variable: "--font-serif",
	display: "swap",
	preload: true,
});

export const metadata: Metadata = {
	title: "home@kc3wny.com",
	description: "personal website of Mason Matich",
	openGraph: {
		title: "home@kc3wny.com",
		description: "personal website of Mason Matich",
		type: "website",
		url: "https://kc3wny.com",
		images: [
			{
				url: "https://kc3wny.com/api/og",
			},
		],
	},
	icons: {
		icon: [
			{
				media: "(prefers-color-scheme: light)",
				url: "/logo/favicon-light.svg",
				href: "/logo/favicon-light.svg",
			},
			{
				media: "(prefers-color-scheme: dark)",
				url: "/logo/favicon-dark.svg",
				href: "/logo/favicon-dark.svg",
			},
		],
	},
};

export const viewport: Viewport = {
	themeColor: "#FE7F2D",
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={garamond.variable}>
			<body>
				{children}
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
