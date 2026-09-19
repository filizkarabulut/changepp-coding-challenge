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
      {/* Compact paste-a-link bar */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-wrap items-center gap-2"
      >
        <span className="text-sm text-muted-foreground">Have a share link?</span>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste link or code…"
          aria-label="Share link or code"
          className="h-9 w-64 text-sm"
        />
        <Button type="submit" size="sm" className="h-9 gap-1.5" disabled={!value.trim()}>
          View
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <h2 className="mb-4 text-sm font-medium text-muted-foreground">
        Collections shared with you
      </h2>

      {shared.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
          <Users className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">No shared collections yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Paste a share link above to view someone’s collection.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
