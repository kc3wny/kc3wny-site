"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { ProjectFigure } from "@/lib/projects"
import { getContentPathFromSrc, type ImageMetadata } from "@/lib/image-utils"

type TechnicalFigureThumbnailProps = {
  figure: ProjectFigure
  onClick: () => void
}

export function TechnicalFigureThumbnail({ figure, onClick }: Readonly<TechnicalFigureThumbnailProps>) {
  const contentPath = getContentPathFromSrc(figure.src)
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  // Initialize thumbnail source: use original for non-content images, null for content images (will load via API)
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(
    contentPath ? null : figure.src
  )

  useEffect(() => {
    if (!contentPath) {
      // Non-content images already have thumbnailSrc set
      return
    }

    // Fetch blur metadata for content images
    fetch(`/api/content-image?path=${encodeURIComponent(contentPath)}&mode=blur`)
      .then(res => res.json())
      .then((data: ImageMetadata) => {
        setMetadata(data)
        // Set thumbnail source after we have metadata
        setThumbnailSrc(`/api/content-image?path=${encodeURIComponent(contentPath)}&mode=thumbnail&width=500`)
      })
      .catch(err => {
        console.error('Failed to load image metadata:', err)
        // Fallback to original source
        setThumbnailSrc(figure.src)
      })
  }, [contentPath, figure.src])

  return (
    <button 
      type="button"
      className="border-2 border-foreground cursor-pointer hover:border-primary transition-colors group flex flex-col h-full text-left w-full" 
      onClick={onClick}
    >
      <div className="bg-muted/30 p-1 relative overflow-hidden flex-1 flex items-center justify-center">
        {/* Blur placeholder */}
        {metadata?.blurDataUrl && !isLoaded && (
          <div 
            className="absolute inset-1 bg-cover bg-center blur-sm scale-110"
            style={{ backgroundImage: `url(${metadata.blurDataUrl})` }}
          />
        )}
        
        {/* Thumbnail image */}
        {thumbnailSrc && (
          <Image
            src={thumbnailSrc}
            alt={figure.caption}
            width={metadata?.width || 500}
            height={metadata?.height || 300}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 500px"
            className={`w-full h-full object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
            unoptimized // We're handling optimization in our API
          />
        )}
        
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground px-4 py-2 text-xs font-mono tracking-wider uppercase">
            Click to Enlarge
          </span>
        </div>
      </div>
      <div className="bg-foreground/10 px-4 py-3 border-t-2 border-foreground">
        <div className="text-[9px] tracking-[0.2em] uppercase font-mono text-primary mb-1">{figure.id}</div>
        <p className="font-serif italic text-sm text-muted-foreground">{figure.caption}</p>
      </div>
    </button>
  )
}
