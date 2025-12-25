# Room & Food Finder (Frontend + Backend - MongoDB)

This project contains two separate apps:
- `frontend/` — React + Vite frontend
- `backend/`  — Node.js + Express + MongoDB (Mongoose) backend with JWT auth

Functionality:
- Users register/login (backend issues JWT). Roles: user, provider.
- Providers can create listings (with image upload), manage listings, and accept/decline bookings.
- Users can browse listings and create bookings. Booking statuses stored in DB.
- Images are stored on backend in `/uploads` (for production, attach S3 or similar).

Quick start (backend):
1. Install MongoDB and run it locally, or use MongoDB Atlas.
2. `cd backend`
3. Copy `.env.example` -> `.env` and fill values (MONGO_URI, JWT_SECRET, SMTP settings optional)
4. `npm install`
5. `npm run dev` (uses nodemon) — server runs on port 5000 by default

Quick start (frontend):
1. `cd frontend`
2. Copy `.env.example` -> `.env.local` and set `VITE_API_URL` to your backend (e.g. http://localhost:5000)
3. `npm install`
4. `npm run dev` — open http://localhost:5173

Notes:
- This scaffold is meant to be a complete demo. Replace local image storage with S3 for production.
- SMTP/email notifications are optional — configure in backend `.env` and enable in bookings controller.
