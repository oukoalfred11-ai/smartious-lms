# Smartious LMS

Kenya's leading homeschool e-school platform — React + Vite + Node.js + MongoDB Atlas.
Live at: **https://smartioushomeschool.com**

---

## Local Development

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env — fill in MONGODB_URI and JWT_SECRET

# 3. Configure frontend environment (optional for local dev)
# The Vite proxy handles /api → localhost:5000 automatically
# Only needed if you want to test against a remote backend:
cp frontend/.env.example frontend/.env
# Set VITE_API_URL=https://your-render-url.onrender.com

# 4. Seed the database (run once)
npm run seed

# 5. Start both servers
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

---

## Demo Credentials

> Passwords are stored hashed in MongoDB. They are NEVER exposed in the frontend UI.
> Demo accounts cannot be deleted or have their roles changed via the API.

| Role    | Email                                         | Password       |
|---------|-----------------------------------------------|----------------|
| Admin   | admin@smartious.ac.ke                         | Admin@2024     |
| Teacher | j.muthomi@smartious.ac.ke                     | Teacher@2024   |
| Student | amara.osei@student.smartious.ac.ke            | Student@2024   |
| Parent  | janet.osei@gmail.com                          | Parent@2024    |
| Demo    | demo@smartious.ac.ke                          | Demo@2024      |

---

## Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repository
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add Environment Variables in Render dashboard:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a 64-character random hex string
   - `NODE_ENV` — `production`
   - `CLIENT_URL` — `https://smartioushomeschool.com`
7. After first deploy, run: `node src/seeds/seed.js` from the Render Shell

> Your backend URL will be: `https://smartious-api.onrender.com`

---

### Frontend → Netlify

1. Push the `frontend/` folder to a GitHub repository
2. Go to [netlify.com](https://netlify.com) → New Site → Import from Git
3. Set **Base directory**: `frontend`
4. Set **Build command**: `npm run build`
5. Set **Publish directory**: `frontend/dist`
6. Add Environment Variables in Netlify dashboard:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://smartious-api.onrender.com`)
7. Deploy

> The `netlify.toml` file handles React Router redirects automatically.

---

### Domain Setup (smartioushomeschool.com)

**Netlify custom domain:**
1. Netlify Dashboard → Domain Settings → Add custom domain
2. Enter: `smartioushomeschool.com`
3. Add these DNS records at your domain registrar:
   ```
   Type  Name   Value
   A     @      75.2.60.5
   CNAME www    your-site.netlify.app
   ```
4. Enable HTTPS (automatic via Netlify Let's Encrypt)

**CORS:** The backend already allows `https://smartioushomeschool.com` and `https://www.smartioushomeschool.com`.

---

## Architecture

| Layer     | Tech                         | Host     |
|-----------|------------------------------|----------|
| Frontend  | React 18 + Vite 5            | Netlify  |
| Backend   | Express.js + JWT             | Render   |
| Database  | MongoDB Atlas                | Atlas    |
| Fonts     | Playfair Display + Syne      | Google   |

### Security
- `helmet` — security headers on all responses
- `express-rate-limit` — 200 req/15min global, 20 req/15min on auth routes
- CORS locked to production domain + CLIENT_URL env var
- JWT tokens stored in localStorage, validated server-side on every request
- Passwords hashed with bcryptjs (salt rounds: 12)
- Demo users protected from deletion and role modification

---

## Post-Deployment Checklist

- [ ] Backend health check passes: `https://smartious-api.onrender.com/api/health`
- [ ] Login works for all 5 demo roles
- [ ] API connects (no CORS errors in browser console)
- [ ] Demo data visible in each portal
- [ ] No passwords visible in browser console or network tab
- [ ] HTTPS active on smartioushomeschool.com
- [ ] React Router redirects working (direct URL access works)
