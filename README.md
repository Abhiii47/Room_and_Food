# Room & Food Finder (Frontend + Backend - MongoDB)

This project contains two separate apps:
- `frontend/` — React + Vite frontend
- `backend/`  — Node.js + Express + MongoDB (Mongoose) backend with JWT auth

Functionality:
- Users register/login (backend issues JWT). Roles: user, provider, admin.
- Providers can create listings (with image upload), manage listings, and accept/decline bookings.
- Users can browse listings, create bookings, and write reviews with ratings.
- Admins have full access to manage all users, listings, bookings, and reviews.
- Images are stored on backend in `/uploads` (for production, attach S3 or similar).

Quick start (backend):
1. Install MongoDB and run it locally, or use MongoDB Atlas.
2. `cd backend`
3. Copy `.env.example` -> `.env` and fill values (MONGO_URI, JWT_SECRET, SMTP settings optional)
4. `npm install`
5. `npm run dev` (uses nodemon) — server runs on port 5000 by default

Quick start (frontend):
1. `cd room-food-finder-frontend`
2. Copy `.env.example` -> `.env.local` and set `REACT_APP_API_URL` to your backend (e.g. http://localhost:5000)
3. `npm install`
4. `npm start` — open http://localhost:3000

## Creating an Admin User

There are two ways to create an admin user:

### Method 1: Using the Admin Creation Script (Recommended)
```bash
cd backend
node src/Scripts/createAdmin.js <email> <password>
# Example:
node src/Scripts/createAdmin.js admin@example.com admin123
```

This will create a new admin user or promote an existing user to admin.

### Method 2: Promote via Admin Panel (if you already have an admin)
1. Log in as an existing admin
2. Go to Admin Panel
3. Find the user you want to promote
4. Change their role from the dropdown to "Admin"

### Method 3: Register with Admin Secret (if enabled)
Set `ADMIN_SECRET` in your `.env` file, then register with `adminSecret` in the request body.

Notes:
- This scaffold is meant to be a complete demo. Replace local image storage with S3 for production.
- SMTP/email notifications are optional — configure in backend `.env` and enable in bookings controller.
