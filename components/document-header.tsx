import Image from "next/image";
import Link from "next/link";

/**
 * Web 1.0 masthead + pipe navigation bar. Logo left, station identity right,
 * followed by the classic pipe-separated text nav. The current page is shown
 * as an orange [ Label ] instead of a link.
 */

type NavItem = { readonly label: string; readonly href: string };

const NAV_ITEMS: readonly NavItem[] = [
	{ label: "Home", href: "/" },
	{ label: "Projects", href: "/projects" },
	{ label: "Site Map", href: "/sitemap" },
	{ label: "Contact", href: "/#contact" },
	{ label: "Résumé (PDF)", href: "/MMatich_Resume.pdf" },
];

type DocumentHeaderProps = {
	/** Nav label of the current page, e.g. "Projects" */
	readonly current?: string;
};

export function DocumentHeader({ current }: DocumentHeaderProps) {
	return (
		<>
			<table className="masthead">
				<tbody>
					<tr>
						<td className="mh-logo">
							<Link href="/" aria-label="KC3WNY home">
								<Image
									src="/logo/v4_wide_text.svg"
									alt="KC3WNY"
									width={372}
									height={70}
									priority
								/>
							</Link>
						</td>
						<td className="mh-info">
							<div className="mh-tag">Grid CM87 · Mason Matich</div>
							<div className="mh-loc">Stanford, California · Ext. Class</div>
						</td>
					</tr>
				</tbody>
			</table>

			<nav className="navbar">
				{NAV_ITEMS.map((item, i) => {
					const isCurrent = current === item.label;
					// Hash links (e.g. "Contact") need a plain <a> — next/link's client-side
					// router no-ops when the URL doesn't change, so clicking "Contact" a
					// second time in a row (already on /#contact) silently does nothing.
					// A real anchor always re-triggers the browser's native hash scroll.
					const isHashLink = item.href.includes("#");
					return (
						<span key={item.href}>
							{i > 0 && <span className="sep">|</span>}
							{isCurrent ? (
								<span className="here">[ {item.label} ]</span>
							) : isHashLink ? (
								<a href={item.href}>{item.label}</a>
							) : (
								<Link href={item.href}>{item.label}</Link>
							)}
						</span>
					);
				})}
			</nav>
		</>
	);
}
