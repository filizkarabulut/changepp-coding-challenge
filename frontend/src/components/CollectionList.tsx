import type { ReactNode } from 'react'
import { FolderOpen } from 'lucide-react'
import { CollectionCard } from '@/components/CollectionCard'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Collection } from '@/types'

interface CollectionListProps {
  collections: Collection[]
  loading?: boolean
  onOpen: (collection: Collection) => void
  onShare: (collection: Collection) => void
  /** Optional CTA rendered in the empty state (e.g. a create button). */
  emptyAction?: ReactNode
  emptyMessage?: string
}

/** Responsive grid of CollectionCards with loading and empty states. */
export function CollectionList({
  collections,
  loading = false,
  onOpen,
  onShare,
  emptyAction,
  emptyMessage = 'No collections yet. Create your first one to start saving images.',
}: CollectionListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
        <FolderOpen className="h-12 w-12 text-muted-foreground" />
        <p className="max-w-sm text-muted-foreground">{emptyMessage}</p>
        {emptyAction}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {collections.map((collection) => (
        <CollectionCard
          key={collection._id}
          collection={collection}
          onOpen={onOpen}
          onShare={onShare}
        />
      ))}
    </div>
  )
}
