"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import { TechnicalFigureModal } from "./technical-figure-modal"
import type { ProjectFigure } from "@/lib/projects"

type FigureLinkHandlerProps = {
  figures: ProjectFigure[]
  children: ReactNode
}

export function FigureLinkHandler({ figures, children }: Readonly<FigureLinkHandlerProps>) {
  const [openFigure, setOpenFigure] = useState<ProjectFigure | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#FIG-"]')
      
      if (link) {
        e.preventDefault()
        const figureId = link.getAttribute('href')?.slice(1) // Remove the # prefix
        const figure = figures.find(f => f.id === figureId)
        if (figure) {
          setOpenFigure(figure)
        }
      }
    }

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [figures])

  return (
    <>
      <div ref={containerRef}>
        {children}
      </div>
      {openFigure && (
        <TechnicalFigureModal
          figure={openFigure}
          isOpen={true}
          onClose={() => setOpenFigure(null)}
        />
      )}
    </>
  )
}
