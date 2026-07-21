import { notFound } from "next/navigation"
import Image from "next/image"
import DOMPurify from "isomorphic-dompurify"
import parse from "html-react-parser"
import { DocumentWrapper } from "@/components/document-wrapper"
import { getAllProjects, getProjectBySlug, type ProjectFigure } from "@/lib/projects"
import { DocumentFooter } from "@/components/document-footer"
import { parseLocalDate } from "@/lib/utils"

export function generateStaticParams() {
  const projects = getAllProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

function SanitizedHtmlContent({ html }: { html: string }) {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_ATTR: ["class", "target", "rel", "id", "href"],
  })
  return <>{parse(sanitizedHtml)}</>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return { title: "Project Not Found" }
  return {
    title: `${project.title}`,
    description: project.description,
    openGraph: {
      title: `${project.title}`,
      description: project.description,
      type: "article",
      publishedTime: project.publishedAt,
      url: `https://kc3wny.com/projects/${project.slug}`,
      images: [
        {
          url: project.images?.hero
            ? `https://kc3wny.com${project.images.hero}`
            : "https://kc3wny.com/api/og",
        },
      ],
    },
    icons: {
      icon: [
        { media: "(prefers-color-scheme: light)", url: "/logo/favicon-light.svg", href: "/logo/favicon-light.svg" },
        { media: "(prefers-color-scheme: dark)", url: "/logo/favicon-dark.svg", href: "/logo/favicon-dark.svg" },
      ],
    },
  }
}

type ParsedContent = { html: string; embeddedFigureIds: Set<string> }

const parseCache = new Map<string, ParsedContent>()

/** Figure ids referenced by a line, in order, deduped, restricted to known figures. */
function extractFigureIds(line: string, figureById: Map<string, ProjectFigure>): string[] {
  const seen = new Set<string>()
  const ids: string[] = []
  for (const match of line.matchAll(/\bFIG-\d{3}\b/g)) {
    const id = match[0]
    if (figureById.has(id) && !seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  }
  return ids
}

function parseInlineMarkdown(
  text: string,
  figureById: Map<string, ProjectFigure>,
  photoNumberOf: (id: string) => number,
): string {
  const links: string[] = []
  text = text.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, linkText, url) => {
    const placeholder = `§§§LINK${links.length}§§§`
    links.push(`<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`)
    return placeholder
  })

  text = text.replaceAll(/\b(FIG-\d{3})\b/g, (_match, figId) => {
    if (figureById.has(figId)) {
      const placeholder = `§§§LINK${links.length}§§§`
      links.push(`<a href="#${figId}" class="tt">Photo ${photoNumberOf(figId)}</a>`)
      return placeholder
    }
    return figId
  })

  text = text.replaceAll(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
  text = text.replaceAll(/\*([^*]+)\*/g, "<i>$1</i>")
  text = text.replaceAll(/_([^_]+)_/g, "<i>$1</i>")
  text = text.replaceAll(/`([^`]+)`/g, '<span class="tt">$1</span>')

  links.forEach((link, index) => {
    text = text.replace(`§§§LINK${index}§§§`, link)
  })

  return text
}

/**
 * Markdown → retro HTML. `## ` headings become §-numbered, citable sections.
 *
 * Figures cited inline (`(FIG-004)`, `[FIG-005, FIG-006]`, bare `FIG-010`, …)
 * are embedded as actual images immediately after the paragraph that cites
 * them — grouped into a two-up `.gallery` when a paragraph cites more than
 * one — instead of only linking down to a gallery at the bottom of the page.
 * Each figure is embedded once, at its first citation. Any figures never
 * cited in the body are left for the caller to render in a trailing gallery.
 */
function parseMarkdownContent(content: string, figures?: ProjectFigure[]): ParsedContent {
  const cacheKey = `${content}_${figures?.map((f) => `${f.id}:${f.src}:${f.caption}`).join(",") || ""}`
  const cached = parseCache.get(cacheKey)
  if (cached) return cached

  const figureById = new Map((figures ?? []).map((f) => [f.id, f]))
  const photoNumberById = new Map<string, number>()
  let nextPhotoNumber = 1
  const photoNumberOf = (id: string): number => {
    let n = photoNumberById.get(id)
    if (n === undefined) {
      n = nextPhotoNumber++
      photoNumberById.set(id, n)
    }
    return n
  }

  const embeddedFigureIds = new Set<string>()
  const renderFigure = (id: string, wide: boolean): string => {
    const figure = figureById.get(id)
    if (!figure) return ""
    embeddedFigureIds.add(id)
    const caption = parseInlineMarkdown(figure.caption, figureById, photoNumberOf)
    return `<figure class="snap${wide ? " wide" : ""}" id="${id}"><img src="${figure.src}" alt="${figure.caption.replace(/"/g, "&quot;")}" /><figcaption><b>Photo ${photoNumberOf(id)}.</b> ${caption}</figcaption></figure>`
  }
  const renderEmbeds = (ids: string[]): string => {
    const fresh = ids.filter((id) => !embeddedFigureIds.has(id))
    if (fresh.length === 0) return ""
    if (fresh.length === 1) return renderFigure(fresh[0], true)
    return `<div class="gallery">${fresh.map((id) => renderFigure(id, false)).join("")}</div>`
  }

  let sectionNo = 0
  const bullets: string[] = []

  const flushBullets = (): string => {
    if (bullets.length === 0) return ""
    const list = `<ul class="disc">${bullets.join("")}</ul>`
    bullets.length = 0
    return list
  }

  const out: string[] = []
  for (const line of content.split("\n")) {
    const bulletMatch = /^- (.*)/.exec(line)
    if (bulletMatch) {
      bullets.push(`<li>${parseInlineMarkdown(bulletMatch[1], figureById, photoNumberOf)}</li>`)
      continue
    }
    out.push(flushBullets())

    if (line.startsWith("## ")) {
      sectionNo += 1
      const id = `s${sectionNo}`
      const headerText = parseInlineMarkdown(line.slice(3), figureById, photoNumberOf)
      out.push(
        `<h2 class="sec" id="${id}"><a class="anchor" href="#${id}">§${sectionNo}</a>${headerText}</h2>`,
      )
    } else if (line.trim() === "") {
      // paragraph break — nothing to emit
    } else if (line.startsWith("**") && line.endsWith("**")) {
      out.push(`<p><b>${parseInlineMarkdown(line.slice(2, -2), figureById, photoNumberOf)}</b></p>`)
      out.push(renderEmbeds(extractFigureIds(line, figureById)))
    } else {
      out.push(`<p>${parseInlineMarkdown(line, figureById, photoNumberOf)}</p>`)
      out.push(renderEmbeds(extractFigureIds(line, figureById)))
    }
  }
  out.push(flushBullets())

  const result: ParsedContent = { html: out.join(""), embeddedFigureIds }
  parseCache.set(cacheKey, result)
  return result
}

export default async function ProjectPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const { html: contentHtml, embeddedFigureIds } = parseMarkdownContent(project.content, project.images?.figures)
  const publishedDate = parseLocalDate(project.publishedAt)
  const updatedDate = new Date(project.updatedAt)
  // Figures already embedded inline (via FIG-XXX citations in the body) are left out here to avoid duplicates.
  const figures = (project.images?.figures ?? []).filter((figure) => !embeddedFigureIds.has(figure.id))

  return (
    <DocumentWrapper current="Projects">
      <p className="small">
        <a href="/projects">Projects</a> &raquo; <b>{project.title}</b>
      </p>

      <hr />

      <h1 className="mh-call" style={{ fontSize: "34px", margin: "6px 0 2px" }}>
        {project.title}
      </h1>
      <p className="byline">{project.description}</p>
      <p className="small">
        Published{" "}
        {publishedDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        {" · "}
        Last updated{" "}
        {updatedDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
      </p>

      <hr />

      {project.award && (
        <p>
          <span className="tag award">Award</span> {project.award}
        </p>
      )}

      {/* Specifications */}
      {project.metrics && Object.keys(project.metrics).length > 0 && (
        <table className="grid">
          <caption>Specifications</caption>
          <tbody>
            {Object.entries(project.metrics).map(([key, value]) => (
              <tr key={key}>
                <td className="k">{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Hero photo */}
      {project.images?.hero && (
        <figure className="snap wide">
          <Image
            src={project.images.hero}
            alt={`${project.title} — overview`}
            width={1200}
            height={800}
          />
        </figure>
      )}

      {/* Markdown body */}
      <SanitizedHtmlContent html={contentHtml} />

      {/* Figure gallery */}
      {figures.length > 0 && (
        <>
          <h2 className="sec">Figures</h2>
          <div className="gallery">
            {figures.map((figure) => (
              <figure className="snap" id={figure.id} key={figure.id}>
                <Image src={figure.src} alt={figure.caption} width={800} height={600} />
                <figcaption>
                  <b>{figure.id}</b> {figure.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}

      <DocumentFooter
        backLinks={[
          { href: "/projects", title: "« Back to Project Index" },
          { href: "/", title: "Home" },
        ]}
      />
    </DocumentWrapper>
  )
}
