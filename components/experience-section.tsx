import { SectionHeading } from "@/components/section-heading";

type WorkExperience = {
	role: string;
	org: string;
	location: string;
	duration: string;
	description: string;
};

type ProjectExperience = {
	name: string;
	org: string;
	location: string;
	type: string;
	duration: string;
	description: string;
};

type ExperienceSectionProps = {
	readonly num: number;
	readonly workData: WorkExperience[];
	readonly projectData: ProjectExperience[];
};

export function ExperienceSection({
	num,
	workData,
	projectData,
}: ExperienceSectionProps) {
	return (
		<>
			<SectionHeading
				num={num}
				title="Experience & Leadership"
				id="experience"
			/>

			<h3 className="sub">Work Experience</h3>
			{workData.map((job) => (
				<div key={job.role} className="entry">
					<span className="dates">{job.duration}</span>
					<div className="role">{job.role}</div>
					<div className="org">
						{job.org} — {job.location}
					</div>
					<p>{job.description}</p>
				</div>
			))}

			<h3 className="sub">Project Leadership</h3>
			{projectData.map((project) => (
				<div key={project.name} className="entry">
					<span className="dates">{project.duration}</span>
					<div className="role">{project.name}</div>
					<div className="org">
						{project.org} — {project.location}
					</div>
					<p>{project.description}</p>
				</div>
			))}
		</>
	);
}
