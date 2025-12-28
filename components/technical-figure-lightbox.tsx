"use client"

import { useState } from "react"
import { TechnicalFigureThumbnail } from "./technical-figure-thumbnail"
import { TechnicalFigureModal } from "./technical-figure-modal"

type TechnicalFigure = {
  id: string
  src: string
  caption: string
}

type TechnicalFigureLightboxProps = {
  figure: TechnicalFigure
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
