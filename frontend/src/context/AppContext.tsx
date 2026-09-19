import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import * as api from '@/lib/api'
import type { AppContextType, Collection, NewImageInput } from '@/types'

// Created with `undefined` so we can detect usage outside the provider.
const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * Provides collection state and CRUD actions to the whole app.
 * Mutations update local state directly (using the server's response) so the
 * UI stays responsive without re-fetching the full list every time.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all collections once on mount.
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCollections(await api.fetchCollections())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createCollection = useCallback(
    async (name: string, description?: string) => {
      const created = await api.createCollection(name, description)
      setCollections((prev) => [created, ...prev])
      return created
    },
    []
  )

  const updateCollection = useCallback(
    async (id: string, fields: { name?: string; description?: string }) => {
      const updated = await api.updateCollection(id, fields)
      // Server returns the full populated collection; replace our copy.
      setCollections((prev) => prev.map((c) => (c._id === id ? updated : c)))
      return updated
    },
    []
  )

  const deleteCollection = useCallback(async (id: string) => {
    await api.deleteCollection(id)
    setCollections((prev) => prev.filter((c) => c._id !== id))
  }, [])

  const addImageToCollection = useCallback(
    async (collectionId: string, image: NewImageInput) => {
      const saved = await api.addImage(collectionId, image)
      setCollections((prev) =>
        prev.map((c) =>
          c._id === collectionId
            ? {
                ...c,
                images: [...c.images, saved],
                imageCount: c.imageCount + 1,
              }
            : c
        )
      )
    },
    []
  )

  const removeImageFromCollection = useCallback(
    async (collectionId: string, imageId: string) => {
      await api.removeImage(collectionId, imageId)
      setCollections((prev) =>
        prev.map((c) =>
          c._id === collectionId
            ? {
                ...c,
                images: c.images.filter((img) => img._id !== imageId),
                imageCount: Math.max(0, c.imageCount - 1),
              }
            : c
        )
      )
    },
    []
  )

  const togglePublic = useCallback(async (id: string) => {
    const { isPublic } = await api.togglePublic(id)
    setCollections((prev) =>
      prev.map((c) => (c._id === id ? { ...c, isPublic } : c))
    )
  }, [])

  const generateShareLink = useCallback(async (id: string) => {
    const { shareCode, url } = await api.shareCollection(id)
    // Sharing also makes the collection public on the backend.
    setCollections((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, shareCode, isPublic: true } : c
      )
    )
    return url
  }, [])

  const value: AppContextType = {
    collections,
    loading,
    error,
    refresh,
    createCollection,
    updateCollection,
    deleteCollection,
    addImageToCollection,
    removeImageFromCollection,
    togglePublic,
    generateShareLink,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/** Access the app context. Throws if used outside <AppProvider>. */
export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return ctx
}
