import { useEffect, useMemo, useState } from 'react'
import { Check, ImageOff, Info, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/SearchBar'
import { useApp } from '@/context/AppContext'
import { usePixabaySearch } from '@/hooks/usePixabaySearch'
import { searchResultToGridImage } from '@/lib/images'
import { cn } from '@/lib/utils'
import type { GridImage, NewImageInput } from '@/types'

interface PhotoSearchModalProps {
  /** The collection images are added to. */
  collectionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_QUERY = 'nature'

/**
 * Search Pixabay and add results straight into a collection. Images already in
 * the collection show a checkmark; clicking any other image adds it in place,
 * and the checkmark appears immediately (the collection is read live from
 * context, so newly added images update without a refetch).
 */
export function PhotoSearchModal({
  collectionId,
  open,
  onOpenChange,
}: PhotoSearchModalProps) {
  const { collections, addImageToCollection } = useApp()
  const { results, loading, error, hasSearched, usingDemoData, search } =
    usePixabaySearch()
  const [addingKey, setAddingKey] = useState<string | null>(null)

  const collection = collections.find((c) => c._id === collectionId) ?? null

  // Seed the grid with a default search the first time the modal opens.
  useEffect(() => {
    if (open && !hasSearched) void search(DEFAULT_QUERY)
  }, [open, hasSearched, search])

  const images = useMemo(
    () => results.map(searchResultToGridImage),
    [results]
  )

  // URLs already saved in this collection, used to render checkmarks and to
  // prevent adding duplicates. Images dedupe by their full URL.
  const savedUrls = useMemo(
    () => new Set(collection?.images.map((img) => img.url) ?? []),
    [collection]
  )

  const toPayload = (img: GridImage): NewImageInput => ({
    url: img.fullUrl,
    title: img.title,
    source: img.source,
    width: img.width,
    height: img.height,
  })

  const handleAdd = async (img: GridImage) => {
    if (savedUrls.has(img.fullUrl) || addingKey) return
    setAddingKey(img.key)
    try {
      await addImageToCollection(collectionId, toPayload(img))
      toast.success('Added to collection')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add image')
    } finally {
      setAddingKey(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add photos{collection ? ` to “${collection.name}”` : ''}</DialogTitle>
          <DialogDescription>
            Search for images and click any photo to add it. A checkmark marks
            photos already in this collection.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0">
          <SearchBar
            placeholder="Search for images… (e.g. mountains, coffee, city)"
            defaultValue={DEFAULT_QUERY}
            onSearch={(q) => search(q)}
            autoFocus
          />
          {usingDemoData && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-dashed bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Showing demo images. Add a free{' '}
                <strong>VITE_PIXABAY_API_KEY</strong> to search real Pixabay
                photos.
              </span>
            </div>
          )}
        </div>

        <div className="-mx-1 flex-1 overflow-y-auto px-1 pt-1">
          {error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : loading ? (
            <div className="masonry">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-full"
                  style={{ height: 160 + ((i * 37) % 140) }}
                />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
              <ImageOff className="h-10 w-10" />
              <p>No images found. Try a different search.</p>
            </div>
          ) : (
            <div className="masonry">
              {images.map((img) => {
                const inCollection = savedUrls.has(img.fullUrl)
                const isAdding = addingKey === img.key
                return (
                  <button
                    key={img.key}
                    type="button"
                    disabled={inCollection || isAdding}
                    onClick={() => handleAdd(img)}
                    aria-label={
                      inCollection
                        ? `${img.title} (already in collection)`
                        : `Add ${img.title}`
                    }
                    className="group relative block w-full overflow-hidden rounded-lg border bg-muted disabled:cursor-default"
                  >
                    <img
                      src={img.previewUrl}
                      alt={img.title}
                      loading="lazy"
                      className={cn(
                        'w-full object-cover transition-transform duration-300',
                        inCollection
                          ? 'opacity-60'
                          : 'group-hover:scale-105'
                      )}
                    />

                    {inCollection ? (
                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
                          isAdding
                            ? 'bg-black/40 opacity-100'
                            : 'bg-black/40 opacity-0 group-hover:opacity-100'
                        )}
                      >
                        {isAdding ? (
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        ) : (
                          <Plus className="h-6 w-6 text-white" />
                        )}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
