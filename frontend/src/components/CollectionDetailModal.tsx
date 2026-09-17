import { useState } from 'react'
import { Globe, Lock, Share2 } from 'lucide-react'
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
import { useApp } from '@/context/AppContext'
import { toGridImage } from '@/lib/images'
import type { Collection, GridImage } from '@/types'

interface CollectionDetailModalProps {
  collection: Collection | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onShare: (collection: Collection) => void
}

/** Modal showing a collection's images with the ability to preview and remove. */
export function CollectionDetailModal({
  collection,
  open,
  onOpenChange,
  onShare,
}: CollectionDetailModalProps) {
  const { removeImageFromCollection } = useApp()
  const [preview, setPreview] = useState<GridImage | null>(null)

  if (!collection) return null

  const images = collection.images.map(toGridImage)

  const handleRemove = async (img: GridImage) => {
    try {
      await removeImageFromCollection(collection._id, img.key)
      toast.success('Image removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove image')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-8">
            <DialogTitle className="flex items-center gap-2">
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
          <DialogDescription>
            {collection.description || 'No description'} · {collection.imageCount}{' '}
            {collection.imageCount === 1 ? 'image' : 'images'}
          </DialogDescription>
        </DialogHeader>

        <ImageGrid
          images={images}
          mode="view"
          onView={setPreview}
          onRemove={handleRemove}
          emptyMessage="This collection is empty. Save images to it from the Discover page."
        />
      </DialogContent>

      {/* Nested full-size preview */}
      <ImageModal
        image={preview}
        open={preview !== null}
        onOpenChange={(o) => !o && setPreview(null)}
      />
    </Dialog>
  )
}
