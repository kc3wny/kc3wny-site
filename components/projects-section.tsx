import Image from "next/image";
import Link from "next/link";
import { getProjectsByTitles } from "@/lib/projects";
import { SectionHeading } from "@/components/section-heading";
import { parseLocalDate } from "@/lib/utils";

type ProjectsSectionProps = {
	readonly num: number;
	readonly names: string[];
};

/** Selected projects — a short list with thumbnails; full catalog lives at /projects. */
export function ProjectsSection({ num, names }: ProjectsSectionProps) {
	const projects = getProjectsByTitles(names);

	return (
		<>
			<SectionHeading num={num} title="Selected Projects" id="projects" />
			<ul className="project-list">
				{projects.map((project) => (
					<li key={project.slug}>
						<Link
							href={`/projects/${project.slug}`}
							prefetch={false}
							className={
								project.images?.hero
									? "project-thumb"
									: "project-thumb placeholder"
							}
						>
							{project.images?.hero ? (
								<Image
									src={project.images.hero}
									alt={`${project.title} — thumbnail`}
									width={84}
									height={84}
								/>
							) : (
								"NO IMG"
							)}
						</Link>
						<div className="project-list-body">
							<Link href={`/projects/${project.slug}`} prefetch={false}>
								{project.title}
							</Link>
							{project.isNew && <span className="new">NEW</span>} —{" "}
							{project.description}{" "}
							<span className="medium">
								(
								<b>
									{parseLocalDate(project.publishedAt).toLocaleDateString(
										"en-US",
										{
											year: "numeric",
											month: "short",
										},
									)}
								</b>
								)
							</span>
						</div>
					</li>
				))}
			</ul>
			<p className="medium">
				☞ See all write-ups in the <Link href="/projects">Project Index</Link>.
			</p>
		</>
	);
}
