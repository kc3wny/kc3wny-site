"use client"

import { useState } from "react"
import { TechnicalFigureThumbnail } from "./technical-figure-thumbnail"
import { TechnicalFigureModal } from "./technical-figure-modal"
import type { ProjectFigure } from "@/lib/projects"

type TechnicalFigureLightboxProps = {
  figure: ProjectFigure
}

export function TechnicalFigureLightbox({ figure }: Readonly<TechnicalFigureLightboxProps>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div id={figure.id} className="scroll-mt-24">
      <TechnicalFigureThumbnail figure={figure} onClick={() => setIsOpen(true)} />
      <TechnicalFigureModal figure={figure} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}
