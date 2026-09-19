import { useEffect, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { PhotoSearchModal } from '@/components/PhotoSearchModal'
import { VisibilityBadge } from '@/components/VisibilityBadge'
import { useApp } from '@/context/AppContext'
import type { Collection } from '@/types'

interface EditCollectionModalProps {
  collection: Collection
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Edit a collection's name and description, with a shortcut to open the photo
 * search modal and add more images. Saving calls PATCH /api/collections/:id.
 */
export function EditCollectionModal({
  collection,
  open,
  onOpenChange,
}: EditCollectionModalProps) {
  const { updateCollection, togglePublic } = useApp()
  const [name, setName] = useState(collection.name)
  const [description, setDescription] = useState(collection.description ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [togglingPublic, setTogglingPublic] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoSearchOpen, setPhotoSearchOpen] = useState(false)

  // Re-sync the form whenever the modal opens or the collection changes, so it
  // always reflects the latest saved values.
  useEffect(() => {
    if (open) {
      setName(collection.name)
      setDescription(collection.description ?? '')
      setError(null)
    }
  }, [open, collection.name, collection.description])

  const handleToggle = async () => {
    setTogglingPublic(true)
    try {
      await togglePublic(collection._id)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not update visibility'
      )
    } finally {
      setTogglingPublic(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a collection name.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await updateCollection(collection._id, {
        name: name.trim(),
        description: description.trim(),
      })
      toast.success('Collection updated')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update collection')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit collection</DialogTitle>
            <DialogDescription>
              Update the name and description, or add more photos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-collection-name">Name</Label>
              <Input
                id="edit-collection-name"
                value={name}
                maxLength={100}
                autoFocus
                placeholder="e.g. Travel inspiration"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-collection-description">
                Description{' '}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="edit-collection-description"
                value={description}
                maxLength={500}
                placeholder="What's this collection about?"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="edit-public-toggle" className="text-sm">
                  Make Public
                </Label>
                <VisibilityBadge isPublic={collection.isPublic} />
              </div>
              <Switch
                id="edit-public-toggle"
                checked={collection.isPublic}
                disabled={togglingPublic}
                onCheckedChange={handleToggle}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => setPhotoSearchOpen(true)}
              >
                <ImagePlus className="h-4 w-4" />
                Add More Photos
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PhotoSearchModal
        collectionId={collection._id}
        open={photoSearchOpen}
        onOpenChange={setPhotoSearchOpen}
      />
    </>
  )
}
