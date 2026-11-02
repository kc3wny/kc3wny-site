import fs from "node:fs";
import path from "node:path";
import type React from "react";
import sharp from "sharp";
import {
	Document,
	Font,
	Image,
	Link,
	Page,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import { syllables } from "@react-pdf/hyphenate/en-us";
import { buildInfo } from "@/lib/build-info";
import {
	type ContentBlock,
	type EmbeddedFigure,
	parseProjectContent,
} from "@/lib/project-content";
import type { Project, ProjectFigure } from "@/lib/projects";
import { parseLocalDate } from "@/lib/utils";

/**
 * Native PDF export of a project page, laid out with react-pdf rather than
 * the browser's print dialog — so the file is identical everywhere, prints
 * the same on any printer, and carries its own footer instead of the
 * browser's URL/date header. It reuses the page's markdown parser, so
 * section numbers, figure placement and "Photo N" numbering match the web.
 *
 * Dense, paper-style layout: 10pt serif, figures sized to their content
 * rather than full width, photo groups as rows of four thumbnails.
 */

export const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
Font.register({
	family: "EB Garamond",
	fonts: [
		{ src: path.join(FONT_DIR, "EBGaramond-Regular.ttf") },
		{ src: path.join(FONT_DIR, "EBGaramond-Italic.ttf"), fontStyle: "italic" },
		{ src: path.join(FONT_DIR, "EBGaramond-Bold.ttf"), fontWeight: 700 },
		{
			src: path.join(FONT_DIR, "EBGaramond-BoldItalic.ttf"),
			fontWeight: 700,
			fontStyle: "italic",
		},
	],
});

type ViewStyle = Exclude<
	React.ComponentProps<typeof View>["style"],
	unknown[] | undefined
>;

// The default hyphenator also splits off leading/trailing punctuation, so
// "(Photo" could break as "(-" / "Photo". Only the letters get hyphenated
// here; words with digits or inner hyphens ("CNC-router") stay whole.
Font.registerHyphenationCallback((word) => {
	const match = /^(\P{L}*)(\p{L}+)(\P{L}*)$/u.exec(word);
	if (!match || match[2].length < 6) return [word];
	const [, before, letters, after] = match;
	// syllables() memoizes, so copy before editing or the cache gets corrupted.
	const parts = [...syllables(letters)];
	parts[0] = before + parts[0];
	parts[parts.length - 1] += after;
	return parts;
});

const INK = "#1a1a1a";
const SOFT = "#4a4a44";
const FAINT = "#77746a";
const ACCENT = "#e8620f";
const FIGURE_BG = "#efece1";

// US Letter is 612pt wide.
const MARGIN_X = 38;
const CONTENT_WIDTH = 612 - 2 * MARGIN_X;
const FRAME_PAD = 3;
const FRAME_BORDER = 1;
const GALLERY_COLUMNS = 4;
const GALLERY_GAP = 5;
const GALLERY_IMAGE_HEIGHT = 88; // ≈ 3.1cm
const SINGLE_MAX_WIDTH = CONTENT_WIDTH * 0.62;
const SINGLE_MAX_HEIGHT = 160; // ≈ 5.6cm
// A standalone figure placed beside the text that follows it.
const SIDE_MAX_WIDTH = CONTENT_WIDTH * 0.42;
const SIDE_MAX_HEIGHT = 160;
// Beside a short paragraph the figure shrinks toward the text's height, but
// not below this — schematics need to stay legible.
const SIDE_MIN_HEIGHT = 105;
// …and a tall, narrow figure keeps at least this width, even if that means
// growing back up to SIDE_MAX_HEIGHT.
const SIDE_MIN_WIDTH = 150;
const SIDE_GAP = 12;
// The hero sits beside the title block, like a report cover thumbnail.
const HERO_MAX_WIDTH = 190;
const HERO_MAX_HEIGHT = 96;

const styles = StyleSheet.create({
	page: {
		paddingTop: 34,
		paddingBottom: 44,
		paddingHorizontal: MARGIN_X,
		fontFamily: "EB Garamond",
		fontSize: 10,
		color: INK,
		// fontkit's ligature glyphs carry no text mapping, so with ligatures on,
		// copying or searching "flight" from the PDF finds "fight".
		fontFeatureSettings: { liga: false },
	},
	// lineHeight lives here rather than on the page: a `render` text with any
	// lineHeight (even inherited) renders nothing — a react-pdf bug that would
	// otherwise swallow the page numbers. fontSize has to sit beside it, since
	// a unitless lineHeight resolves against the fontSize in the same style.
	content: { fontSize: 10, lineHeight: 1.32 },
	footerLeft: {
		position: "absolute",
		bottom: 20,
		left: MARGIN_X,
		fontSize: 7.5,
		color: FAINT,
	},
	footerRight: {
		position: "absolute",
		bottom: 20,
		left: MARGIN_X,
		right: MARGIN_X,
		textAlign: "right",
		fontSize: 7.5,
		color: FAINT,
	},
	titleBlock: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: 12,
	},
	titleText: { flex: 1 },
	masthead: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		marginBottom: 2,
	},
	mhTag: {
		fontSize: 7,
		fontWeight: 700,
		letterSpacing: 1,
		textTransform: "uppercase",
		color: SOFT,
		textAlign: "right",
	},
	mhLoc: { fontSize: 7.5, color: FAINT, textAlign: "right" },
	rule: { borderTopWidth: 1.5, borderTopColor: "#000", marginVertical: 5 },
	title: { fontSize: 20, fontWeight: 700, lineHeight: 1.1, marginTop: 2 },
	byline: { fontStyle: "italic", fontSize: 10.5, color: SOFT, marginTop: 1 },
	meta: { fontSize: 8, color: FAINT },
	award: { marginBottom: 5 },
	awardTag: {
		fontSize: 7,
		fontWeight: 700,
		color: "#fff",
		backgroundColor: "#b8860b",
		letterSpacing: 0.4,
	},
	tableCaption: {
		fontSize: 7,
		fontWeight: 700,
		letterSpacing: 0.7,
		textTransform: "uppercase",
		color: SOFT,
		marginBottom: 2,
	},
	table: {
		borderWidth: 1,
		borderColor: "#000",
		backgroundColor: "#fbfbf6",
		marginBottom: 8,
		fontSize: 8.5,
		lineHeight: 1.25,
	},
	tableRow: { flexDirection: "row" },
	tableRowRule: { borderTopWidth: 0.5, borderTopColor: "#b7b4a6" },
	tableKey: {
		width: "30%",
		paddingVertical: 1.5,
		paddingHorizontal: 6,
		backgroundColor: "#f1efe6",
		borderRightWidth: 0.5,
		borderRightColor: "#b7b4a6",
		fontSize: 8,
		fontWeight: 700,
		color: SOFT,
	},
	tableValue: { flex: 1, paddingVertical: 1.5, paddingHorizontal: 6 },
	heading: {
		fontSize: 12.5,
		fontWeight: 700,
		lineHeight: 1.2,
		marginTop: 9,
		marginBottom: 4,
		paddingBottom: 1,
		borderBottomWidth: 1,
		borderBottomColor: "#000",
	},
	sectionNo: { color: ACCENT },
	paragraph: { marginBottom: 5, textAlign: "justify" },
	list: { marginTop: 1, marginBottom: 6, paddingLeft: 4 },
	listItem: { flexDirection: "row", marginBottom: 1 },
	bullet: { width: 10 },
	listText: { flex: 1 },
	frame: {
		borderWidth: FRAME_BORDER,
		borderColor: "#000",
		backgroundColor: FIGURE_BG,
		padding: FRAME_PAD,
	},
	image: { borderWidth: 0.75, borderColor: "#6f6c60" },
	single: { alignSelf: "center", marginTop: 2, marginBottom: 7 },
	sideRow: { flexDirection: "row", gap: SIDE_GAP, marginBottom: 4 },
	sideText: { flex: 1 },
	sideFigure: { marginTop: 2, marginBottom: 4 },
	galleryRow: {
		flexDirection: "row",
		gap: GALLERY_GAP,
		marginBottom: GALLERY_GAP,
	},
	gallery: { marginTop: 2, marginBottom: 3 },
	caption: {
		fontSize: 7,
		lineHeight: 1.25,
		color: SOFT,
		paddingTop: 2,
	},
	captionLabel: { fontWeight: 700, color: ACCENT },
	link: { color: INK, textDecoration: "none" },
	legal: {
		marginTop: 10,
		paddingTop: 4,
		borderTopWidth: 1,
		borderTopColor: "#000",
		fontSize: 7.5,
		color: SOFT,
		textAlign: "center",
	},
});

// ---- inline HTML → react-pdf text ----

type InlineNode =
	| { kind: "text"; text: string }
	| { kind: "b" | "i" | "tt"; children: InlineNode[] }
	| { kind: "a"; href: string; children: InlineNode[] };

const ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	"#39": "'",
	nbsp: " ",
};

function decodeEntities(text: string): string {
	return text.replaceAll(
		/&(amp|lt|gt|quot|#39|nbsp);/g,
		(_m, e) => ENTITIES[e],
	);
}

/**
 * Parses the small, known tag set parseInlineMarkdown emits. Anything that
 * isn't one of those tags (e.g. a literal "<3%" in prose) stays as text,
 * the same way a browser would show it.
 */
function parseInline(html: string): InlineNode[] {
	const root: InlineNode[] = [];
	const stack: { node: InlineNode & { children: InlineNode[] } }[] = [];
	const current = () =>
		(stack.length ? stack.at(-1)?.node.children : root) ?? root;
	const tagPattern = /<(\/?)(b|i|a|span)(\s[^>]*)?>/g;
	let last = 0;
	for (const match of html.matchAll(tagPattern)) {
		if (match.index > last) {
			current().push({
				kind: "text",
				text: decodeEntities(html.slice(last, match.index)),
			});
		}
		last = match.index + match[0].length;
		const [, closing, tag, attrs = ""] = match;
		if (closing) {
			stack.pop();
			continue;
		}
		let node: InlineNode & { children: InlineNode[] };
		if (tag === "a") {
			const href = /href="([^"]*)"/.exec(attrs)?.[1] ?? "";
			node = { kind: "a", href: decodeEntities(href), children: [] };
		} else if (tag === "span") {
			node = { kind: "tt", children: [] };
		} else {
			node = { kind: tag as "b" | "i", children: [] };
		}
		current().push(node);
		stack.push({ node });
	}
	if (last < html.length) {
		current().push({ kind: "text", text: decodeEntities(html.slice(last)) });
	}
	return root;
}

function renderInline(nodes: InlineNode[]): React.ReactNode[] {
	return nodes.map((node, i) => {
		const key = `${node.kind}-${i}`;
		switch (node.kind) {
			case "text":
				return node.text;
			case "b":
				return (
					<Text key={key} style={{ fontWeight: 700 }}>
						{renderInline(node.children)}
					</Text>
				);
			case "i":
				return (
					<Text key={key} style={{ fontStyle: "italic" }}>
						{renderInline(node.children)}
					</Text>
				);
			case "tt":
				return <Text key={key}>{renderInline(node.children)}</Text>;
			default: // "a"
				// Relative links point at the site; "#FIG-…" stays an in-document jump.
				return (
					<Link
						key={key}
						src={
							node.href.startsWith("/")
								? `https://kc3wny.com${node.href}`
								: node.href
						}
						style={styles.link}
					>
						{renderInline(node.children)}
					</Link>
				);
		}
	});
}

function Inline({ html }: { readonly html: string }) {
	return <>{renderInline(parseInline(html))}</>;
}

// ---- images ----

type LoadedImage = { data: Buffer; width: number; height: number };

/**
 * Maps a site image URL to its file on disk: /api/content-image/… serves
 * from content/, anything else root-relative from public/.
 */
export function imageFilePath(src: string): string | undefined {
	const contentPrefix = "/api/content-image/";
	const relative = src.startsWith(contentPrefix)
		? path.join("content", decodeURIComponent(src.slice(contentPrefix.length)))
		: src.startsWith("/")
			? path.join("public", decodeURIComponent(src.slice(1)))
			: undefined;
	if (!relative || relative.split(/[\\/]/).some((s) => s.startsWith("."))) {
		return undefined;
	}
	const fullPath = path.resolve(process.cwd(), relative);
	return fs.existsSync(fullPath) ? fullPath : undefined;
}

/**
 * Downscaled, flattened JPEGs — full-size sources would make the PDF tens of
 * megabytes, and transparent PNGs (CAD renders, schematics) would otherwise
 * turn black once converted to JPEG.
 */
async function loadImage(
	src: string,
	maxWidthPx: number,
): Promise<LoadedImage | undefined> {
	const file = imageFilePath(src);
	if (!file) return undefined;
	try {
		const { data, info } = await sharp(file)
			.rotate()
			.resize({ width: maxWidthPx, withoutEnlargement: true })
			.flatten({ background: "#ffffff" })
			.jpeg({ quality: 78, mozjpeg: true })
			.toBuffer({ resolveWithObject: true });
		return { data, width: info.width, height: info.height };
	} catch (error) {
		console.error(`PDF: failed to load image ${src}:`, error);
		return undefined;
	}
}

async function loadLogo(): Promise<Buffer> {
	return sharp(path.join(process.cwd(), "public/logo/v4_wide_text.svg"), {
		density: 300,
	})
		.png()
		.toBuffer();
}

// ---- figures ----

type FigureProps = {
	readonly id: string;
	readonly image?: LoadedImage;
	readonly label: string;
	readonly captionHtml: string;
};

/** A standalone figure, shrunk to fit the box and framed at its own width. */
function SingleFigure({
	id,
	image,
	label,
	captionHtml,
	maxWidth = SINGLE_MAX_WIDTH,
	maxHeight = SINGLE_MAX_HEIGHT,
	placement = styles.single,
}: FigureProps & {
	readonly maxWidth?: number;
	readonly maxHeight?: number;
	readonly placement?: ViewStyle;
}) {
	if (!image) return null;
	const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
	const width = image.width * scale;
	const height = image.height * scale;
	return (
		<View
			id={id}
			wrap={false}
			style={[
				styles.frame,
				placement,
				{ width: width + 2 * (FRAME_PAD + FRAME_BORDER) },
			]}
		>
			<Image
				src={{ data: image.data, format: "jpg" }}
				style={[styles.image, { width, height }]}
			/>
			{(label || captionHtml) && (
				<Text style={styles.caption}>
					{label && <Text style={styles.captionLabel}>{label} </Text>}
					<Inline html={captionHtml} />
				</Text>
			)}
		</View>
	);
}

/** Rows of fixed-height thumbnails; each row stays together on one page. */
function Gallery({ figures }: { readonly figures: readonly FigureProps[] }) {
	const cellWidth =
		(CONTENT_WIDTH - (GALLERY_COLUMNS - 1) * GALLERY_GAP) / GALLERY_COLUMNS;
	const innerWidth = cellWidth - 2 * (FRAME_PAD + FRAME_BORDER);
	const rows: FigureProps[][] = [];
	for (let i = 0; i < figures.length; i += GALLERY_COLUMNS) {
		rows.push(figures.slice(i, i + GALLERY_COLUMNS));
	}
	return (
		<View style={styles.gallery}>
			{rows.map((row) => (
				<View key={row[0].id} wrap={false} style={styles.galleryRow}>
					{row.map((figure) => (
						<View
							key={figure.id}
							id={figure.id}
							style={[styles.frame, { width: cellWidth }]}
						>
							{figure.image && (
								<Image
									src={{ data: figure.image.data, format: "jpg" }}
									style={{
										width: innerWidth,
										height: GALLERY_IMAGE_HEIGHT,
										objectFit: "contain",
									}}
								/>
							)}
							<Text style={styles.caption}>
								<Text style={styles.captionLabel}>{figure.label} </Text>
								<Inline html={figure.captionHtml} />
							</Text>
						</View>
					))}
				</View>
			))}
		</View>
	);
}

// ---- document ----

const SINGLE_IMAGE_PX = 1100;
const THUMB_IMAGE_PX = 520;

const formatDate = (date: Date) =>
	date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

// ---- figure beside text (react-pdf has no floats) ----

const LINE_PT = 10 * 1.32;
// Rough average advance of EB Garamond at 10pt — only used to estimate how
// much text fits beside a figure, so being a little off just shifts the cut.
const AVG_CHAR_PT = 4.5;
const CAPTION_ALLOWANCE = 16;

function frameSize(image: LoadedImage, maxWidth: number, maxHeight: number) {
	const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
	const inset = 2 * (FRAME_PAD + FRAME_BORDER);
	return {
		width: image.width * scale + inset,
		height: image.height * scale + inset + CAPTION_ALLOWANCE,
	};
}

const plainLength = (html: string) =>
	decodeEntities(html.replaceAll(/<[^>]+>/g, "")).length;

/** Estimated rendered height of a text block at a column width; undefined for non-text. */
function estimateHeight(
	block: ContentBlock,
	width: number,
): number | undefined {
	const lines = (chars: number, w: number) =>
		Math.max(1, Math.ceil((chars * AVG_CHAR_PT) / w));
	if (block.type === "paragraph") {
		return lines(plainLength(block.html), width) * LINE_PT + 5;
	}
	if (block.type === "list") {
		return block.items.reduce(
			(sum, item) => sum + lines(plainLength(item), width - 14) * LINE_PT + 1,
			7,
		);
	}
	return undefined;
}

type LayoutItem =
	| { kind: "block"; block: ContentBlock }
	| {
			kind: "side";
			/** A heading or bold subheading kept on the same page as the row. */
			lead?: ContentBlock;
			figure: EmbeddedFigure;
			maxHeight: number;
			text: ContentBlock[];
	  };

const ownsFigure = (blocks: ContentBlock[], i: number) =>
	blocks[i]?.type === "paragraph" &&
	(blocks[i + 1]?.type === "figure" || blocks[i + 1]?.type === "gallery");

/**
 * Sets each standalone figure beside the paragraph that cites it, roughly
 * how the web print stylesheet floats figures right. If the paragraph is
 * shorter than the figure, the text after it is pulled up alongside until
 * the column is about full, stopping at subheadings and at paragraphs that
 * have figures of their own. A figure whose citing paragraph is far taller
 * than the figure itself stays centered below it instead.
 */
function layoutBlocks(
	blocks: ContentBlock[],
	images: Map<string, LoadedImage | undefined>,
): LayoutItem[] {
	const items: LayoutItem[] = [];
	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];
		const next = blocks[i + 1];
		const image =
			next?.type === "figure" ? images.get(next.figure.src) : undefined;
		if (block.type !== "paragraph" || next?.type !== "figure" || !image) {
			items.push({ kind: "block", block });
			continue;
		}
		const widest = frameSize(image, SIDE_MAX_WIDTH, SIDE_MAX_HEIGHT);
		const leadHeight =
			estimateHeight(block, CONTENT_WIDTH - widest.width - SIDE_GAP) ?? 0;
		const maxHeight = Math.min(
			SIDE_MAX_HEIGHT,
			Math.max(
				SIDE_MIN_HEIGHT,
				leadHeight * 1.5,
				(SIDE_MIN_WIDTH * image.height) / image.width,
			),
		);
		const frame = frameSize(image, SIDE_MAX_WIDTH, maxHeight);
		const textWidth = CONTENT_WIDTH - frame.width - SIDE_GAP;
		let height = estimateHeight(block, textWidth) ?? 0;
		if (height > frame.height * 2.2) {
			items.push({ kind: "block", block });
			continue;
		}
		const text: ContentBlock[] = [block];
		for (let j = i + 2; j < blocks.length; j++) {
			const candidate = blocks[j];
			if (candidate.type === "paragraph" && candidate.bold) break;
			if (ownsFigure(blocks, j)) break;
			const h = estimateHeight(candidate, textWidth);
			if (h === undefined || height + h > frame.height * 1.1) break;
			text.push(candidate);
			height += h;
		}
		// An unbreakable row can jump to the next page; take the heading with it.
		const previous = items.at(-1);
		const lead =
			previous?.kind === "block" &&
			(previous.block.type === "heading" ||
				(previous.block.type === "paragraph" && previous.block.bold))
				? (items.pop() as { block: ContentBlock }).block
				: undefined;
		items.push({ kind: "side", lead, figure: next.figure, maxHeight, text });
		// Skip the figure and any text pulled up beside it.
		i += text.length;
	}
	return items;
}

function Body({
	blocks,
	images,
}: {
	readonly blocks: ContentBlock[];
	readonly images: Map<string, LoadedImage | undefined>;
}) {
	const embedded = (figure: EmbeddedFigure): FigureProps => ({
		id: figure.id,
		image: images.get(figure.src),
		label: `Photo ${figure.photoNumber}.`,
		captionHtml: figure.captionHtml,
	});
	const renderBlock = (block: ContentBlock, key: string) => {
		switch (block.type) {
			case "heading":
				return (
					<Text key={key} style={styles.heading} minPresenceAhead={36}>
						<Text style={styles.sectionNo}>§{block.sectionNo} </Text>
						<Inline html={block.html} />
					</Text>
				);
			case "paragraph":
				return (
					<Text
						key={key}
						style={[styles.paragraph, block.bold ? { fontWeight: 700 } : {}]}
					>
						<Inline html={block.html} />
					</Text>
				);
			case "list":
				return (
					<View key={key} style={styles.list}>
						{block.items.map((item, j) => (
							<View
								// biome-ignore lint/suspicious/noArrayIndexKey: static, never reordered
								key={j}
								style={styles.listItem}
								wrap={false}
							>
								<Text style={styles.bullet}>•</Text>
								<Text style={styles.listText}>
									<Inline html={item} />
								</Text>
							</View>
						))}
					</View>
				);
			case "figure":
				return <SingleFigure key={key} {...embedded(block.figure)} />;
			default: // "gallery"
				return <Gallery key={key} figures={block.figures.map(embedded)} />;
		}
	};
	return (
		<>
			{layoutBlocks(blocks, images).map((item, i) => {
				const key = `item-${i}`;
				if (item.kind === "block") return renderBlock(item.block, key);
				return (
					<View key={key} wrap={false}>
						{item.lead && renderBlock(item.lead, `${key}-lead`)}
						<View style={styles.sideRow}>
							<View style={styles.sideText}>
								{item.text.map((block, j) => renderBlock(block, `${key}-${j}`))}
							</View>
							<SingleFigure
								{...embedded(item.figure)}
								maxWidth={SIDE_MAX_WIDTH}
								maxHeight={item.maxHeight}
								placement={styles.sideFigure}
							/>
						</View>
					</View>
				);
			})}
		</>
	);
}

function ProjectDocument({
	project,
	blocks,
	trailingFigures,
	images,
	logo,
}: {
	readonly project: Project;
	readonly blocks: ContentBlock[];
	readonly trailingFigures: ProjectFigure[];
	readonly images: Map<string, LoadedImage | undefined>;
	readonly logo: Buffer;
}) {
	const metrics = Object.entries(project.metrics ?? {});
	const hero = project.images?.hero
		? images.get(project.images.hero)
		: undefined;
	return (
		<Document
			title={project.title}
			author="Mason Matich"
			subject={project.description}
			creator="kc3wny.com"
			producer="kc3wny.com"
		>
			<Page size="LETTER" style={styles.page}>
				<View style={styles.content}>
					<View style={styles.masthead}>
						<Image
							src={{ data: logo, format: "png" }}
							style={{ height: 22, width: (22 * 1372) / 258 }}
						/>
						<View>
							<Text style={styles.mhTag}>Grid CM87 · Mason Matich</Text>
							<Text style={styles.mhLoc}>
								Stanford, California · Ext. Class
							</Text>
						</View>
					</View>
					<View style={styles.rule} />
					<View style={styles.titleBlock}>
						<View style={styles.titleText}>
							<Text style={styles.title}>{project.title}</Text>
							<Text style={styles.byline}>{project.description}</Text>
							<Text style={styles.meta}>
								Published {formatDate(parseLocalDate(project.publishedAt))} ·
								Last updated {formatDate(new Date(project.updatedAt))}
							</Text>
						</View>
						{hero && (
							<SingleFigure
								id="hero"
								image={hero}
								label=""
								captionHtml=""
								maxWidth={HERO_MAX_WIDTH}
								maxHeight={HERO_MAX_HEIGHT}
								placement={{}}
							/>
						)}
					</View>
					<View style={styles.rule} />

					{project.award && (
						<Text style={styles.award}>
							<Text style={styles.awardTag}> AWARD </Text> {project.award}
						</Text>
					)}

					{metrics.length > 0 && (
						<View wrap={false}>
							<Text style={styles.tableCaption}>Specifications</Text>
							<View style={styles.table}>
								{metrics.map(([key, value], i) => (
									<View
										key={key}
										style={[styles.tableRow, i > 0 ? styles.tableRowRule : {}]}
									>
										<Text style={styles.tableKey}>{key}</Text>
										<Text style={styles.tableValue}>{value}</Text>
									</View>
								))}
							</View>
						</View>
					)}

					<Body blocks={blocks} images={images} />

					{trailingFigures.length > 0 && (
						<>
							<Text style={styles.heading} minPresenceAhead={36}>
								Figures
							</Text>
							<Gallery
								figures={trailingFigures.map((figure) => ({
									id: figure.id,
									image: images.get(figure.src),
									label: figure.id,
									// The web gallery shows these captions as plain text, not markdown.
									captionHtml: figure.caption
										.replaceAll("&", "&amp;")
										.replaceAll("<", "&lt;"),
								}))}
							/>
						</>
					)}

					<Text style={styles.legal}>
						Copyright © 2005–{buildInfo.commitYear} Mason Matich. All rights
						reserved. · 73 KC3WNY
					</Text>
				</View>

				<Text style={styles.footerLeft} fixed>
					{project.title} · kc3wny.com/projects/{project.slug}
				</Text>
				<Text
					style={styles.footerRight}
					fixed
					render={({ pageNumber, totalPages }) =>
						`${pageNumber} / ${totalPages}`
					}
				/>
			</Page>
		</Document>
	);
}

/** Parses the project, loads and downscales its images, and returns the document element. */
export async function buildProjectPdf(project: Project) {
	const { blocks, embeddedFigureIds } = parseProjectContent(
		project.content,
		project.images?.figures,
	);
	const trailingFigures = (project.images?.figures ?? []).filter(
		(figure) => !embeddedFigureIds.has(figure.id),
	);

	const wanted = new Map<string, number>();
	const want = (src: string | undefined, px: number) => {
		if (src) wanted.set(src, Math.max(wanted.get(src) ?? 0, px));
	};
	want(project.images?.hero, SINGLE_IMAGE_PX);
	for (const block of blocks) {
		if (block.type === "figure") want(block.figure.src, SINGLE_IMAGE_PX);
		if (block.type === "gallery") {
			for (const f of block.figures) want(f.src, THUMB_IMAGE_PX);
		}
	}
	for (const f of trailingFigures) want(f.src, THUMB_IMAGE_PX);

	const [logo, ...loaded] = await Promise.all([
		loadLogo(),
		...[...wanted].map(([src, px]) => loadImage(src, px)),
	]);
	const images = new Map([...wanted.keys()].map((src, i) => [src, loaded[i]]));

	return (
		<ProjectDocument
			project={project}
			blocks={blocks}
			trailingFigures={trailingFigures}
			images={images}
			logo={logo}
		/>
	);
}
