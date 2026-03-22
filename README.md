# FitMind AI 🏋️‍♂️🤖

A premium, full-stack AI-powered fitness and nutrition tracker built for the future. FitMind AI acts as your personal fitness coach, integrating OpenRouter free models to generate personalized workout plans, diet suggestions, and answer fitness questions in real-time.

![FitMind AI](https://via.placeholder.com/1200x600/020817/00ff88?text=FitMind+AI+Dashboard)

## Features
- **AI Assistant:** Chat with your personal AI coach for real-time fitness guidance.
- **AI Plan Generator:** Instantly generate complete 7-day workout & diet plans based on your profile goals.
- **Dashboard:** Modern, glassmorphism UI with live Chart.js analytics for calories and macros.
- **Workout Tracker:** Log sessions, track endurance, filter by type, and monitor week-over-week trends.
- **Diet Tracker:** Log meals and visualize daily macronutrient breakdown (Protein, Carbs, Fats).
- **Progress Tracking:** Interactive body weight chart and measurement logging.
- **Gamification:** Daily streaks, XP points, and achievement badges to keep you motivated.

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS v4, Framer Motion, Chart.js, React Router
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB
- **AI Integration:** OpenRouter free models (Llama / similar OSS instruct models)
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs

---

## Local Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas URI)
- OpenRouter API Key

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fitmind
JWT_SECRET=your_super_secret_jwt_key
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
AI_PROVIDER=openrouter
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Start the React development server:
```bash
npm run dev
# App runs on http://localhost:5173
```

---

## Deployment Guide

This repo is ready for a split deployment:
- Frontend on Vercel
- Backend on Render
- Database on MongoDB Atlas

### 0. Prepare production values
Create these values before deploying:
- `MONGO_URI` (MongoDB Atlas connection string)
- `JWT_SECRET` (long random string)
- `OPENROUTER_API_KEY`
- `FRONTEND_URL` (your Vercel URL, e.g. `https://fitmind-ai.vercel.app`)

### 1. Deploy Backend (Render)
1. Push this repo to GitHub.
2. In Render, click **New +** -> **Web Service**.
3. Select the repo.
4. Use these settings:
	- Root Directory: `backend`
	- Build Command: `npm install`
	- Start Command: `npm start`
5. Add environment variables:
	- `PORT=5000`
	- `NODE_ENV=production`
	- `MONGO_URI=<your atlas uri>`
	- `JWT_SECRET=<your secret>`
	- `OPENROUTER_API_KEY=<your key>`
	- `FRONTEND_URL=<your vercel frontend url>`
6. Deploy and confirm health endpoint:
	- `https://<your-render-service>.onrender.com/api/health`

### 2. Deploy Frontend (Vercel)
1. In Vercel, click **Add New** -> **Project**.
2. Import the same GitHub repo.
3. Set Root Directory to `frontend`.
4. Framework Preset should auto-detect as `Vite`.
5. Add environment variable:
	- `VITE_API_URL=https://<your-render-service>.onrender.com`
6. Deploy.

### 3. Update CORS (if you use custom domain)
If you later move frontend to a custom domain, update backend Render env:
- `FRONTEND_URL=https://yourdomain.com`

### 4. Verify end-to-end
1. Open frontend URL.
2. Create/login user.
3. Add workout and meal entries.
4. Open AI assistant and test a prompt.
5. Confirm browser network calls hit your Render backend.

### Optional: One-click Blueprint for Render
This repo includes a `render.yaml` blueprint at project root. You can deploy backend from Render Blueprint and only fill secret env values.

## Contact
Built as a premium full-stack developer portfolio project for 2026.
