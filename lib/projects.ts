import * as fs from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import { getFileUpdatedAt } from "@/lib/git";

export interface ProjectFigure {
	src: string;
	caption: string;
	id: string;
}

export interface Project {
	slug: string;
	title: string;
	type: string;
	description: string;
	publishedAt: string;
	/** ISO timestamp of the last git commit that touched this project's markdown file (falls back to filesystem mtime). */
	updatedAt: string;
	isNew?: boolean;
	award?: string;
	metrics: Record<string, string>;
	images: {
		hero: string;
		figures: ProjectFigure[];
	};
	content: string;
	sectionId: string;
	/** Short, unique, uppercase project code (from frontmatter `code`, else derived) */
	code: string;
	/** Unified document number — `YYYY.MM-CODE`, derived from publishedAt + code */
	docNumber: string;
}

const projectsDirectory = path.join(process.cwd(), "content");

/**
 * Derive a fallback project code from the slug when frontmatter omits `code`.
 * e.g. "site530-AREDN" → "AREDN", "orbital-dx270" → "ORBIT".
 */
function deriveCode(slug: string): string {
	const cleaned = slug.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
	return cleaned.slice(0, 5) || "PROJ";
}

/**
 * Build the unified document number for a project: `YYYY.MM-CODE`.
 * Because the date leads, document numbers sort in ascending post-date order;
 * the code keeps two projects published the same month unique.
 */
function makeDocNumber(publishedAt: string, code: string): string {
	const [year, month] = publishedAt.split("-");
	return `${year}.${month}-${code}`;
}

/**
 * Find all project directories and markdown files.
 * Supports both:
 * - Subdirectory structure: content/project-name/index.md
 * - Flat file structure: content/project-name.md (legacy)
 */
function findProjectFiles(): { slug: string; filePath: string }[] {
	const entries = fs.readdirSync(projectsDirectory, { withFileTypes: true });
	const projects: { slug: string; filePath: string }[] = [];

	for (const entry of entries) {
		if (entry.isDirectory()) {
			// Check for index.md in subdirectory
			const indexPath = path.join(projectsDirectory, entry.name, "index.md");
			if (fs.existsSync(indexPath)) {
				projects.push({ slug: entry.name, filePath: indexPath });
			}
		} else if (
			entry.isFile() &&
			entry.name.endsWith(".md") &&
			entry.name !== "home.md"
		) {
			// Legacy flat file structure (exclude home.md which is for the home page)
			projects.push({
				slug: entry.name.replace(/\.md$/, ""),
				filePath: path.join(projectsDirectory, entry.name),
			});
		}
	}

	return projects;
}

export function getAllProjects(): Project[] {
	const projectFiles = findProjectFiles();
	const projects = projectFiles
		.map(({ slug, filePath }) => {
			const fileContents = fs.readFileSync(filePath, "utf8");
			const { data, content } = matter(fileContents);

			const code: string = (data.code as string) || deriveCode(slug);

			return {
				slug,
				title: data.title,
				type: data.type,
				description: data.description,
				publishedAt: data.publishedAt,
				updatedAt: getFileUpdatedAt(filePath),
				isNew: data.new === true,
				award: data.award,
				metrics: data.metrics,
				images: {
					hero: data.heroImage,
					// `id` is optional in frontmatter — auto-numbered by position (FIG-001, FIG-002, …)
					// so adding a new figure doesn't require hand-computing the next zero-padded id.
					figures: (data.figures || []).map(
						(figure: ProjectFigure, index: number) => ({
							...figure,
							id: figure.id || `FIG-${String(index + 1).padStart(3, "0")}`,
						}),
					),
				},
				content,
				code,
				docNumber: makeDocNumber(data.publishedAt, code),
			};
		})
		.sort(
			(a, b) =>
				new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
		)
		.map((project, index) => ({
			...project,
			// Kept for backwards-compatibility; UI now leads with docNumber.
			sectionId: `PRJ-${String(index + 1).padStart(3, "0")}`,
		}))
		.reverse();

	return projects;
}

export function getRecentProjects(count = 3): Project[] {
	return getAllProjects().slice(0, count);
}

/** Look up projects by title (case-insensitive), in the given order. Unmatched names are skipped. */
export function getProjectsByTitles(titles: string[]): Project[] {
	const allProjects = getAllProjects();
	return titles
		.map((title) =>
			allProjects.find(
				(project) => project.title.toLowerCase() === title.toLowerCase(),
			),
		)
		.filter((project): project is Project => project !== undefined);
}

export function getProjectBySlug(slug: string): Project | undefined {
	return getAllProjects().find((project) => project.slug === slug);
}

export function getAllProjectSlugs(): string[] {
	return findProjectFiles().map(({ slug }) => slug);
}
