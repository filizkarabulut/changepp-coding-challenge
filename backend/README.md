# Image Sharing App — Backend API

A RESTful API for saving, organizing, and sharing images in collections.
Built with **Express.js**, **Node.js**, and **MongoDB** (via Mongoose).

## Tech stack

- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** MongoDB (local or Atlas), modeled with Mongoose
- **Port:** 5000 (configurable via `.env`)

## Project structure

```
backend/
├── server.js                 # Entry point: Express setup, middleware, route mounting
├── db/
│   └── connect.js            # MongoDB connection helper
├── models/
│   ├── Collection.js         # Collection schema + model (with imageCount virtual)
│   └── Image.js              # Image schema + model (with URL validation)
├── controllers/
│   ├── collectionController.js
│   ├── imageController.js
│   └── shareController.js
├── routes/
│   ├── collections.js        # /api/collections (+ nested image routes)
│   ├── images.js             # /api/collections/:collectionId/images
│   └── sharing.js            # /api/collections/:id/share, /api/share/:code
├── middleware/
│   ├── cors.js               # CORS configuration
│   └── errorHandler.js       # asyncHandler, ApiError, 404 + global error handler
├── test/
│   └── smoke.js              # End-to-end test of all endpoints (in-memory MongoDB)
├── .env.example              # Template for environment variables
└── package.json
```

## Setup & running

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:

   - `MONGODB_URI` — a local MongoDB (`mongodb://127.0.0.1:27017/image-sharing-app`)
     or an Atlas connection string.
   - `PORT` — defaults to `5000`.
   - `CLIENT_ORIGIN` — the frontend origin, used to build share links
     (defaults to `http://localhost:3000`).

3. **Start the server**

   ```bash
   npm start      # production
   npm run dev    # auto-restart on file changes
   ```

   You should see `Server listening on http://localhost:5000`.

## Testing

The smoke test spins up a throwaway in-memory MongoDB, boots the real app, and
exercises every endpoint (including validation and error cases) — no database
setup required:

```bash
npm test
```

## API reference

All responses share a consistent JSON shape:
`{ "success": true, "data": ... }` on success, or
`{ "success": false, "message": "..." }` on error.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET    | `/api/health` | Health check |
| GET    | `/api/collections` | List all collections (images populated) |
| POST   | `/api/collections` | Create a collection (`name` required) |
| DELETE | `/api/collections/:id` | Delete a collection (and its images) |
| PATCH  | `/api/collections/:id/toggle-public` | Toggle public/private |
| POST   | `/api/collections/:collectionId/images` | Add an image (`url`, `title` required) |
| DELETE | `/api/collections/:collectionId/images/:imageId` | Remove an image |
| POST   | `/api/collections/:id/share` | Generate a share link (marks collection public) |
| GET    | `/api/share/:code` | View a shared collection (404 unknown, 403 if private) |

### Example requests

```bash
# Create a collection
curl -X POST http://localhost:5000/api/collections \
  -H "Content-Type: application/json" \
  -d '{"name":"Vacation","description":"Beach photos"}'

# Add an image
curl -X POST http://localhost:5000/api/collections/<id>/images \
  -H "Content-Type: application/json" \
  -d '{"url":"https://cdn.pixabay.com/photo/beach.jpg","title":"Sunset","source":"pixabay","width":1920,"height":1080}'

# Generate a share link
curl -X POST http://localhost:5000/api/collections/<id>/share

# View a shared collection
curl http://localhost:5000/api/share/<shareCode>
```

## Design notes

- **Images are separate documents** referenced from `Collection.images`, so the
  same image model can be reused and collections can be populated on demand.
- **`imageCount`** is a Mongoose virtual — derived, never stored, so it can't
  drift out of sync with the actual images.
- **Errors are centralized.** Controllers throw `ApiError(status, message)` (or
  let Mongoose validation throw); a single error handler converts everything —
  including bad ObjectIds and validation failures — into consistent JSON.
  No route ever returns an HTML error page.
- **Sharing marks a collection public** so the generated link resolves, and is
  idempotent — re-sharing returns the existing code rather than churning it.
