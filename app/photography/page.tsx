import Image from "next/image";
import { DocumentWrapper } from "@/components/document-wrapper";
import { DocumentFooter } from "@/components/document-footer";
import { getAllPhotos } from "@/lib/photography";

/**
 * The lightbox caps its image at 900px wide (.lightbox-content) less padding,
 * so a full-size 2400px source is ~2x more pixels than can ever be shown.
 * 1600 still covers a 2x display and roughly halves the bytes.
 */
const LIGHTBOX_WIDTH = 1600;

/** One row of .photo-grid at the 820px page width — see `priority` below. */
const THUMBNAILS_ABOVE_THE_FOLD = 4;

export const metadata = {
	title: "photography@kc3wny.com",
	description: "a catalog of photos",
	openGraph: {
		title: "photography@kc3wny.com",
		description: "a catalog of photos",
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
				A catalog of photos, newest first. {photos.length}{" "}
				{photos.length === 1 ? "photo" : "photos"}.
			</p>

			<hr />

			{photos.length === 0 ? (
				<p className="small">No photos yet — check back soon.</p>
			) : (
				<>
					<div className="photo-grid">
						{photos.map((photo, index) => (
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
									src={`${photo.src}&w=480`}
									alt={photo.description || photo.location || "Photograph"}
									width={480}
									height={480}
									// next/image lazy-loads by default, which is right for 50+
									// thumbnails but hurts the one row that's above the fold —
									// those are the LCP candidate, so load them up front.
									priority={index < THUMBNAILS_ABOVE_THE_FOLD}
								/>
							</a>
						))}
					</div>

					{/* Target for the close links below — see .lightbox-dismiss. */}
					<div id="close-photo" className="lightbox-dismiss" />

					{photos.map((photo) => {
						const captured = new Date(photo.capturedAt);
						return (
							<div key={photo.slug} id={photo.slug} className="lightbox">
								<figure className="lightbox-content">
									<a
										href="#close-photo"
										className="lightbox-close"
										aria-label="Close"
									>
										[ × Close ]
									</a>
									{/* biome-ignore lint/performance/noImgElement: dimensions vary per photo and this element is hidden until opened, so it can't affect layout or LCP */}
									<img
										src={`${photo.src}&w=${LIGHTBOX_WIDTH}`}
										alt={photo.description || photo.location || "Photograph"}
										// `display: none` does not stop an <img> from being
										// fetched, so without this every full-size photo on the
										// page downloads up front — ~19MB for a gallery this size,
										// nearly all of it for lightboxes nobody opens. Lazy images
										// inside a display:none subtree never intersect the
										// viewport, so they wait until :target reveals them.
										loading="lazy"
										decoding="async"
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
