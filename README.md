# FitMind AI 🏋️‍♂️🤖

A premium, full-stack AI-powered fitness and nutrition tracker built for the future. FitMind AI acts as your personal fitness coach, integrating OpenAI to generate personalized workout plans, diet suggestions, and answer fitness questions in real-time.

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
- **AI Integration:** OpenAI API (`gpt-3.5-turbo`)
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs

---

## Local Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas URI)
- OpenAI API Key

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
OPENAI_API_KEY=sk-your-openai-api-key
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

### Vercel (Frontend)
1. Push your repository to GitHub.
2. Go to Vercel, import the project.
3. Set the Root Directory to `frontend`.
4. Framework Preset: `Vite`.
5. Deploy.

### Render (Backend)
1. Go to Render.com and connect your GitHub repo.
2. Create a new "Web Service".
3. Root Directory: `backend`.
4. Build Command: `npm install`.
5. Start Command: `node server.js`.
6. Add all Environment Variables (`MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY`).
7. Deploy.
8. *Important:* Update your frontend `vit.config.js` or `api.js` base URL to point to the new Render URL.

## Contact
Built as a premium full-stack developer portfolio project for 2026.
