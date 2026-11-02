import type { ProjectFigure } from "@/lib/projects";

/**
 * Project markdown → a flat list of blocks, shared by the web page (which
 * turns them into retro HTML) and the PDF export (which lays them out with
 * react-pdf), so the two can't drift apart.
 *
 * Block text is inline HTML limited to `<b>`, `<i>`, `<a>` and
 * `<span class="tt">` — see parseInlineMarkdown.
 *
 * Figures cited inline (`(FIG-004)`, `[FIG-005, FIG-006]`, bare `FIG-010`, …)
 * are embedded immediately after the paragraph that cites them — as a single
 * wide figure, or a gallery when a paragraph cites more than one. Each figure
 * is embedded once, at its first citation, and numbered "Photo N" in citation
 * order. Figures never cited are left for the caller to show separately.
 */

export type EmbeddedFigure = {
	id: string;
	/** Already passed through safeUrl; empty if the frontmatter src was rejected. */
	src: string;
	/** Raw frontmatter caption, for alt text. */
	alt: string;
	photoNumber: number;
	captionHtml: string;
};

export type ContentBlock =
	| { type: "heading"; sectionNo: number; html: string }
	| { type: "paragraph"; html: string; bold: boolean }
	| { type: "list"; items: string[] }
	| { type: "figure"; figure: EmbeddedFigure }
	| { type: "gallery"; figures: EmbeddedFigure[] };

export type ParsedContent = {
	blocks: ContentBlock[];
	embeddedFigureIds: Set<string>;
};

const parseCache = new Map<string, ParsedContent>();

/** Figure ids referenced by a line, in order, deduped, restricted to known figures. */
function extractFigureIds(
	line: string,
	figureById: Map<string, ProjectFigure>,
): string[] {
	const seen = new Set<string>();
	const ids: string[] = [];
	for (const match of line.matchAll(/\bFIG-\d{3}\b/g)) {
		const id = match[0];
		if (figureById.has(id) && !seen.has(id)) {
			seen.add(id);
			ids.push(id);
		}
	}
	return ids;
}

/** Escapes a value being interpolated into a double-quoted HTML attribute. */
export function escapeAttr(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

/**
 * Link targets are limited to schemes that can't execute — `javascript:` and
 * `data:` URLs are dropped. DOMPurify would catch these downstream too; this
 * keeps the generator from emitting them in the first place.
 */
function safeUrl(url: string): string | undefined {
	const trimmed = url.trim();
	if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
	// Relative paths and in-page anchors, but not protocol-relative "//host".
	if (/^[#/](?!\/)/.test(trimmed)) return trimmed;
	return undefined;
}

function parseInlineMarkdown(
	text: string,
	figureById: Map<string, ProjectFigure>,
	photoNumberOf: (id: string) => number,
): string {
	const links: string[] = [];
	text = text.replaceAll(
		/\[([^\]]+)\]\(([^)]+)\)/g,
		(_match, linkText, url) => {
			const href = safeUrl(url);
			const placeholder = `§§§LINK${links.length}§§§`;
			links.push(
				href
					? `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
					: linkText,
			);
			return placeholder;
		},
	);

	text = text.replaceAll(/\b(FIG-\d{3})\b/g, (_match, figId) => {
		if (figureById.has(figId)) {
			const placeholder = `§§§LINK${links.length}§§§`;
			links.push(
				`<a href="#${figId}" class="tt">Photo ${photoNumberOf(figId)}</a>`,
			);
			return placeholder;
		}
		return figId;
	});

	text = text.replaceAll(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
	text = text.replaceAll(/\*([^*]+)\*/g, "<i>$1</i>");
	text = text.replaceAll(/_([^_]+)_/g, "<i>$1</i>");
	text = text.replaceAll(/`([^`]+)`/g, '<span class="tt">$1</span>');

	links.forEach((link, index) => {
		text = text.replace(`§§§LINK${index}§§§`, link);
	});

	return text;
}

/** `## ` headings become §-numbered sections; `- ` lines become bullet lists. */
export function parseProjectContent(
	content: string,
	figures?: ProjectFigure[],
): ParsedContent {
	const cacheKey = `${content}_${figures?.map((f) => `${f.id}:${f.src}:${f.caption}`).join(",") || ""}`;
	const cached = parseCache.get(cacheKey);
	if (cached) return cached;

	const figureById = new Map((figures ?? []).map((f) => [f.id, f]));
	const photoNumberById = new Map<string, number>();
	let nextPhotoNumber = 1;
	const photoNumberOf = (id: string): number => {
		let n = photoNumberById.get(id);
		if (n === undefined) {
			n = nextPhotoNumber++;
			photoNumberById.set(id, n);
		}
		return n;
	};

	const embeddedFigureIds = new Set<string>();
	const embedFigure = (figure: ProjectFigure): EmbeddedFigure => {
		embeddedFigureIds.add(figure.id);
		return {
			id: figure.id,
			src: safeUrl(figure.src) ?? "",
			alt: figure.caption,
			photoNumber: photoNumberOf(figure.id),
			captionHtml: parseInlineMarkdown(
				figure.caption,
				figureById,
				photoNumberOf,
			),
		};
	};

	const blocks: ContentBlock[] = [];
	const pushEmbeds = (ids: string[]) => {
		const fresh = ids
			.filter((id) => !embeddedFigureIds.has(id))
			.map((id) => figureById.get(id))
			.filter((figure) => figure !== undefined);
		if (fresh.length === 0) return;
		if (fresh.length === 1) {
			blocks.push({ type: "figure", figure: embedFigure(fresh[0]) });
		} else {
			blocks.push({ type: "gallery", figures: fresh.map(embedFigure) });
		}
	};

	let sectionNo = 0;
	const bullets: string[] = [];
	const paragraphLines: string[] = [];

	const flushBullets = () => {
		if (bullets.length === 0) return;
		blocks.push({ type: "list", items: [...bullets] });
		bullets.length = 0;
	};

	// A blank line ends a paragraph; consecutive non-blank lines in between are
	// soft-wrapped and joined into one, so authors can wrap prose naturally in
	// their editor instead of writing each paragraph as a single long line.
	const flushParagraph = () => {
		if (paragraphLines.length === 0) return;
		const joined = paragraphLines.join(" ");
		paragraphLines.length = 0;
		const bold = joined.startsWith("**") && joined.endsWith("**");
		const text = bold ? joined.slice(2, -2) : joined;
		const html = parseInlineMarkdown(text, figureById, photoNumberOf);
		blocks.push({ type: "paragraph", html, bold });
		pushEmbeds(extractFigureIds(joined, figureById));
	};

	for (const line of content.split("\n")) {
		const bulletMatch = /^- (.*)/.exec(line);
		if (bulletMatch) {
			flushParagraph();
			bullets.push(
				parseInlineMarkdown(bulletMatch[1], figureById, photoNumberOf),
			);
			continue;
		}
		flushBullets();

		if (line.startsWith("## ")) {
			flushParagraph();
			sectionNo += 1;
			blocks.push({
				type: "heading",
				sectionNo,
				html: parseInlineMarkdown(line.slice(3), figureById, photoNumberOf),
			});
		} else if (line.trim() === "") {
			flushParagraph();
		} else {
			paragraphLines.push(line);
		}
	}
	flushBullets();
	flushParagraph();

	const result: ParsedContent = { blocks, embeddedFigureIds };
	parseCache.set(cacheKey, result);
	return result;
}
