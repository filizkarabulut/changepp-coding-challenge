import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Globe, Loader2 } from 'lucide-react'
import { ImageGrid } from '@/components/ImageGrid'
import { ImageModal } from '@/components/ImageModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fetchSharedCollection } from '@/lib/api'
import { toGridImage } from '@/lib/images'
import type { Collection, GridImage } from '@/types'

/**
 * Public, read-only view of a shared collection, reached via /share/:code.
 * No authentication and no save/remove actions.
 */
export function SharedCollectionPage() {
  const { code } = useParams<{ code: string }>()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<GridImage | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchSharedCollection(code ?? '')
      .then((data) => {
        if (!cancelled) setCollection(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'This shared collection could not be loaded.'
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [code])

  if (loading) {
    return (
      <div className="container flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Loading shared collection…</p>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div>
          <h1 className="text-xl font-semibold">Collection unavailable</h1>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {error ?? 'This share link is invalid or the collection is private.'}
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Discover
          </Link>
        </Button>
      </div>
    )
  }

  const images = collection.images.map(toGridImage)

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Badge variant="secondary" className="mb-3 gap-1">
          <Globe className="h-3 w-3" />
          Shared collection
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
        {collection.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {collection.description}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {collection.imageCount}{' '}
          {collection.imageCount === 1 ? 'image' : 'images'}
        </p>
      </div>

      <ImageGrid
        images={images}
        mode="view"
        onView={setPreview}
        emptyMessage="This collection doesn't have any images yet."
      />

      <ImageModal
        image={preview}
        open={preview !== null}
        onOpenChange={(o) => !o && setPreview(null)}
      />
    </div>
  )
}
