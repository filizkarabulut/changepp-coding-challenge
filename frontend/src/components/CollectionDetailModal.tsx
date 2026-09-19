import { useState } from 'react'
import { Globe, ImagePlus, Lock, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageGrid } from '@/components/ImageGrid'
import { ImageModal } from '@/components/ImageModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PhotoSearchModal } from '@/components/PhotoSearchModal'
import { useApp } from '@/context/AppContext'
import { toGridImage } from '@/lib/images'
import type { Collection, GridImage } from '@/types'

interface CollectionDetailModalProps {
  collection: Collection | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onShare: (collection: Collection) => void
}

/** Modal showing a collection's images with the ability to add, preview, and remove. */
export function CollectionDetailModal({
  collection,
  open,
  onOpenChange,
  onShare,
}: CollectionDetailModalProps) {
  const { removeImageFromCollection } = useApp()
  const [preview, setPreview] = useState<GridImage | null>(null)
  const [photoSearchOpen, setPhotoSearchOpen] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<GridImage | null>(null)

  if (!collection) return null

  const images = collection.images.map(toGridImage)

  const handleConfirmRemove = async () => {
    if (!pendingRemove) return
    try {
      await removeImageFromCollection(collection._id, pendingRemove.key)
      toast.success('Image removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove image')
      // Re-throw so the confirmation dialog stays open for a retry.
      throw err
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-full max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-xl">
            {collection.name}
            <Badge
              variant={collection.isPublic ? 'default' : 'secondary'}
              className="gap-1"
            >
              {collection.isPublic ? (
                <Globe className="h-3 w-3" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
              {collection.isPublic ? 'Public' : 'Private'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {collection.description || 'No description'} ·{' '}
            {collection.imageCount}{' '}
            {collection.imageCount === 1 ? 'image' : 'images'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setPhotoSearchOpen(true)}
          >
            <ImagePlus className="h-4 w-4" />
            Add Photos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onShare(collection)}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        <ImageGrid
          images={images}
          mode="view"
          onView={setPreview}
          onRemove={setPendingRemove}
          emptyMessage="This collection is empty. Click “Add Photos” to fill it."
        />
      </DialogContent>

      {/* Full-size preview — nested inside this dialog */}
      <ImageModal
        image={preview}
        open={preview !== null}
        onOpenChange={(o) => !o && setPreview(null)}
      />

      <PhotoSearchModal
        collectionId={collection._id}
        open={photoSearchOpen}
        onOpenChange={setPhotoSearchOpen}
      />

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(o) => !o && setPendingRemove(null)}
        title="Remove image?"
        description="Remove this image from the collection?"
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
      />
    </Dialog>
  )
}
