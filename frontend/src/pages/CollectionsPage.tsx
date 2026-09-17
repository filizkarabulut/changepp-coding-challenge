import { useMemo, useState } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { CollectionList } from '@/components/CollectionList'
import { CreateCollectionModal } from '@/components/CreateCollectionModal'
import { ShareModal } from '@/components/ShareModal'
import { CollectionDetailModal } from '@/components/CollectionDetailModal'
import { useApp } from '@/context/AppContext'
import type { Collection } from '@/types'

/**
 * Collections page: view, filter, create, open, and share your collections.
 */
export function CollectionsPage() {
  const { collections, loading, error } = useApp()
  const [query, setQuery] = useState('')
  // Track selections by id so the modals always render the live collection
  // from context (reflecting edits like removing images or toggling public).
  const [detailId, setDetailId] = useState<string | null>(null)
  const [shareId, setShareId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return collections
    return collections.filter((c) => c.name.toLowerCase().includes(q))
  }, [collections, query])

  const detailCollection =
    collections.find((c) => c._id === detailId) ?? null
  const shareCollection = collections.find((c) => c._id === shareId) ?? null

  const openShare = (collection: Collection) => setShareId(collection._id)

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your collections</h1>
          <p className="text-sm text-muted-foreground">
            {collections.length}{' '}
            {collections.length === 1 ? 'collection' : 'collections'}
          </p>
        </div>
        <CreateCollectionModal />
      </div>

      {collections.length > 0 && (
        <div className="mb-6 max-w-md">
          <SearchBar
            placeholder="Filter collections by name…"
            onSearch={setQuery}
            delay={150}
          />
        </div>
      )}

      {error ? (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : (
        <CollectionList
          collections={filtered}
          loading={loading}
          onOpen={(c) => setDetailId(c._id)}
          onShare={openShare}
          emptyAction={<CreateCollectionModal />}
          emptyMessage={
            query
              ? `No collections match “${query}”.`
              : 'No collections yet. Create your first one to start saving images.'
          }
        />
      )}

      <CollectionDetailModal
        collection={detailCollection}
        open={detailId !== null}
        onOpenChange={(o) => !o && setDetailId(null)}
        onShare={openShare}
      />

      <ShareModal
        collection={shareCollection}
        open={shareId !== null}
        onOpenChange={(o) => !o && setShareId(null)}
      />
    </div>
  )
}
