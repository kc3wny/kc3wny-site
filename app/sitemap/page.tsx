import Link from "next/link";
import { DocumentWrapper } from "@/components/document-wrapper";
import { getAllProjects } from "@/lib/projects";
import { DocumentFooter } from "@/components/document-footer";
import { getHomeContent } from "@/lib/home";
import { parseLocalDate } from "@/lib/utils";

export const metadata = {
	title: "sitemap@kc3wny.com",
	description: "sitemap of all pages",
	openGraph: {
		title: "sitemap@kc3wny.com",
		description: "sitemap of all pages",
		type: "website",
		url: "https://kc3wny.com/sitemap",
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

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export default function SitemapPage() {
	const projects = getAllProjects();
	const home = getHomeContent();
	// Most recently touched project file, so the "updated" note on the index reflects real edits.
	const projectsUpdatedAt = projects.reduce(
		(latest, p) => (p.updatedAt > latest ? p.updatedAt : latest),
		projects[0]?.updatedAt ?? home.updatedAt,
	);

	return (
		<DocumentWrapper current="Site Map">
			<hr />

			<h1 className="mh-call" style={{ fontSize: "30px", margin: "6px 0 2px" }}>
				Site Map
			</h1>
			<p className="byline">Every page on kc3wny.com</p>

			<hr />

			<ul className="tree">
				<li>
					<Link href="/">Home</Link>{" "}
					<span className="note">
						&mdash; updated {formatDate(home.updatedAt)}
					</span>
					<ul>
						<li>
							<Link href="/#bio">Biography</Link>
						</li>
						<li>
							<Link href="/#experience">Experience &amp; Leadership</Link>
						</li>
						<li>
							<Link href="/#skills">Skills</Link>
						</li>
						<li>
							<Link href="/#memberships">Professional Memberships</Link>
						</li>
						<li>
							<Link href="/#contact">Contact</Link>
						</li>
					</ul>
				</li>
				<li>
					<Link href="/projects">Project Index</Link>{" "}
					<span className="note">
						&mdash; updated {formatDate(projectsUpdatedAt)}
					</span>
					<ul>
						{projects.map((p) => (
							<li key={p.slug}>
								<Link href={`/projects/${p.slug}`} prefetch={false}>
									{p.title}
								</Link>
								{p.isNew && <span className="new">NEW</span>}{" "}
								<span className="note">
									&middot;{" "}
									{parseLocalDate(p.publishedAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
									})}
								</span>
							</li>
						))}
					</ul>
				</li>
				<li>
					<Link href="/webring">WebRing</Link>
				</li>
				<li>
					External Links
					<ul>
						<li>
							<a
								href="https://github.com/kc3wny"
								target="_blank"
								rel="noopener noreferrer"
							>
								GitHub &mdash; github.com/kc3wny
							</a>
						</li>
						<li>
							<a
								href="https://linkedin.com/in/mason-matich"
								target="_blank"
								rel="noopener noreferrer"
							>
								LinkedIn &mdash; in/mason-matich
							</a>
						</li>
						<li>
							<a href="/MMatich_Resume.pdf">
								R&eacute;sum&eacute; &mdash; MMatich_Resume.pdf
							</a>
						</li>
					</ul>
				</li>
			</ul>

			<DocumentFooter />
		</DocumentWrapper>
	);
}
