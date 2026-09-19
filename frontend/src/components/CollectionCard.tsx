import { useState } from 'react'
import { ImageIcon, Pencil, Share2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { VisibilityBadge } from '@/components/VisibilityBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EditCollectionModal } from '@/components/EditCollectionModal'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type { Collection } from '@/types'

interface CollectionCardProps {
  collection: Collection
  onOpen: (collection: Collection) => void
  onShare: (collection: Collection) => void
}

/**
 * Card summarizing a single collection: cover collage, name, visibility, and
 * image count. Share / edit / delete actions are revealed on hover in an
 * overlay so the card stays clean at rest.
 */
export function CollectionCard({
  collection,
  onOpen,
  onShare,
}: CollectionCardProps) {
  const { deleteCollection } = useApp()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const cover = collection.images.slice(0, 4)
  const count = cover.length

  // Grid template adapts to the number of cover images so cells always tile the
  // thumbnail area edge-to-edge with no gaps.
  const gridClass =
    count <= 1
      ? 'grid-cols-1 grid-rows-1'
      : count === 2
        ? 'grid-cols-2 grid-rows-1'
        : 'grid-cols-2 grid-rows-2'

  const handleDelete = async () => {
    try {
      await deleteCollection(collection._id)
      toast.success(`Deleted “${collection.name}”`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete')
      // Re-throw so the confirmation dialog stays open for a retry.
      throw err
    }
  }

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-md">
      {/* Cover: adaptive collage of up to 4 images, or a placeholder. */}
      <button
        type="button"
        onClick={() => onOpen(collection)}
        className={cn('grid h-44 gap-0 overflow-hidden bg-muted', gridClass)}
        aria-label={`Open ${collection.name}`}
      >
        {count === 0 ? (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/50">
            <ImageIcon className="h-8 w-8" />
          </div>
        ) : (
          cover.map((img, i) => (
            <img
              key={img._id}
              src={img.url}
              alt={img.title}
              loading="lazy"
              className={cn(
                'h-full w-full object-cover',
                // With 3 images the first spans the full top row.
                count === 3 && i === 0 && 'col-span-2'
              )}
            />
          ))
        )}
      </button>

      {/* Text info area, separated from the thumbnails by a subtle border. */}
      <div className="border-t border-border/50 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-semibold leading-tight">
            {collection.name}
          </h3>
          <VisibilityBadge isPublic={collection.isPublic} className="shrink-0" />
        </div>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {collection.description || 'No description'}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {collection.imageCount}{' '}
          {collection.imageCount === 1 ? 'image' : 'images'}
        </p>
      </div>

      {/* Hover action overlay. The overlay itself is click-through so the card
          still opens when the darkened area is clicked; only the buttons
          capture clicks, and only while hovered. */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {/* "Shared" badge — top-left, only visible on hover */}
        {collection.shareCode && (
          <div className="pointer-events-none absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white shadow-sm backdrop-blur-sm">
            <Share2 className="h-3.5 w-3.5" />
          </div>
        )}
        <TooltipProvider delayDuration={200}>
          <div className="pointer-events-none flex gap-2 group-hover:pointer-events-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 shadow-sm"
                  onClick={() => onShare(collection)}
                  aria-label="Share collection"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 shadow-sm"
                  onClick={() => setEditOpen(true)}
                  aria-label="Edit collection"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setConfirmOpen(true)}
                  aria-label="Delete collection"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete “${collection.name}”?`}
        description={`This will permanently remove the collection and all ${
          collection.imageCount
        } ${collection.imageCount === 1 ? 'image' : 'images'} in it.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />

      {/* Edit name / description + visibility + add more photos */}
      <EditCollectionModal
        collection={collection}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </Card>
  )
}
