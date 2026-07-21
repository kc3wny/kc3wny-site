import Link from "next/link";
import { DocumentWrapper } from "@/components/document-wrapper";
import { DocumentFooter } from "@/components/document-footer";

export default function NotFound() {
	return (
		<DocumentWrapper current="404">
			<hr />

			<h1 className="mh-call" style={{ fontSize: "30px", margin: "6px 0 2px" }}>
				404 — Page Not Found
			</h1>
			<p className="byline">The requested resource could not be located.</p>

			<hr />

			<p>Possible causes:</p>
			<ul className="disc">
				<li>The page has been moved or deleted</li>
				<li>An incorrect URL was entered or bookmarked</li>
				<li>A link from an external source is outdated</li>
			</ul>

			<p>
				<Link href="/">&laquo; Return to Home</Link>
			</p>

			<DocumentFooter backLinks={[{ href: "/sitemap", title: "Site Map" }]} />
		</DocumentWrapper>
	);
}
