import Image from "next/image";
import { DocumentWrapper } from "@/components/document-wrapper";
import { DocumentFooter } from "@/components/document-footer";
import { getAllPhotos } from "@/lib/photography";

export const metadata = {
	title: "photography@kc3wny.com",
	description: "a chronological log of photos",
	openGraph: {
		title: "photography@kc3wny.com",
		description: "a chronological log of photos",
		type: "website",
		url: "https://kc3wny.com/photography",
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

export default function PhotographyPage() {
	const photos = getAllPhotos();

	return (
		<DocumentWrapper current="Photography">
			<hr />

			<h1
				id="photography"
				className="mh-call"
				style={{ fontSize: "30px", margin: "6px 0 2px" }}
			>
				Photography
			</h1>
			<p className="byline">
				A chronological log of photos, newest first. {photos.length}{" "}
				{photos.length === 1 ? "photo" : "photos"}.
			</p>

			<hr />

			{photos.length === 0 ? (
				<p className="small">No photos yet — check back soon.</p>
			) : (
				<>
					<div className="photo-grid">
						{photos.map((photo) => (
							<a
								key={photo.slug}
								href={`#${photo.slug}`}
								className="photo-thumb"
								aria-label={
									photo.location
										? `Open photo — ${photo.location}`
										: "Open photo"
								}
							>
								<Image
									src={`${photo.src}?w=480`}
									alt={photo.description || photo.location || "Photograph"}
									width={480}
									height={480}
								/>
							</a>
						))}
					</div>

					{photos.map((photo) => {
						const captured = new Date(photo.capturedAt);
						return (
							<div key={photo.slug} id={photo.slug} className="lightbox">
								<figure className="lightbox-content">
									<a
										href="#photography"
										className="lightbox-close"
										aria-label="Close"
									>
										[ × Close ]
									</a>
									{/* biome-ignore lint/performance/noImgElement: dimensions vary per photo and this element is hidden until opened, so it can't affect layout or LCP */}
									<img
										src={photo.src}
										alt={photo.description || photo.location || "Photograph"}
									/>
									<figcaption>
										<p>
											{photo.location && <b>{photo.location}</b>}
											{photo.location && " — "}
											{captured.toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</p>
										{photo.description && <p>{photo.description}</p>}
									</figcaption>
								</figure>
							</div>
						);
					})}
				</>
			)}

			<DocumentFooter webring />
		</DocumentWrapper>
	);
}
