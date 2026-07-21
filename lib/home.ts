import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getFileUpdatedAt } from "@/lib/git";

export interface QuickFact {
	label: string;
	value: string;
}

export interface Biography {
	intro: string;
	summary: string;
	quickFacts: QuickFact[];
}

export interface Skill {
	category: string;
	items: string[];
}

export interface WorkExperience {
	role: string;
	org: string;
	location: string;
	duration: string;
	description: string;
}

export interface ProjectExperience {
	name: string;
	org: string;
	location: string;
	type: string;
	duration: string;
	description: string;
}

export interface Membership {
	name: string;
	fullName: string;
	logo: string;
}

export interface ContactChannel {
	protocol: string;
	address: string;
	href: string;
}

export interface HomeContent {
	title: string;
	biography: Biography;
	skills: Skill[];
	workExperience: WorkExperience[];
	projectExperience: ProjectExperience[];
	memberships: Membership[];
	contact: ContactChannel[];
	/** ISO timestamp of the last git commit that touched content/home.md (falls back to filesystem mtime). */
	updatedAt: string;
}

const homeContentPath = path.join(process.cwd(), "content", "home.md");

export function getHomeContent(): HomeContent {
	const fileContents = fs.readFileSync(homeContentPath, "utf8");
	const { data } = matter(fileContents);

	return {
		title: data.title,
		biography: data.biography,
		skills: data.skills,
		workExperience: data.workExperience,
		projectExperience: data.projectExperience,
		memberships: data.memberships,
		contact: data.contact,
		updatedAt: getFileUpdatedAt(homeContentPath),
	};
}
