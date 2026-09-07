import type React from "react";
import { DocumentHeader } from "@/components/document-header";
import "@/app/retro.css";

/**
 * Page shell — the grey "desktop", the centered white paper panel with its
 * drop shadow, and the shared masthead + pipe nav. Everything else (rules,
 * page title, byline, sections, footer) is composed by each page so the
 * home page and subpages can differ freely.
 */
type DocumentWrapperProps = {
	readonly children: React.ReactNode;
	/** Nav label of the current page (highlighted in the pipe nav). */
	readonly current?: string;
};

export function DocumentWrapper({ children, current }: DocumentWrapperProps) {
	return (
		<div className="retro-desktop">
			<div className="page">
				<div className="page-inner">
					<DocumentHeader current={current} />
					{children}
				</div>
			</div>
		</div>
	);
}
