import { useState, type ReactNode } from 'react'
import { Bookmark, FolderPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import type { Collection } from '@/types'

interface SaveToCollectionDropdownProps {
  collections: Collection[]
  /** Persist the image into the chosen collection. */
  onSave: (collectionId: string) => Promise<void>
  /** Custom trigger element; defaults to a small "Save" button. */
  trigger?: ReactNode
  align?: 'start' | 'center' | 'end'
}

/**
 * Popover listing the user's collections. Selecting one saves the image and
 * shows a toast. Used both on hover in the image grid and inside the image modal.
 */
export function SaveToCollectionDropdown({
  collections,
  onSave,
  trigger,
  align = 'end',
}: SaveToCollectionDropdownProps) {
  const [open, setOpen] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  const handleSelect = async (collection: Collection) => {
    setSavingId(collection._id)
    try {
      await onSave(collection._id)
      toast.success(`Saved to “${collection.name}”`)
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save image')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="h-8 gap-1.5">
            <Bookmark className="h-4 w-4" />
            Save
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align={align} className="p-2">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Save to collection
        </p>

        {collections.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-2 py-6 text-center text-sm text-muted-foreground">
            <FolderPlus className="h-6 w-6" />
            <span>No collections yet. Create one first.</span>
          </div>
        ) : (
          <ul className="max-h-64 space-y-0.5 overflow-y-auto">
            {collections.map((c) => (
              <li key={c._id}>
                <button
                  type="button"
                  disabled={savingId !== null}
                  onClick={() => handleSelect(c)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-60"
                >
                  <span className="truncate">{c.name}</span>
                  {savingId === c._id ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {c.imageCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
