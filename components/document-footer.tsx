import Link from "next/link";
import { buildInfo } from "@/lib/build-info";

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
	{ cls: "b-grey", a: "Best Viewed", b: "at 800×600" },
	{ cls: "b-dark", a: "Made With", b: "a Text Editor" },
	{ cls: "b-blue", a: "HTML", b: "Hand-Coded", big: true },
	{ cls: "b-green", a: "Powered By", b: "GNU/Linux" },
	{ cls: "b-red", a: "Lynx", b: "Friendly" },
	{ cls: "b-grey", a: "Y2K", b: "Compliant" },
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
						<b>« Ham Radio WebRing »</b>
						<br />
						<Link href="#">[ &lt; Prev ]</Link> &nbsp;{" "}
						<Link href="#">[ Random ]</Link> &nbsp;{" "}
						<Link href="#">[ List ]</Link> &nbsp;{" "}
						<Link href="#">[ Next &gt; ]</Link>
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
					Copyright © 1998–{buildInfo.commitYear} Mason Matich (KC3WNY). All
					rights reserved. &nbsp;·&nbsp; 73 de KC3WNY
				</div>
			</div>
		</>
	);
}
