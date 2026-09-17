import type { ReactNode } from 'react'
import { Eye, ImageOff, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { GridImage } from '@/types'

interface ImageGridProps {
  images: GridImage[]
  loading?: boolean
  /** 'save' shows a save action on hover; 'view' is read-only. */
  mode?: 'save' | 'view'
  /** Open a full-size preview of the image. */
  onView?: (img: GridImage) => void
  /** When provided (view mode), shows a remove/trash button on each tile. */
  onRemove?: (img: GridImage) => void
  /** Custom hover action (save mode) — typically the SaveToCollectionDropdown. */
  renderAction?: (img: GridImage) => ReactNode
  emptyMessage?: string
  skeletonCount?: number
}

/**
 * Responsive masonry grid of images. Handles loading (skeletons) and empty
 * states, and shows contextual hover actions depending on `mode`.
 */
export function ImageGrid({
  images,
  loading = false,
  mode = 'view',
  onView,
  onRemove,
  renderAction,
  emptyMessage = 'No images to show.',
  skeletonCount = 8,
}: ImageGridProps) {
  if (loading) {
    return (
      <div className="masonry">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full"
            style={{ height: 160 + ((i * 37) % 140) }}
          />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        <ImageOff className="h-10 w-10" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="masonry">
      {images.map((img) => (
        <figure
          key={img.key}
          className="group relative cursor-zoom-in overflow-hidden rounded-lg border bg-muted"
          onClick={() => onView?.(img)}
        >
          <img
            src={img.previewUrl}
            alt={img.title}
            loading="lazy"
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {/* Top-right action row */}
            <div
              className="pointer-events-auto flex justify-end gap-2 p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {mode === 'save' && renderAction?.(img)}
              {mode === 'view' && onRemove && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => onRemove(img)}
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Bottom caption */}
            <figcaption className="flex items-end justify-between gap-2 p-3 text-white">
              <span className="line-clamp-2 text-sm font-medium capitalize">
                {img.title}
              </span>
              <Eye className="h-4 w-4 shrink-0 opacity-80" />
            </figcaption>
          </div>
        </figure>
      ))}
    </div>
  )
}
