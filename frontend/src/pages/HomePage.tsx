import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Info } from 'lucide-react'
import { SearchBar } from '@/components/SearchBar'
import { ImageGrid } from '@/components/ImageGrid'
import { ImageModal } from '@/components/ImageModal'
import { SaveToCollectionDropdown } from '@/components/SaveToCollectionDropdown'
import { CreateCollectionModal } from '@/components/CreateCollectionModal'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { usePixabaySearch } from '@/hooks/usePixabaySearch'
import { searchResultToGridImage } from '@/lib/images'
import type { GridImage, NewImageInput } from '@/types'

const DEFAULT_QUERY = 'nature'

/**
 * Discover page: search an image provider and save results into collections.
 */
export function HomePage() {
  const { collections, addImageToCollection } = useApp()
  const { results, loading, error, usingDemoData, search } = usePixabaySearch()
  const [active, setActive] = useState<GridImage | null>(null)

  // Run an initial search so the grid isn't empty on first load.
  useEffect(() => {
    void search(DEFAULT_QUERY)
  }, [search])

  const images = useMemo(
    () => results.map(searchResultToGridImage),
    [results]
  )

  // Build the payload the backend expects from a grid image.
  const toPayload = (img: GridImage): NewImageInput => ({
    url: img.fullUrl,
    title: img.title,
    source: img.source,
    width: img.width,
    height: img.height,
  })

  const saveHandler = (img: GridImage) => (collectionId: string) =>
    addImageToCollection(collectionId, toPayload(img))

  return (
    <div className="container py-8">
      {/* Hero */}
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Discover &amp; save images you love
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search millions of photos and organize them into collections.
        </p>
        <div className="mx-auto mt-6 max-w-xl">
          <SearchBar
            placeholder="Search for images… (e.g. mountains, coffee, city)"
            defaultValue={DEFAULT_QUERY}
            onSearch={(q) => search(q)}
            autoFocus
          />
        </div>
      </div>

      {/* Demo-data notice when no Pixabay key is configured */}
      {usingDemoData && (
        <div className="mx-auto mb-6 flex max-w-2xl items-start gap-2 rounded-lg border border-dashed bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Showing demo images. Add a free <strong>VITE_PIXABAY_API_KEY</strong>{' '}
            to <code>.env.local</code> to search real Pixabay photos.
          </span>
        </div>
      )}

      {error && (
        <p className="mb-6 text-center text-sm text-destructive">{error}</p>
      )}

      <ImageGrid
        images={images}
        loading={loading}
        mode="save"
        onView={setActive}
        emptyMessage="No images found. Try a different search."
        renderAction={(img) => (
          <SaveToCollectionDropdown
            collections={collections}
            onSave={saveHandler(img)}
          />
        )}
      />

      {/* Full-size preview with a save action */}
      <ImageModal
        image={active}
        open={active !== null}
        onOpenChange={(o) => !o && setActive(null)}
        saveAction={
          active &&
          (collections.length > 0 ? (
            <SaveToCollectionDropdown
              collections={collections}
              onSave={saveHandler(active)}
              trigger={
                <Button className="gap-2">
                  <Bookmark className="h-4 w-4" />
                  Save to collection
                </Button>
              }
            />
          ) : (
            <CreateCollectionModal
              trigger={
                <Button className="gap-2">
                  <Bookmark className="h-4 w-4" />
                  Create a collection to save
                </Button>
              }
            />
          ))
        }
      />
    </div>
  )
}
