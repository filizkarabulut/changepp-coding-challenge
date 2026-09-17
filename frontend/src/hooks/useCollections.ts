import { useApp } from '@/context/AppContext'

/**
 * Convenience hook exposing just the collection list and its load state.
 * Thin wrapper over AppContext so components that only need to read
 * collections don't have to pull in the whole context surface.
 */
export function useCollections() {
  const { collections, loading, error, refresh } = useApp()
  return { collections, loading, error, refresh }
}
