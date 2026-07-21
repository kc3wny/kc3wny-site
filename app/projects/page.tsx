import Link from "next/link"
import { DocumentWrapper } from "@/components/document-wrapper"
import { getAllProjects } from "@/lib/projects"
import { DocumentFooter } from "@/components/document-footer"
import { parseLocalDate } from "@/lib/utils"

export const metadata = {
  title: "PROJECT INDEX // M. Matich",
  description: "Project index and catalog",
  openGraph: {
    title: "PROJECT INDEX // M. Matich",
    description: "Project index and catalog",
    type: "website",
    url: "https://kc3wny.com/projects",
    images: [
      {
        url: "https://kc3wny.com/api/og",
      },
    ],
  },
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo/favicon-light.svg",
        href: "/logo/favicon-light.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo/favicon-dark.svg",
        href: "/logo/favicon-dark.svg",
      },
    ],
  },
}

export default function ProjectsPage() {
  const projects = getAllProjects()

  return (
    <DocumentWrapper current="Projects">
      <hr />

      <h1 className="mh-call" style={{ fontSize: "30px", margin: "6px 0 2px" }}>
        Project Index
      </h1>
      <p className="byline">A chronological list of projects I&rsquo;ve worked on. {projects.length} entries.</p>

      <hr />

      <ul className="tree">
        {projects.map((project) => (
          <li key={project.slug}>
            <b>
              <Link href={`/projects/${project.slug}`}>{project.title}</Link>
            </b>
            {project.isNew && <span className="new">NEW</span>}
            {project.award && <span className="tag award">{project.award}</span>}
            <ul>
              <li className="note">
                {parseLocalDate(project.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })}{" "}
                · {project.type} — {project.description}
              </li>
            </ul>
          </li>
        ))}
      </ul>

      <DocumentFooter webring />
    </DocumentWrapper>
  )
}
