import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { GridImage } from '@/types'

interface ImageModalProps {
  image: GridImage | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Optional action shown in the footer (e.g. a SaveToCollectionDropdown). */
  saveAction?: ReactNode
}

/** Full-size image preview with title, source, and an optional save action. */
export function ImageModal({
  image,
  open,
  onOpenChange,
  saveAction,
}: ImageModalProps) {
  if (!image) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="capitalize">{image.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{image.source}</Badge>
              {image.width && image.height && (
                <span className="text-xs text-muted-foreground">
                  {image.width} × {image.height}
                </span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg bg-muted">
          <img
            src={image.fullUrl}
            alt={image.title}
            className="max-h-[60vh] w-full object-contain"
          />
        </div>

        {saveAction && <div className="flex justify-end">{saveAction}</div>}
      </DialogContent>
    </Dialog>
  )
}
