import { DocumentWrapper } from "@/components/document-wrapper";
import { DocumentFooter } from "@/components/document-footer";
import { WEBRING } from "@/lib/webring";

export const metadata = {
	title: "webring @kc3wny.com",
	description: "member list for the kc3wny.com webring",
	openGraph: {
		title: "webring @kc3wny.com",
		description: "member list for the kc3wny.com webring",
		type: "website",
		url: "https://kc3wny.com/webring",
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

export default function WebringPage() {
	return (
		<DocumentWrapper>
			<hr />

			<h1 className="mh-call" style={{ fontSize: "30px", margin: "6px 0 2px" }}>
				WebRing
			</h1>
			<p className="byline">
				To the people I've been honored to meet along the way...
			</p>

			<hr />

			<ul className="disc">
				{WEBRING.map((site) => (
					<li key={site.url}>
						<a href={site.url} target="_blank" rel="noopener noreferrer">
							{site.name}
						</a>
					</li>
				))}
			</ul>

			<DocumentFooter webring backLinks={[{ href: "/", title: "Home" }]} />
		</DocumentWrapper>
	);
}
