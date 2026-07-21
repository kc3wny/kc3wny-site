import { DocumentWrapper } from "@/components/document-wrapper";
import { DocumentFooter } from "@/components/document-footer";
import { ProjectsSection } from "@/components/projects-section";
import { BiographySection } from "@/components/biography-section";
import { ExperienceSection } from "@/components/experience-section";
import { SkillsSection } from "@/components/skills-section";
import { ProfessionalMembershipsSection } from "@/components/professional-memberships-section";
import { ContactSection } from "@/components/contact-section";
import { buildInfo } from "@/lib/build-info";
import { getHomeContent } from "@/lib/home";

export default function Home() {
	const content = getHomeContent();
	const {
		biography,
		skills,
		workExperience,
		projectExperience,
		memberships,
		contact,
	} = content;

	return (
		<DocumentWrapper current="Home">
			<hr />

			{/* Status line — last updated + hit counter */}
			<div className="statusline">
				<span>Last updated: {buildInfo.buildDate}</span>
				<span className="counter">
					You are visitor no. <span className="odo">0042571</span>
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
