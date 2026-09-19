import { Globe, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VisibilityBadgeProps {
  isPublic: boolean
  className?: string
}

/**
 * Small pill showing a collection's visibility. Green for public, gray for
 * private, with dark-mode-friendly variants.
 */
export function VisibilityBadge({ isPublic, className }: VisibilityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        isPublic
          ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
        className
      )}
    >
      {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
      {isPublic ? 'Public' : 'Private'}
    </span>
  )
}
