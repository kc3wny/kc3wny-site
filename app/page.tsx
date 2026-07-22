import { DocumentWrapper } from "@/components/document-wrapper";
import { DocumentFooter } from "@/components/document-footer";
import { ProjectsSection } from "@/components/projects-section";
import { BiographySection } from "@/components/biography-section";
import { ExperienceSection } from "@/components/experience-section";
import { SkillsSection } from "@/components/skills-section";
import { ProfessionalMembershipsSection } from "@/components/professional-memberships-section";
import { ContactSection } from "@/components/contact-section";
import { getHomeContent } from "@/lib/home";
import { VisitorCounter } from "@/components/visitor-counter";

export default function Home() {
	const content = getHomeContent();
	const {
		biography,
		skills,
		workExperience,
		projectExperience,
		memberships,
		contact,
		updatedAt,
	} = content;
	const updatedDate = new Date(updatedAt);

	return (
		<DocumentWrapper current="Home">
			<hr />

			{/* Status line — last updated + hit counter */}
			<div className="statusline">
				<span>
					Last updated:{" "}
					{updatedDate.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
					})}
				</span>
				<span className="counter">
					You are visitor no. <VisitorCounter />
				</span>
			</div>

			<hr />

			{/* Welcome / lead */}
			<p className="lead">
				{biography.intro.split(/(Mason Matich)/).map((part, i) =>
					part === "Mason Matich" ? (
						// biome-ignore lint/suspicious/noArrayIndexKey: static text split, order never changes
						<b key={i}>{part}</b>
					) : (
						part
					),
				)}
			</p>

			<ProjectsSection num={1} />
			<BiographySection num={2} data={biography} />
			<ExperienceSection
				num={3}
				workData={workExperience}
				projectData={projectExperience}
			/>
			<SkillsSection num={4} data={skills} />
			<ProfessionalMembershipsSection num={5} data={memberships} />
			<ContactSection num={6} data={contact} />

			<DocumentFooter webring />
		</DocumentWrapper>
	);
}
