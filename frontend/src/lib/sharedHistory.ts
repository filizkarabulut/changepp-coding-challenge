/**
 * Small localStorage-backed helpers for the sharing UX:
 *  - a history of recently viewed shared collections (for "Shared with me")
 *  - the moment a share link was generated (the backend doesn't track this)
 * Everything is defensive: corrupt or unavailable storage never throws.
 */

const RECENT_KEY = 'palette:recent-shares'
const GENERATED_KEY = 'palette:share-generated'
const MAX_RECENT = 5

/** A shared collection the user has opened, remembered locally. */
export interface RecentShare {
  code: string
  name: string
  description?: string
  imageCount: number
  viewedAt: string // ISO timestamp
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — history is best-effort, so ignore.
  }
}

/** The recently viewed shared collections, most recent first (max 5). */
export function getRecentShares(): RecentShare[] {
  const list = readJson<RecentShare[]>(RECENT_KEY, [])
  return Array.isArray(list) ? list.slice(0, MAX_RECENT) : []
}

/**
 * Record (or refresh) a viewed shared collection. Dedupes by code and keeps the
 * newest 5 entries first.
 */
export function addRecentShare(entry: Omit<RecentShare, 'viewedAt'>): void {
  const existing = getRecentShares().filter((s) => s.code !== entry.code)
  const next: RecentShare[] = [
    { ...entry, viewedAt: new Date().toISOString() },
    ...existing,
  ].slice(0, MAX_RECENT)
  writeJson(RECENT_KEY, next)
}

/** Record that a collection's share link was generated just now. */
export function setShareGeneratedAt(collectionId: string): void {
  const map = readJson<Record<string, string>>(GENERATED_KEY, {})
  map[collectionId] = new Date().toISOString()
  writeJson(GENERATED_KEY, map)
}

/** When the collection's share link was generated, if we recorded it. */
export function getShareGeneratedAt(collectionId: string): string | null {
  const map = readJson<Record<string, string>>(GENERATED_KEY, {})
  return map[collectionId] ?? null
}

/**
 * Pull an 8-character share code out of a pasted value — either a full URL
 * (…/share/CODE) or the bare code. Returns null if nothing usable is found.
 */
export function extractShareCode(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Try to parse a /share/<code> path out of a URL first.
  const match = trimmed.match(/\/share\/([A-Za-z0-9]+)/)
  if (match) return match[1]

  // Otherwise treat the whole thing as a bare code if it looks like one.
  if (/^[A-Za-z0-9]+$/.test(trimmed)) return trimmed

  return null
}

/** Human-friendly "x ago" string for an ISO timestamp. */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const seconds = Math.round((Date.now() - then) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleDateString()
}
