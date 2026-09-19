import { useState } from 'react'
import { Globe, ImageIcon, Lock, Pencil, Share2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EditCollectionModal } from '@/components/EditCollectionModal'
import { useApp } from '@/context/AppContext'
import type { Collection } from '@/types'

interface CollectionCardProps {
  collection: Collection
  onOpen: (collection: Collection) => void
  onShare: (collection: Collection) => void
}

/**
 * Card summarizing a single collection: cover collage, name, visibility,
 * image count, and share / edit / delete actions.
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
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {/* Cover: 2x2 collage of the first images, or a placeholder. */}
      <button
        type="button"
        onClick={() => onOpen(collection)}
        className="grid aspect-[16/10] grid-cols-2 grid-rows-2 gap-0.5 bg-muted"
        aria-label={`Open ${collection.name}`}
      >
        {cover.length === 0 ? (
          <div className="col-span-2 row-span-2 flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        ) : (
          cover.map((img, i) => (
            <img
              key={img._id}
              src={img.url}
              alt={img.title}
              loading="lazy"
              className={`h-full w-full object-cover ${
                // A single image fills the whole cover.
                cover.length === 1 ? 'col-span-2 row-span-2' : ''
              } ${cover.length === 3 && i === 0 ? 'row-span-2' : ''}`}
            />
          ))
        )}
      </button>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">
            {collection.name}
          </CardTitle>
          <Badge
            variant={collection.isPublic ? 'default' : 'secondary'}
            className="shrink-0 gap-1"
          >
            {collection.isPublic ? (
              <Globe className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
            {collection.isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {collection.description || 'No description'}
        </p>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {collection.imageCount}{' '}
          {collection.imageCount === 1 ? 'image' : 'images'}
        </p>
      </CardContent>

      <CardFooter className="gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onShare(collection)}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEditOpen(true)}
          title="Edit collection"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
          title="Delete collection"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>

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

      {/* Edit name / description + add more photos */}
      <EditCollectionModal
        collection={collection}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </Card>
  )
}
