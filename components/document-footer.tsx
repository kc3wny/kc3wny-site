import Link from "next/link";
import { buildInfo } from "@/lib/build-info";
import { WEBRING_NEXT, WEBRING_PREV } from "@/lib/webring";
import { WebringRandomLink } from "@/components/webring-random-link";

type NavLink = { readonly href: string; readonly title: string };

type DocumentFooterProps = {
	/** Show the ham-radio webring line (home & index). */
	readonly webring?: boolean;
	/** Optional prev/next document links (project briefs). */
	readonly prev?: NavLink;
	readonly next?: NavLink;
	/** Optional plain back/home link row (project briefs). */
	readonly backLinks?: readonly NavLink[];
};

const BADGES = [
	{ cls: "b-amber", a: "KC3WNY", b: "Amateur Radio", mono: true },
	{ cls: "b-grey", a: "Powered By", b: "White Monster" },
	{ cls: "b-dark", a: "SAMWISE My", b: "Beloved" },
	{ cls: "b-blue", a: "I Use", b: "Arch BTW", big: true },
	{ cls: "b-green", a: "Funny", b: "Comment" },
	{ cls: "b-red", a: "TrackPoint", b: "Superiority" },
] as const;

/**
 * Web 1.0 footer — optional prev/next or back links, an optional ham-radio
 * webring, a row of 88×31 beveled badges, and the copyright/legal line.
 */
export function DocumentFooter({
	webring,
	prev,
	next,
	backLinks,
}: DocumentFooterProps) {
	return (
		<>
			{(prev || next) && (
				<p className="center tt">
					{prev && <Link href={prev.href}>[ « {prev.title} ]</Link>}
					{prev && next && <>&nbsp;&nbsp;</>}
					{next && <Link href={next.href}>[ {next.title} » ]</Link>}
				</p>
			)}

			{backLinks && backLinks.length > 0 && (
				<p className="center tt">
					{backLinks.map((l, i) => (
						<span key={l.href}>
							{i > 0 && <>&nbsp;&nbsp;</>}
							<Link href={l.href}>[ {l.title} ]</Link>
						</span>
					))}
				</p>
			)}

			<div className="foot">
				{webring && (
					<div className="webring">
						<b>« WebRing »</b>
						<br />
						<a
							href={WEBRING_PREV.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							[ &lt; Prev ]
						</a>{" "}
						&nbsp; <WebringRandomLink /> &nbsp;{" "}
						<Link href="/webring">[ List ]</Link> &nbsp;{" "}
						<a
							href={WEBRING_NEXT.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							[ Next &gt; ]
						</a>
					</div>
				)}
				<div className="badges">
					{BADGES.map((badge) => (
						<div key={`${badge.a}-${badge.b}`} className={`badge ${badge.cls}`}>
							<span
								className={`${"big" in badge && badge.big ? "b1 " : ""}${"mono" in badge && badge.mono ? "mono" : ""}`.trim()}
							>
								{badge.a}
							</span>
							<span>{badge.b}</span>
						</div>
					))}
				</div>
				<div className="legal">
					Copyright © 2005–{buildInfo.commitYear}&nbsp;Mason Matich. All rights
					reserved. &nbsp;·&nbsp; 73 KC3WNY &nbsp;·&nbsp;{" "}
					<Link href="/surprise">Surprise!</Link>
				</div>
			</div>
		</>
	);
}
