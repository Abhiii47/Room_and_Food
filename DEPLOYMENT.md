# Deployment Guide - Vercel (Frontend) + Render (Backend)

## Frontend Deployment on Vercel

### Setup Steps:
1. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub/GitLab repository
   - Set the **Root Directory** to `frontend`

2. **Configure Build Settings:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Environment Variables:**
   - Add `VITE_API_URL` with your Render backend URL (e.g., `https://your-backend.onrender.com/api`)
   - Vercel will automatically inject this during build

4. **Deploy:**
   - Vercel will automatically deploy on every push to your main branch
   - The `vercel.json` file handles SPA routing (fixes 404 on refresh)

### Vercel Configuration:
- The `frontend/vercel.json` file is already configured for SPA routing
- All routes except `/api/*` will serve `index.html` (handles React Router)

---

## Backend Deployment on Render

### Setup Steps:
1. **Create a Web Service on Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure Service:**
   - **Name:** room-food-finder-backend (or your preferred name)
   - **Environment:** Node
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid if needed)

3. **Environment Variables (Add in Render Dashboard):**
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_random_secret_key
   BASE_URL=https://your-backend.onrender.com
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
   **Important:** 
   - Replace `your_mongodb_connection_string` with your MongoDB Atlas connection string
   - Replace `your_strong_random_secret_key` with a secure random string
   - Replace `your-backend.onrender.com` with your actual Render URL
   - Replace `your-frontend.vercel.app` with your actual Vercel URL

4. **Health Check:**
   - Render will use `/api/health` endpoint for health checks
   - This is already configured in `render.yaml`

5. **Deploy:**
   - Render will automatically deploy on every push to your main branch
   - First deployment may take 5-10 minutes

### Alternative: Using render.yaml
- The `render.yaml` file in the root can be used for Infrastructure as Code
- You can import it in Render dashboard for automatic configuration

---

## Important Notes:

### CORS Configuration:
- The backend is configured to accept requests from your Vercel frontend
- Set `FRONTEND_URL` in Render to your Vercel URL
- Multiple URLs can be comma-separated: `https://app1.vercel.app,https://app2.vercel.app`

### File Uploads:
- **Important:** Render's free tier has ephemeral storage (files are deleted on restart)
- For production, you should use:
  - AWS S3
  - Cloudinary
  - Or another cloud storage service
- Update `backend/src/routes/listings.js` to use cloud storage instead of local filesystem

### MongoDB:
- Use MongoDB Atlas (free tier available)
- Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs) or Render's IP ranges

### Environment Variables Summary:

**Frontend (Vercel):**
- `VITE_API_URL` - Your Render backend URL (e.g., `https://your-backend.onrender.com/api`)

**Backend (Render):**
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Port number (Render sets this automatically, but 10000 is default)
- `BASE_URL` - Your backend URL (for image URLs)
- `FRONTEND_URL` - Your Vercel frontend URL (for CORS)
- `NODE_ENV` - Set to `production`

---

## Testing After Deployment:

1. **Test Backend:**
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should return: `{"ok":true,"now":"..."}`

2. **Test Frontend:**
   - Visit your Vercel URL
   - Try navigating to different routes
   - Refresh the page on `/bookings` - should NOT show 404

3. **Test API Connection:**
   - Open browser console on frontend
   - Check for CORS errors
   - Try logging in/registering

---

## Troubleshooting:

### 404 on Refresh (Fixed):
- ✅ `vercel.json` is configured for SPA routing
- ✅ All routes serve `index.html` except API routes

### CORS Errors:
- Check `FRONTEND_URL` in Render matches your Vercel URL exactly
- Include protocol: `https://your-app.vercel.app` (not just `your-app.vercel.app`)

### Backend Not Starting:
- Check Render logs
- Verify `MONGO_URI` is set correctly
- Check that `PORT` environment variable is set (Render sets this automatically)

### Images Not Loading:
- Render free tier deletes uploads on restart
- Implement cloud storage (S3, Cloudinary) for production

