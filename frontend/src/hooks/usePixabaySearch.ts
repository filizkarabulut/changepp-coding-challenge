import { useCallback, useState } from 'react'
import type { SearchResult } from '@/types'

const PIXABAY_KEY = import.meta.env.VITE_PIXABAY_API_KEY as string | undefined

// Minimal shape of the Pixabay API response we care about.
interface PixabayHit {
  id: number
  tags: string
  webformatURL: string
  largeImageURL: string
  imageWidth: number
  imageHeight: number
}

/**
 * Build a set of demo results when no Pixabay key is configured, so the app is
 * fully usable out of the box. Uses Lorem Picsum (no key required); the query
 * seeds the images so results feel specific to the search term.
 */
function demoResults(query: string): SearchResult[] {
  return Array.from({ length: 12 }, (_, i) => {
    const seed = `${query.trim() || 'random'}-${i}`
    return {
      id: `demo-${seed}`,
      url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/700`,
      previewUrl: `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/450`,
      title: `${query.trim() || 'Random'} ${i + 1}`,
      source: 'picsum (demo)',
      width: 900,
      height: 700,
    }
  })
}

/**
 * Search an image provider (Pixabay when a key is set, otherwise demo images).
 * Returns the results plus loading/error state and a `search` function.
 */
export function usePixabaySearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const usingDemoData = !PIXABAY_KEY

  const search = useCallback(
    async (query: string) => {
      const trimmed = query.trim()
      setHasSearched(true)
      setLoading(true)
      setError(null)

      // No API key: serve demo images immediately.
      if (!PIXABAY_KEY) {
        setResults(demoResults(trimmed))
        setLoading(false)
        return
      }

      try {
        const params = new URLSearchParams({
          key: PIXABAY_KEY,
          q: trimmed,
          image_type: 'photo',
          per_page: '24',
          safesearch: 'true',
        })
        const res = await fetch(`https://pixabay.com/api/?${params.toString()}`)
        if (!res.ok) {
          throw new Error(`Pixabay request failed (${res.status})`)
        }
        const data = (await res.json()) as { hits: PixabayHit[] }
        setResults(
          data.hits.map((hit) => ({
            id: String(hit.id),
            url: hit.largeImageURL,
            previewUrl: hit.webformatURL,
            title: hit.tags,
            source: 'pixabay',
            width: hit.imageWidth,
            height: hit.imageHeight,
          }))
        )
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Image search failed'
        )
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { results, loading, error, hasSearched, usingDemoData, search }
}
