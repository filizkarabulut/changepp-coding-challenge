import type { GridImage, Image, SearchResult } from '@/types'

/** Normalize a saved collection image into the grid's display shape. */
export function toGridImage(image: Image): GridImage {
  return {
    key: image._id,
    previewUrl: image.url,
    fullUrl: image.url,
    title: image.title,
    source: image.source,
    width: image.width,
    height: image.height,
  }
}

/** Normalize a provider search result into the grid's display shape. */
export function searchResultToGridImage(result: SearchResult): GridImage {
  return {
    key: result.id,
    previewUrl: result.previewUrl,
    fullUrl: result.url,
    title: result.title,
    source: result.source,
    width: result.width,
    height: result.height,
  }
}
