/**
 * Client-safe image utilities.
 * These utilities can be used in both client and server components.
 */

export type ImageMetadata = {
  width: number
  height: number
  blurDataUrl: string
}

/**
 * Extract the content path from an API image URL.
 * This is the client-safe version that doesn't import Node.js modules.
 */
export function getContentPathFromSrc(src: string): string | null {
  if (src.startsWith('/api/content-image')) {
    try {
      const url = new URL(src, 'http://localhost')
      return url.searchParams.get('path')
    } catch {
      return null
    }
  }
  return null
}
