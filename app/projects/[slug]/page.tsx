import { notFound } from "next/navigation";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";
import { DocumentWrapper } from "@/components/document-wrapper";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import {
	type ContentBlock,
	type EmbeddedFigure,
	escapeAttr,
	parseProjectContent,
} from "@/lib/project-content";
import { DocumentFooter } from "@/components/document-footer";
import { parseLocalDate } from "@/lib/utils";

export function generateStaticParams() {
	const projects = getAllProjects();
	return projects.map((project) => ({ slug: project.slug }));
}

function SanitizedHtmlContent({ html }: { html: string }) {
	const sanitizedHtml = DOMPurify.sanitize(html, {
		ADD_ATTR: ["class", "target", "rel", "id", "href"],
	});
	return <>{parse(sanitizedHtml)}</>;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const project = getProjectBySlug(slug);
	if (!project) return { title: "Project Not Found" };
	return {
		title: `${project.title}`,
		description: project.description,
		openGraph: {
			title: `${project.title}`,
			description: project.description,
			type: "article",
			publishedTime: project.publishedAt,
			url: `https://kc3wny.com/projects/${project.slug}`,
			images: [
				{
					url: project.images?.hero
						? `https://kc3wny.com${project.images.hero}`
						: "https://kc3wny.com/api/og",
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
}

function figureHtml(figure: EmbeddedFigure, wide: boolean): string {
	const src = escapeAttr(figure.src);
	return `<figure class="snap${wide ? " wide" : ""}" id="${escapeAttr(figure.id)}"><a href="${src}" target="_blank" rel="noopener noreferrer"><img src="${src}" alt="${escapeAttr(figure.alt)}" /></a><figcaption><b>Photo ${figure.photoNumber}.</b> ${figure.captionHtml}</figcaption></figure>`;
}

/** Content blocks → retro HTML: §-numbered, citable sections and inline figures. */
function blocksToHtml(blocks: ContentBlock[]): string {
	return blocks
		.map((block) => {
			switch (block.type) {
				case "heading": {
					const id = `s${block.sectionNo}`;
					return `<h2 class="sec" id="${id}"><a class="anchor" href="#${id}">§${block.sectionNo}</a>${block.html}</h2>`;
				}
				case "paragraph":
					return block.bold
						? `<p><b>${block.html}</b></p>`
						: `<p>${block.html}</p>`;
				case "list":
					return `<ul class="disc">${block.items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
				case "figure":
					return figureHtml(block.figure, true);
				default: // "gallery"
					return `<div class="gallery">${block.figures.map((f) => figureHtml(f, false)).join("")}</div>`;
			}
		})
		.join("");
}

export default async function ProjectPage({
	params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
	const { slug } = await params;
	const project = getProjectBySlug(slug);
	if (!project) notFound();

	const { blocks, embeddedFigureIds } = parseProjectContent(
		project.content,
		project.images?.figures,
	);
	const publishedDate = parseLocalDate(project.publishedAt);
	const updatedDate = new Date(project.updatedAt);
	// Figures already embedded inline (via FIG-XXX citations in the body) are left out here to avoid duplicates.
	const figures = (project.images?.figures ?? []).filter(
		(figure) => !embeddedFigureIds.has(figure.id),
	);

	return (
		<DocumentWrapper>
			<hr />

			<h1 className="mh-call page-title">{project.title}</h1>
			<p className="byline">{project.description}</p>
			<p className="small">
				Published{" "}
				{publishedDate.toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
				})}
				{" · "}
				Last updated{" "}
				{updatedDate.toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
				})}
				<span className="no-print">
					{" · "}
					<a href={`/projects/${project.slug}/pdf`} download>
						[ Download PDF ]
					</a>
				</span>
			</p>

			<hr />

			{project.award && (
				<p>
					<span className="tag award">Award</span> {project.award}
				</p>
			)}

			{/* Specifications */}
			{project.metrics && Object.keys(project.metrics).length > 0 && (
				<table className="grid">
					<caption>Specifications</caption>
					<tbody>
						{Object.entries(project.metrics).map(([key, value]) => (
							<tr key={key}>
								<td className="k">{key}</td>
								<td>{value}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{/* Hero photo */}
			{project.images?.hero && (
				<figure className="snap wide">
					<a
						href={project.images.hero}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Image
							src={project.images.hero}
							alt={`${project.title} — overview`}
							width={1200}
							height={800}
						/>
					</a>
				</figure>
			)}

			{/* Markdown body */}
			<SanitizedHtmlContent html={blocksToHtml(blocks)} />

			{/* Figure gallery */}
			{figures.length > 0 && (
				<>
					<h2 className="sec">Figures</h2>
					<div className="gallery">
						{figures.map((figure) => (
							<figure className="snap" id={figure.id} key={figure.id}>
								<a href={figure.src} target="_blank" rel="noopener noreferrer">
									<Image
										src={figure.src}
										alt={figure.caption}
										width={800}
										height={600}
									/>
								</a>
								<figcaption>
									<b>{figure.id}</b> {figure.caption}
								</figcaption>
							</figure>
						))}
					</div>
				</>
			)}

			<DocumentFooter
				backLinks={[
					{ href: "/projects", title: "« Back to Project Index" },
					{ href: "/", title: "Home" },
				]}
			/>
		</DocumentWrapper>
	);
}
