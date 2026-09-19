import { useState, type ReactNode } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useApp } from '@/context/AppContext'
import type { Collection } from '@/types'

interface CreateCollectionModalProps {
  trigger?: ReactNode
  onCreated?: (collection: Collection) => void
}

/** Dialog with a form to create a new collection. */
export function CreateCollectionModal({
  trigger,
  onCreated,
}: CreateCollectionModalProps) {
  const { createCollection } = useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setName('')
    setDescription('')
    setError(null)
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
      const created = await createCollection(name.trim(), description.trim())
      toast.success(`Created “${created.name}”`)
      onCreated?.(created)
      reset()
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create collection')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a collection</DialogTitle>
          <DialogDescription>
            Group images you love into a named collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collection-name">Name</Label>
            <Input
              id="collection-name"
              value={name}
              maxLength={100}
              autoFocus
              placeholder="e.g. Travel inspiration"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="collection-description">
              Description{' '}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="collection-description"
              value={description}
              maxLength={500}
              placeholder="What's this collection about?"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
