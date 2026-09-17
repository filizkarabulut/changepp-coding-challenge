# Palette — Image Sharing App (Frontend)

A React + TypeScript single-page app to discover, save, organize, and share
images in collections. Talks to the Express/MongoDB backend in `../backend`.

## Tech stack

- **Build tool:** Vite
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (Radix primitives + CVA)
- **Routing:** React Router v6
- **State:** React Context API (`AppContext`)
- **Notifications:** sonner (toasts)
- **Icons:** lucide-react

## Features

- **Discover** — search images (Pixabay, or built-in demo images with no key)
- **Save** — add any image to one of your collections from a hover action or the
  full-size preview modal
- **Collections** — create, filter, open, and delete collections; each card
  shows a cover collage, visibility, and image count
- **Manage** — open a collection to preview or remove individual images
- **Share** — toggle public/private, generate a unique share link, copy to
  clipboard
- **Public view** — `/share/:code` renders a read-only shared collection
- **Polish** — responsive masonry grids, loading skeletons, empty states,
  optimistic-feeling updates, and a **dark mode** toggle

## Setup & running

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   - `VITE_API_URL` — backend base URL (default `http://localhost:5000/api`).
   - `VITE_PIXABAY_API_KEY` — optional. Get a free key at
     <https://pixabay.com/api/docs/>. **Leave blank to use demo images** so the
     app works with no signup.

3. **Start the dev server** (make sure the backend is running first)

   ```bash
   npm run dev        # http://localhost:3000
   ```

4. **Production build / preview**

   ```bash
   npm run build
   npm run preview
   ```

## Project structure

```
frontend/src/
├── main.tsx                # Entry point
├── App.tsx                 # Router + providers + layout
├── index.css               # Tailwind + shadcn design tokens (light/dark)
├── pages/
│   ├── HomePage.tsx            # Discover + search + save
│   ├── CollectionsPage.tsx     # Manage collections
│   └── SharedCollectionPage.tsx# Public /share/:code view
├── components/
│   ├── ui/                     # shadcn/ui primitives (button, dialog, …)
│   ├── SearchBar.tsx           # Debounced search input
│   ├── ImageGrid.tsx           # Masonry grid (save/view modes)
│   ├── CollectionCard.tsx      # Collection summary + delete confirm
│   ├── CollectionList.tsx      # Grid of cards + loading/empty states
│   ├── CollectionDetailModal.tsx
│   ├── SaveToCollectionDropdown.tsx
│   ├── CreateCollectionModal.tsx
│   ├── ShareModal.tsx
│   ├── ImageModal.tsx
│   └── NavBar.tsx              # Nav + dark-mode toggle
├── context/AppContext.tsx  # Global collection state + CRUD actions
├── hooks/
│   ├── useCollections.ts
│   └── usePixabaySearch.ts     # Pixabay search with demo fallback
├── lib/
│   ├── api.ts                  # Typed fetch wrappers for the backend
│   ├── images.ts               # Normalizers -> ImageGrid display shape
│   └── utils.ts                # cn() class-name helper
└── types/index.ts          # Shared TypeScript interfaces
```

## Notes

- **No `any` types** — the API layer unwraps the backend's
  `{ success, data, message }` envelope into typed results and throws helpful
  errors that surface as toasts.
- **State updates locally** after each mutation (using the server's response),
  so the UI stays responsive without re-fetching the whole list.
- **Share links** are built from the current origin so they always point to
  wherever the app is served.
