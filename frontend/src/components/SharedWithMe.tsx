import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CollectionCard } from '@/components/CollectionCard'
import { useApp } from '@/context/AppContext'
import { extractShareCode, getRecentShares } from '@/lib/sharedHistory'
import type { Collection } from '@/types'

interface SharedWithMeProps {
  /** Open a collection in the shared detail modal (same as own collections). */
  onOpen: (collection: Collection) => void
  /** Open the share dialog for a collection. */
  onShare: (collection: Collection) => void
}

/**
 * "Shared with me": a compact paste-a-link bar plus a grid of the collections
 * you've opened from a share link, rendered with the same cards as your own.
 */
export function SharedWithMe({ onOpen, onShare }: SharedWithMeProps) {
  const navigate = useNavigate()
  const { collections } = useApp()
  const [value, setValue] = useState('')

  // Recently viewed shares, resolved to the live collection they point at (so
  // they render as full cards and open in the same detail modal).
  const recent = getRecentShares()
  const shared = recent
    .map((s) => collections.find((c) => c.shareCode === s.code))
    .filter((c): c is Collection => Boolean(c))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = extractShareCode(value)
    if (!code) {
      toast.error('That doesn’t look like a valid share link or code.')
      return
    }
    navigate(`/share/${code}`)
  }

  return (
    <div>
      {/* Paste-a-link bar — styled as an integrated input row */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2"
      >
        <span className="shrink-0 text-sm text-muted-foreground">
          Have a share link?
        </span>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste link or code…"
          aria-label="Share link or code"
          className="h-8 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
        />
        <Button
          type="submit"
          size="sm"
          className="h-8 shrink-0 gap-1"
          disabled={!value.trim()}
        >
          View
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </form>

      <h2 className="mb-4 text-sm font-semibold text-foreground">
        Collections shared with you
      </h2>

      {shared.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
          <Users className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">No shared collections yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Paste a share link above to view someone's collection.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shared.map((collection) => (
            <CollectionCard
              key={collection._id}
              collection={collection}
              onOpen={onOpen}
              onShare={onShare}
            />
          ))}
        </div>
      )}
    </div>
  )
}
