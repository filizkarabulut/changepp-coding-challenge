/** A single image stored inside a collection (matches the backend Image model). */
export interface Image {
  _id: string
  url: string
  title: string
  source: string
  width?: number
  height?: number
  createdAt: string
}

/** Fields required to save a new image (before the backend assigns an _id). */
export type NewImageInput = {
  url: string
  title: string
  source: string
  width?: number
  height?: number
}

/** A named group of images (matches the backend Collection model). */
export interface Collection {
  _id: string
  name: string
  description?: string
  images: Image[]
  isPublic: boolean
  shareCode?: string
  imageCount: number
  createdAt: string
}

/**
 * A normalized search result from an image provider (e.g. Pixabay).
 * Not yet saved, so it has a provider `id` for React keys rather than a Mongo _id.
 */
export interface SearchResult {
  id: string
  url: string // large image, shown in the preview modal
  previewUrl: string // smaller image, shown in the grid
  title: string
  source: string
  width: number
  height: number
}

/**
 * Normalized shape the ImageGrid renders, so it can display both unsaved
 * search results and saved collection images with one component.
 */
export interface GridImage {
  key: string
  previewUrl: string
  fullUrl: string
  title: string
  source: string
  width?: number
  height?: number
}

/** Shape of every backend response: { success, data } or { success, message }. */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

/** The value exposed by AppContext to the rest of the app. */
export interface AppContextType {
  collections: Collection[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createCollection: (name: string, description?: string) => Promise<Collection>
  deleteCollection: (id: string) => Promise<void>
  addImageToCollection: (
    collectionId: string,
    image: NewImageInput
  ) => Promise<void>
  removeImageFromCollection: (
    collectionId: string,
    imageId: string
  ) => Promise<void>
  togglePublic: (id: string) => Promise<void>
  generateShareLink: (id: string) => Promise<string>
}
