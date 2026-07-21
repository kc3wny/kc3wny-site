import { DocumentWrapper } from "@/components/document-wrapper";
import { DocumentFooter } from "@/components/document-footer";
import { ProjectsSection } from "@/components/projects-section";
import { BiographySection } from "@/components/biography-section";
import { ExperienceSection } from "@/components/experience-section";
import { SkillsSection } from "@/components/skills-section";
import { ProfessionalMembershipsSection } from "@/components/professional-memberships-section";
import { ContactSection } from "@/components/contact-section";
import { getHomeContent } from "@/lib/home";
import { incrementVisitorCount } from "@/lib/visitor-count";

// The visitor counter increments on every request, so this page can't be
// statically prerendered — it needs to run server-side on each visit.
export const dynamic = "force-dynamic";

export default async function Home() {
	const content = getHomeContent();
	const visitorCount = await incrementVisitorCount();
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
					You are visitor no.{" "}
					<span className="odo">{String(visitorCount).padStart(7, "0")}</span>
				</span>
			</div>

			<hr />

			{/* Welcome / lead */}
			<p className="lead">{biography.intro}</p>

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
