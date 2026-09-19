import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/SearchBar'
import { CollectionList } from '@/components/CollectionList'
import { CreateCollectionModal } from '@/components/CreateCollectionModal'
import { ShareModal } from '@/components/ShareModal'
import { CollectionDetailModal } from '@/components/CollectionDetailModal'
import { SharedWithMe } from '@/components/SharedWithMe'
import { useApp } from '@/context/AppContext'
import type { Collection } from '@/types'

type Tab = 'mine' | 'shared'

/**
 * Collections page: view, filter, create, open, and share your collections,
 * plus a "Shared with me" tab for opening collections others have shared.
 */
export function CollectionsPage() {
  const { collections, loading, error } = useApp()
  const [tab, setTab] = useState<Tab>('mine')
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
      {/* Tabs */}
      <div className="mb-4 flex items-center justify-between border-b">
        <div className="flex gap-1">
          {(
            [
              ['mine', 'Collections'],
              ['shared', 'Shared with me'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                tab === value
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'mine' && <CreateCollectionModal />}
      </div>

      {tab === 'mine' ? (
        <>
          {/* Count subtitle + compact filter */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {collections.length}{' '}
              {collections.length === 1 ? 'collection' : 'collections'}
            </p>
            {collections.length > 0 && (
              <div className="w-48">
                <SearchBar
                  placeholder="Filter…"
                  onSearch={setQuery}
                  delay={150}
                  className="h-8 text-sm"
                />
              </div>
            )}
          </div>

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
        </>
      ) : (
        <SharedWithMe
          onOpen={(c) => setDetailId(c._id)}
          onShare={openShare}
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
