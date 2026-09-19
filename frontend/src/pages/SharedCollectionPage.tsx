import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, Link2Off, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ImageGrid } from '@/components/ImageGrid'
import { ImageModal } from '@/components/ImageModal'
import { Button } from '@/components/ui/button'
import { fetchSharedCollection } from '@/lib/api'
import { toGridImage } from '@/lib/images'
import { addRecentShare } from '@/lib/sharedHistory'
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
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchSharedCollection(code ?? '')
      .then((data) => {
        if (cancelled) return
        setCollection(data)
        // Remember it for the "Shared with me" recent list.
        if (code) {
          addRecentShare({
            code,
            name: data.name,
            description: data.description,
            imageCount: data.imageCount,
          })
        }
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy link')
    }
  }

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
      <div className="container flex justify-center py-24">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Link2Off className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">
              This collection is private or no longer available
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The owner may have made it private, or the link may be incorrect.
              Double-check the link and try again.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Discover
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const images = collection.images.map(toGridImage)

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-3 rounded-xl border bg-primary/5 px-4 py-3 text-sm">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="h-4 w-4" />
        </div>
        <span className="text-muted-foreground">
          You’re viewing a{' '}
          <span className="font-medium text-foreground">shared collection</span>.
          It’s read-only — you can browse and copy the link, but not edit it.
        </span>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {collection.name}
          </h1>
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
        <Button
          variant="outline"
          className="shrink-0 gap-2"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          Copy Link
        </Button>
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
