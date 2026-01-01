"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, Loader2 } from "lucide-react"
import type { ProjectFigure } from "@/lib/projects"
import { getContentPathFromSrc, type ImageMetadata } from "@/lib/image-utils"

type TechnicalFigureModalProps = {
  figure: ProjectFigure
  isOpen: boolean
  onClose: () => void
}

export function TechnicalFigureModal({ figure, isOpen, onClose }: Readonly<TechnicalFigureModalProps>) {
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Compute fullResSrc based on figure.src
  const contentPath = getContentPathFromSrc(figure.src)
  const initialFullResSrc = contentPath ? null : figure.src
  const [fullResSrc, setFullResSrc] = useState<string | null>(initialFullResSrc)

  // Reset loading state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Use a cleanup pattern instead of setting state in effect body
      return () => {
        setIsLoading(true)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Load full resolution image when modal opens
  useEffect(() => {
    if (!isOpen || !contentPath) return

    // Fetch metadata for blur placeholder
    fetch(`/api/content-image?path=${encodeURIComponent(contentPath)}&mode=blur`)
      .then(res => res.json())
      .then((data: ImageMetadata) => {
        setMetadata(data)
        // Set full resolution source
        setFullResSrc(`/api/content-image?path=${encodeURIComponent(contentPath)}&mode=full`)
      })
      .catch(err => {
        console.error('Failed to load image metadata:', err)
        setFullResSrc(figure.src)
      })
  }, [isOpen, figure.src, contentPath])

  if (!isOpen) return null

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 animate-in fade-in duration-200 w-full h-full max-w-none max-h-none m-0"
      aria-modal="true"
      aria-labelledby={`figure-${figure.id}-title`}
    >
      {/* Backdrop button for click-to-close */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default bg-transparent"
        onClick={onClose}
        aria-label="Close modal"
      />
      <section 
        className="relative max-w-fit max-h-[90vh] flex flex-col mx-auto z-10"
        aria-labelledby={`figure-${figure.id}-title`}
      >
        {/* Header */}
        <div className="bg-foreground text-card border-2 border-foreground mb-2 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span id={`figure-${figure.id}-title`} className="font-mono text-sm font-bold">{figure.id}</span>
            <span className="text-[9px] tracking-[0.2em] uppercase">Technical Figure</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-card/20 p-1 rounded transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Container */}
        <div className="border-2 border-foreground bg-muted/30 p-4 relative min-h-[200px] flex items-center justify-center">
          {/* Blur placeholder background */}
          {metadata?.blurDataUrl && isLoading && (
            <div 
              className="absolute inset-4 bg-cover bg-center blur-md scale-110"
              style={{ backgroundImage: `url(${metadata.blurDataUrl})` }}
            />
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          
          {/* Full resolution image */}
          {fullResSrc && (
            <Image
              src={fullResSrc}
              alt={figure.caption}
              width={metadata?.width || 1920}
              height={metadata?.height || 1080}
              quality={95}
              className={`max-w-[85vw] max-h-[70vh] w-auto h-auto object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              sizes="85vw"
              priority
              onLoad={() => setIsLoading(false)}
              unoptimized // We're handling optimization in our API
            />
          )}
        </div>

        {/* Caption */}
        <div className="bg-foreground text-card border-2 border-foreground border-t-0 px-4 py-3">
          <p className="font-serif italic text-sm">{figure.caption}</p>
        </div>
      </section>
    </dialog>
  )
}
