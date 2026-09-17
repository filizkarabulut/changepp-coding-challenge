import { useState } from 'react'
import { Check, Copy, Globe, Link2, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useApp } from '@/context/AppContext'
import type { Collection } from '@/types'

interface ShareModalProps {
  collection: Collection | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog for sharing a collection: toggle public/private, generate a share
 * link, and copy it to the clipboard.
 */
export function ShareModal({ collection, open, onOpenChange }: ShareModalProps) {
  const { togglePublic, generateShareLink } = useApp()
  const [generating, setGenerating] = useState(false)
  const [togglingPublic, setTogglingPublic] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!collection) return null

  // Build the link from the current origin so it always points where the app runs.
  const shareUrl = collection.shareCode
    ? `${window.location.origin}/share/${collection.shareCode}`
    : ''

  const handleToggle = async () => {
    setTogglingPublic(true)
    try {
      await togglePublic(collection._id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update visibility')
    } finally {
      setTogglingPublic(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateShareLink(collection._id)
      toast.success('Share link ready')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not generate link')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share “{collection.name}”</DialogTitle>
          <DialogDescription>
            Anyone with the link can view a public collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public / private toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {collection.isPublic ? (
                <Globe className="h-5 w-5 text-primary" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="public-toggle" className="text-sm">
                  {collection.isPublic ? 'Public' : 'Private'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {collection.isPublic
                    ? 'Visible to anyone with the link'
                    : 'Only you can see this collection'}
                </p>
              </div>
            </div>
            <Switch
              id="public-toggle"
              checked={collection.isPublic}
              disabled={togglingPublic}
              onCheckedChange={handleToggle}
            />
          </div>

          {/* Share link */}
          {collection.shareCode ? (
            <div className="space-y-2">
              <Label>Share link</Label>
              <div className="flex gap-2">
                <Input readOnly value={shareUrl} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={handleCopy}
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {!collection.isPublic && (
                <p className="text-xs text-destructive">
                  This collection is private — turn on Public so others can open
                  the link.
                </p>
              )}
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full gap-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Generate share link
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
