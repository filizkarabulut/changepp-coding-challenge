================================================================================
CHANGE++ FALL 2026 CODING CHALLENGE SUBMISSION
================================================================================

1. NAME AND EMAIL
-----------------
Name:  Filiz Karabulut
Email: filiz.karabulut@vanderbilt.edu


2. SETUP INSTRUCTIONS
---------------------

Prerequisites
  - Node.js 16 or higher
  - Docker Desktop (for local MongoDB)

BACKEND
  cd backend
  npm install
  cp .env.example .env

  Open .env and set:
    MONGODB_URI=mongodb://localhost:27017/image-sharing-app

  Start MongoDB:
    docker start changepp-mongo

    (If you have not created the container yet, run:
     docker run -d --name changepp-mongo -p 27017:27017 mongo)

  Start the server:
    npm start

  Backend runs at: http://localhost:5000
  (If port 5000 is occupied, e.g. by macOS AirPlay, set PORT=5050 in .env
   and update VITE_API_URL in the frontend step below accordingly.)

FRONTEND
  cd frontend
  npm install
  cp .env.example .env.local

  Open .env.local and set:
    VITE_API_URL=http://localhost:5000/api
    VITE_PIXABAY_API_KEY=your_key_here

  A free Pixabay API key can be obtained at https://pixabay.com/api/docs
  (The app falls back to a small set of demo images when no key is provided.)

  Start the dev server:
    npm run dev

  Frontend runs at: http://localhost:3000


3. REFLECTION
-------------
Building this app pushed me further into full-stack development than I expected.
I got more comfortable with Express middleware, Mongoose schemas, and wiring a
React context layer on top of REST calls. The biggest obstacles were
infrastructure, not code: a MongoDB regional AWS outage forced me mid-project to
drop Atlas and switch to a local Docker container, and the default port 5000
conflicted with macOS AirPlay Receiver so I moved the backend to 5050. Working
through those surprises reminded me that debugging environment issues is a real
and unavoidable part of building software.


4. FEEDBACK
-----------
The challenge was genuinely engaging and well-scoped -- the open-ended bonus
features gave me room to go further than the minimum.

5. BONUS FEATURES IMPLEMENTED
------------------------------
  - Public/private collection toggling (per-collection visibility control)
  - Shareable collection URLs with unique share codes
  - Confirmation dialogs before any destructive deletion
  - Edit collection name, description, and visibility in a dedicated modal
  - Add photos directly from inside the collection detail view
