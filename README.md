# AI Itinerary Planner

Plan smarter trips with personalized day-wise recommendations, budgets, routes, and travel insights.

## Stack

- React + Vite
- Tailwind CSS
- React Router
- Framer Motion
- Express.js
- MongoDB + Mongoose
- OpenAI Responses API with `gpt-5.4-mini` by default

## Project Structure

```text
client/   # premium React frontend
server/   # Express API, MongoDB models, AI + itinerary logic
```

## Setup

1. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`.
2. Install dependencies:

```bash
npm run install:all
```

3. Start MongoDB locally or point `MONGODB_URI` at your hosted MongoDB instance.
4. Seed the place dataset:

```bash
npm run seed
```

5. Run the backend and frontend in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

## Environment Variables

Backend:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_PREMIUM_MODEL`
- `UNSPLASH_ACCESS_KEY`
- `CLIENT_URL`

Frontend:

- `VITE_API_BASE_URL`

## Render Deploy

Use these production URLs on Render:

- Frontend URL: `https://tripsyncproject.onrender.com`
- Backend URL: `https://tripsyncfinal.onrender.com`
- Frontend `VITE_API_BASE_URL`: `https://tripsyncfinal.onrender.com/api`
- Backend `CLIENT_URL`: `https://tripsyncproject.onrender.com`

If you redeploy after changing environment variables, trigger a fresh deploy for both services so the new values are picked up.

## Features

- Premium landing page and trip planner flow
- Register, login, logout, and persistent secure session checks
- Backend scoring engine and realistic draft itinerary builder
- OpenAI Responses API enrichment with strict JSON outputs
- Regenerate individual itinerary days
- Save, browse, view, and delete trips
- MongoDB seed data for Jaipur, Goa, Manali, Udaipur, and Rishikesh

## Notes

- AI generation is backend-only.
- The backend builds itinerary structure before sending it to OpenAI.
- Premium upgrade is supported by sending `premium=true` from the planner flow.
- Landing and browsing are public, but generating itineraries and managing saved trips require login.

## Authentication

- Authentication uses JWT stored in a secure HTTP-only cookie.
- The frontend never stores the auth token in `localStorage`.
- In development, cookies use `sameSite=lax`; in production they switch to `sameSite=none` with `secure=true`.
- Protected routes include planner access, itinerary generation, saved trips, trip details, regenerate-day, and trip deletion.

## Unsplash Images

- Add `UNSPLASH_ACCESS_KEY` to your backend environment from your Unsplash developer app.
- The app hotlinks Unsplash image URLs directly and stores attribution metadata for reuse.
- Demo-mode Unsplash apps can be rate-limited, so MongoDB caching is used to reduce repeated image lookups.
- If you need higher request volume in production, apply for higher Unsplash limits.
