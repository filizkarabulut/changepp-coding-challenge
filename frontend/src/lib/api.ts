import type {
  ApiResponse,
  Collection,
  Image,
  NewImageInput,
} from '@/types'

// Base URL for the backend, configurable per environment.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

/**
 * Thin wrapper around fetch that:
 *  - sends/receives JSON
 *  - unwraps the backend's { success, data, message } envelope
 *  - throws a helpful Error (with the server's message) on failure
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    // Network-level failure (server down, CORS, offline).
    throw new Error('Could not reach the server. Is the backend running?')
  }

  let body: ApiResponse<T>
  try {
    body = (await res.json()) as ApiResponse<T>
  } catch {
    throw new Error(`Unexpected response from server (${res.status})`)
  }

  if (!res.ok || !body.success) {
    throw new Error(body.message ?? `Request failed (${res.status})`)
  }

  return body.data as T
}

// ----- Collections -----

export const fetchCollections = () =>
  request<Collection[]>('/collections')

export const createCollection = (name: string, description?: string) =>
  request<Collection>('/collections', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })

export const deleteCollection = (id: string) =>
  request<unknown>(`/collections/${id}`, { method: 'DELETE' })

export const togglePublic = (id: string) =>
  request<{ _id: string; isPublic: boolean }>(
    `/collections/${id}/toggle-public`,
    { method: 'PATCH' }
  )

// ----- Images -----

export const addImage = (collectionId: string, image: NewImageInput) =>
  request<Image>(`/collections/${collectionId}/images`, {
    method: 'POST',
    body: JSON.stringify(image),
  })

export const removeImage = (collectionId: string, imageId: string) =>
  request<unknown>(`/collections/${collectionId}/images/${imageId}`, {
    method: 'DELETE',
  })

// ----- Sharing -----

export const shareCollection = (id: string) =>
  request<{ shareCode: string; url: string }>(`/collections/${id}/share`, {
    method: 'POST',
  })

export const fetchSharedCollection = (code: string) =>
  request<Collection>(`/share/${code}`)
