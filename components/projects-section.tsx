import Link from "next/link"
import { getRecentProjects } from "@/lib/projects"
import { SectionHeading } from "@/components/section-heading"
import { parseLocalDate } from "@/lib/utils"

type ProjectsSectionProps = {
  readonly num: number
}

/** Recent projects — a short bulleted list; full catalog lives at /projects. */
export function ProjectsSection({ num }: ProjectsSectionProps) {
  const projects = getRecentProjects(3)

  return (
    <>
      <SectionHeading num={num} title="Recent Projects" id="projects" />
      <ul className="disc">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={`/projects/${project.slug}`}>{project.title}</Link>
            {project.isNew && <span className="new">NEW</span>} — {project.description}{" "}
            <span className="small">
              (
              {parseLocalDate(project.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
              )
            </span>
          </li>
        ))}
      </ul>
      <p className="small">
        ☞ See all write-ups in the <Link href="/projects">Project Index</Link>.
      </p>
    </>
  )
}
