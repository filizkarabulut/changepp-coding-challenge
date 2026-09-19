import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { cn } from '@/lib/utils'
import type { GridImage, NewImageInput } from '@/types'

// Empty string → Pixabay returns popular images; demo data returns varied random images.
const DEFAULT_QUERY = ''

// Each chip maps a display label to the search term it fires.
// 'All' uses '' so it shows broad/popular results rather than a single keyword.
const CHIPS = [
  { label: 'All', query: '' },
  { label: 'Nature', query: 'nature' },
  { label: 'Architecture', query: 'architecture' },
  { label: 'Travel', query: 'travel' },
  { label: 'Animals', query: 'animals' },
  { label: 'Minimal', query: 'minimal' },
  { label: 'Textures', query: 'textures' },
] as const

/**
 * Discover page: search an image provider and save results into collections.
 */
export function HomePage() {
  const { collections, addImageToCollection } = useApp()
  const { results, loading, error, usingDemoData, search } = usePixabaySearch()
  const [active, setActive] = useState<GridImage | null>(null)
  // currentQuery is the raw search term; '' means "All" / broad results.
  const [currentQuery, setCurrentQuery] = useState(DEFAULT_QUERY)

  useEffect(() => {
    void search(DEFAULT_QUERY)
  }, [search])

  // Track the query label for the results header and chip active state.
  const handleSearch = useCallback(
    (q: string) => {
      setCurrentQuery(q.trim())
      search(q)
    },
    [search]
  )

  const handleChip = (query: string) => {
    setCurrentQuery(query)
    void search(query)
  }

  const images = useMemo(
    () => results.map(searchResultToGridImage),
    [results]
  )

  const toPayload = (img: GridImage): NewImageInput => ({
    url: img.fullUrl,
    title: img.title,
    source: img.source,
    width: img.width,
    height: img.height,
  })

  const saveHandler = (img: GridImage) => (collectionId: string) =>
    addImageToCollection(collectionId, toPayload(img))

  // Find which chip label is currently active for the highlight style.
  const activeChipLabel = CHIPS.find(
    (c) => c.query === currentQuery.toLowerCase()
  )?.label

  return (
    <div className="container py-8">
      {/* Compact hero: headline + search bar + suggestion chips */}
      <div className="mx-auto mb-7 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Find it.{' '}
          <span className="text-primary">Save it.</span>{' '}
          Make it yours.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search millions of free photos and curate collections around what
          inspires you.
        </p>

        <div className="mx-auto mt-5 max-w-lg">
          <SearchBar
            placeholder="Search for images…"
            defaultValue={DEFAULT_QUERY}
            onSearch={handleSearch}
            delay={400}
            autoFocus
            className="h-11 rounded-full pl-10"
          />
        </div>

        {/* Clickable suggestion chips — each performs a real search */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {CHIPS.map(({ label, query }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleChip(query)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                activeChipLabel === label
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
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
        <p className="mb-5 text-center text-sm text-destructive">{error}</p>
      )}

      {/* Subtle results context bar: current label + image count */}
      {!loading && images.length > 0 && (
        <div className="mb-3 flex items-center gap-1.5 text-sm">
          <span className="font-medium text-foreground">
            {currentQuery ? (
              <span className="capitalize">{currentQuery}</span>
            ) : (
              'All photos'
            )}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </span>
        </div>
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
            // Frosted-glass save button that stays legible over any image tone.
            trigger={
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-white/90 text-gray-900 shadow-sm hover:bg-white dark:bg-black/70 dark:text-white dark:hover:bg-black/80"
              >
                <Bookmark className="h-3.5 w-3.5" />
                Save
              </Button>
            }
          />
        )}
      />

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
