import { notFound } from "next/navigation"
import DOMPurify from "isomorphic-dompurify"
import parse from "html-react-parser"
import { DocumentWrapper } from "@/components/document-wrapper"
import { getAllProjects, getProjectBySlug, type ProjectFigure } from "@/lib/projects"
import { DocumentFooter } from "@/components/document-footer"
import { buildInfo } from "@/lib/build-info"
import { TechnicalFigureLightbox } from "@/components/technical-figure-lightbox"
import { FigureLinkHandler } from "@/components/figure-link-handler"
import { ProjectHeroImage } from "@/components/project-hero-image"
import { parseLocalDate } from "@/lib/utils"

export function generateStaticParams() {
  const projects = getAllProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

/**
 * Component for rendering sanitized HTML content as React elements.
 * Uses DOMPurify to sanitize and html-react-parser to convert to React elements.
 */
function SanitizedHtmlContent({ html, className }: { html: string; className?: string }) {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_ATTR: ["class", "target", "rel"],
  })
  return <div className={className}>{parse(sanitizedHtml)}</div>
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
        {
          media: '(prefers-color-scheme: light)',
          url: '/logo/favicon-light.svg',
          href: '/logo/favicon-light.svg',
        },
        {
          media: '(prefers-color-scheme: dark)',       
          url: '/logo/favicon-dark.svg',
          href: '/logo/favicon-dark.svg',
        },
      ],
    },
  }
}

const parseCache = new Map<string, string>()

function parseInlineMarkdown(text: string, figures?: ProjectFigure[]): string {
  // Store links temporarily to protect them from other parsing
  const links: string[] = []
  text = text.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, linkText, url) => {
    const placeholder = `§§§LINK${links.length}§§§`
    links.push(`<a href="${url}" class="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">${linkText}</a>`)
    return placeholder
  })

  // Parse figure references (FIG-XXX) and link to the figure
  if (figures && figures.length > 0) {
    text = text.replaceAll(/\b(FIG-\d{3})\b/g, (_match, figId) => {
      const figure = figures.find(f => f.id === figId)
      if (figure) {
        const placeholder = `§§§LINK${links.length}§§§`
        links.push(`<a href="#${figId}" class="font-mono text-sm text-primary hover:underline">${figId}</a>`)
        return placeholder
      }
      return figId
    })
  }
  
  // Parse bold **text** (but not if it's part of a link placeholder)
  text = text.replaceAll(/\*\*([^*]+)\*\*/g, '<strong class="font-sans font-bold">$1</strong>')
  
  // Parse italic *text* or _text_
  text = text.replaceAll(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
  text = text.replaceAll(/_([^_]+)_/g, '<em class="italic">$1</em>')
  
  // Parse inline code `code`
  text = text.replaceAll(/`([^`]+)`/g, '<code class="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">$1</code>')
  
  // Restore links
  links.forEach((link, index) => {
    text = text.replace(`§§§LINK${index}§§§`, link)
  })
  
  return text
}

function parseBulletLine(line: string, figures?: ProjectFigure[]): string | null {
  const bulletRegex = /- \*\*(.+?)\*\*:?\s*(.*)/
  const match = bulletRegex.exec(line)
  if (match) {
    const rest = match[2] ? `: <span class="font-serif text-lg">${parseInlineMarkdown(match[2], figures)}</span>` : ""
    return `<div class="flex gap-2 mb-2"><span class="font-sans font-bold text-primary">▸</span><span><strong class="font-sans text-lg">${parseInlineMarkdown(match[1], figures)}</strong>${rest}</span></div>`
  }
  return null
}

function parseNumberedLine(line: string, figures?: ProjectFigure[]): string | null {
  const numberCheckRegex = /^\d+\.\s+\*\*/
  if (!numberCheckRegex.exec(line)) return null
  
  const numberedRegex = /^\d+\.\s+\*\*(.+?)\*\*\s*—?\s*(.*)/
  const match = numberedRegex.exec(line)
  if (match) {
    const numMatch = /^\d+/.exec(line)
    const rest = match[2] ? ` — <span class="font-serif text-muted-foreground text-lg">${parseInlineMarkdown(match[2], figures)}</span>` : ""
    return `<div class="flex gap-3 mb-3 pl-4 border-l-2 border-muted"><span class="font-mono text-primary text-sm font-bold">${numMatch?.[0]}.</span><span><strong class="font-sans text-lg">${parseInlineMarkdown(match[1], figures)}</strong>${rest}</span></div>`
  }
  return null
}

function parseMarkdownContent(content: string, figures?: ProjectFigure[]): string {
  const cacheKey = `${content}_${figures?.map(f => f.id).join(',') || ''}`
  const cached = parseCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const result = content
    .split("\n")
    .map((line) => {
      if (line.startsWith("## ")) {
        const headerText = parseInlineMarkdown(line.slice(3), figures)
        return `<h2 class="text-xl font-sans font-bold uppercase tracking-[0.05em] mt-10 mb-4 flex items-center gap-3"><span class="w-8 h-[2px] bg-primary"></span>${headerText}</h2>`
      }
      if (line.startsWith("- **")) {
        const parsed = parseBulletLine(line, figures)
        if (parsed) return parsed
      }
      const numberedResult = parseNumberedLine(line, figures)
      if (numberedResult) return numberedResult
      if (line.trim() === "") return "<div class='h-4'></div>"
      if (line.startsWith("**") && line.endsWith("**")) {
        return `<p class="font-sans font-bold text-primary mb-4 text-lg">${parseInlineMarkdown(line.slice(2, -2), figures)}</p>`
      }
      return `<p class="font-serif leading-relaxed mb-4 text-foreground/90 text-lg">${parseInlineMarkdown(line, figures)}</p>`
    })
    .join("")

  parseCache.set(cacheKey, result)
  return result
}

export default async function ProjectPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const allProjects = getAllProjects()
  const currentIndex = allProjects.findIndex((p) => p.slug === slug)
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null

  const contentHtml = parseMarkdownContent(project.content, project.images?.figures)
  
  const publishedDate = parseLocalDate(project.publishedAt)
  const pubYear = publishedDate.getFullYear()

  return (
    <DocumentWrapper
      documentNo={`PRJ-${pubYear}-${slug.toUpperCase()}-${buildInfo.revision}`}
      backLink={{ href: "/projects", label: "Return to Index" }}
    >
      {/* Project header */}
      <div className="border-2 border-foreground mb-8">
        <div className="bg-foreground text-card px-4 py-2 flex justify-between items-center">
          <span className="font-mono text-sm font-bold">{project.sectionId}</span>
          <span className="text-[9px] tracking-[0.2em] uppercase">{project.type}</span>
        </div>
        <div className="p-6">
          <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight uppercase mb-2">{project.title}</h1>
          <p className="font-serif italic text-muted-foreground text-lg">{project.description}</p>
          {project.award && (
            <div className="mt-4 border-2 border-primary">
              <div className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-2">
                <span className="text-[9px] tracking-[0.2em] uppercase">Recognition</span>
              </div>
              <div className="px-3 py-2">
                <span className="font-mono text-sm text-foreground">{project.award}</span>
              </div>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-dashed border-muted flex flex-wrap gap-6 text-[10px] tracking-[0.15em] font-sans uppercase text-muted-foreground">
            <span>
              Published:{" "}
              <span className="font-mono text-foreground">
                {publishedDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </span>
            <span>
              Classification: <span className="font-mono text-foreground">PUBLIC</span>
            </span>
          </div>
        </div>
      </div>

      {project.images?.hero && (
        <ProjectHeroImage
          src={project.images.hero}
          alt={`${project.title} project overview`}
          sectionId={project.sectionId}
        />
      )}

      {/* Metrics panel */}
      {project.metrics && Object.keys(project.metrics).length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(project.metrics).map(([key, value]) => (
            <div key={key} className="border-2 border-foreground p-4 text-center">
              <div className="font-mono text-2xl font-bold text-primary">{value}</div>
              <div className="text-[9px] tracking-[0.2em] font-sans uppercase text-muted-foreground">{key}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <FigureLinkHandler figures={project.images?.figures || []}>
        <SanitizedHtmlContent html={contentHtml} className="prose prose-sm max-w-none" />
      </FigureLinkHandler>

      {project.images?.figures && project.images.figures.length > 0 && (
        <div className="mt-12 pt-8 border-t-2 border-foreground">
          <h2 className="text-lg font-sans font-bold uppercase tracking-[0.05em] mb-6 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-primary" />{" "}
            Technical Figures
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {project.images.figures.map((figure) => (
              <TechnicalFigureLightbox key={figure.id} figure={figure} />
            ))}
          </div>
        </div>
      )}

      <DocumentFooter
        documentControl={`PRJ-${slug.toUpperCase().slice(0, 8)}-${buildInfo.revision}`}
        lastUpdated={publishedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }).toUpperCase()}
        navigation={{
          prev: prevProject ? { href: `/projects/${prevProject.slug}`, title: prevProject.title } : undefined,
          next: nextProject ? { href: `/projects/${nextProject.slug}`, title: nextProject.title } : undefined,
        }}
      />
    </DocumentWrapper>
  )
}
