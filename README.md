<p align="center">
  <img src="https://img.shields.io/badge/Gugu-AI%20Mental%20Wellness-7a8c67?style=for-the-badge&logo=leaf&logoColor=white" alt="Gugu Badge"/>
</p>

# 🍃 Gugu — AI Mental Wellness Companion

**Gugu** is a full-stack AI-powered mental wellness platform that provides empathetic conversational support, crisis detection, therapist matching, and wellness tools — all in one place.

> _"Healing is not linear. Be gentle with yourself as you grow."_

---

## ✨ Features

| Feature                       | Description                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| 🤖 **AI Chat (Gugu)**         | Empathetic conversational AI using Hugging Face LLM with CBT, DBT & Motivational Interviewing techniques |
| 🚨 **Crisis Detection**       | Auto-detects self-harm/suicide signals and immediately escalates to a therapist                          |
| 👨‍⚕️ **Therapist Matching**     | AI suggests referrals based on conversation analysis; patient consents; therapist claims the case        |
| 📊 **Mood Tracking**          | 1–5 scale mood slider with visual history charts                                                         |
| 📅 **Appointment Scheduling** | Full appointment management for therapists and patients                                                  |
| 📝 **Clinical Notes**         | Secure notepad for therapists to document patient sessions                                               |
| 🎮 **Wellness Mini-Games**    | Box breathing, bubble pop, and memory match for quick stress relief                                      |
| 📹 **Video Resources**        | Curated mental wellness videos for meditation, anxiety, sleep & motivation                               |
| 🔐 **Role-Based Access**      | Separate dashboards and features for patients and therapists                                             |
| 📱 **Responsive Design**      | Desktop sidebar + mobile bottom navigation                                                               |

---

## 🏗️ Architecture

```
┌─────────────────────────────┐      ┌──────────────────────────────┐
│     Frontend (React 19)     │      │  Hugging Face Inference API  │
│     Vite · TailwindCSS      │─────▶│  router.huggingface.co       │
│     Hosted on Vercel         │      │  (Llama 3.1 8B Instruct)    │
└──────────┬──────────────────┘      └──────────────────────────────┘
           │ REST API
           ▼
┌─────────────────────────────┐
│  Backend (Hono Framework)   │
│  Cloudflare Workers         │
│  JWT Auth · PBKDF2 Hashing  │
│  D1 Database (SQLite)       │
└─────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology                                                    | Purpose                 |
| ------------------------------------------------------------- | ----------------------- |
| [React 19](https://react.dev)                                 | UI framework            |
| [Vite 6](https://vitejs.dev)                                  | Build tool & dev server |
| [TailwindCSS](https://tailwindcss.com) (CDN)                  | Utility-first styling   |
| [React Router 7](https://reactrouter.com)                     | Client-side routing     |
| [Recharts](https://recharts.org)                              | Mood history charts     |
| [Lucide React](https://lucide.dev)                            | Icon library            |
| [Hugging Face API](https://huggingface.co/docs/api-inference) | AI chat completions     |

### Backend

| Technology                                            | Purpose                   |
| ----------------------------------------------------- | ------------------------- |
| [Hono](https://hono.dev)                              | Lightweight web framework |
| [Cloudflare Workers](https://workers.cloudflare.com)  | Serverless edge runtime   |
| [Cloudflare D1](https://developers.cloudflare.com/d1) | SQLite database           |
| [jose](https://github.com/panva/jose)                 | JWT authentication        |
| Web Crypto API (PBKDF2)                               | Password hashing          |

---

## 📁 Project Structure

```
Copy-of-Gugu---AI-Mental-Wellness/
├── frontend/
│   ├── pages/
│   │   ├── Home.tsx              # Landing page with mood slider
│   │   ├── SignIn.tsx            # Login / Register
│   │   ├── Chat.tsx              # AI chat with Gugu
│   │   ├── Dashboard.tsx         # Patient dashboard, stats & mini-games
│   │   ├── Therapists.tsx        # Browse & book therapists
│   │   ├── Videos.tsx            # Mental wellness video resources
│   │   ├── MeetingRoom.tsx       # Video call meeting room
│   │   ├── TherapistDashboard.tsx# Therapist overview & alerts
│   │   ├── TherapistPatients.tsx # Patient list
│   │   ├── TherapistSchedule.tsx # Appointment management
│   │   ├── TherapistNotes.tsx    # Clinical notes
│   │   └── TherapistSettings.tsx # Profile settings
│   ├── components/
│   │   ├── Layout.tsx            # Sidebar/bottom navigation
│   │   ├── MoodSlider.tsx        # Mood selection component
│   │   └── ProtectedRoute.tsx    # Role-based route guard
│   ├── services/
│   │   └── huggingFaceService.ts # Hugging Face AI integration
│   ├── contexts/
│   │   └── AuthContext.tsx       # JWT auth state management
│   ├── types.ts                  # TypeScript interfaces
│   ├── App.tsx                   # Root component & routes
│   ├── .env.example              # Environment template
│   └── vite.config.ts            # Vite configuration
│
├── backend/
│   ├── src/
│   │   ├── index.ts              # All API routes (22 endpoints)
│   │   └── auth.ts               # Password hashing & JWT
│   ├── schema.sql                # Database schema (7 tables)
│   ├── wrangler.toml             # Cloudflare Workers config
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A [Hugging Face](https://huggingface.co/settings/tokens) API token
- A [Cloudflare](https://dash.cloudflare.com) account (for backend deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/vKS-Rajput/Copy-of-Gugu---AI-Mental-Wellness.git
cd Copy-of-Gugu---AI-Mental-Wellness
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_HF_API_KEY="your_huggingface_api_key"
VITE_HF_MODEL_ID="meta-llama/Llama-3.1-8B-Instruct"
VITE_API_URL="https://gugu-backend.revastra.workers.dev"
```

Start the dev server:

```bash
npm run dev
# App runs on http://localhost:3000
```

### 3. Setup Backend

```bash
cd backend
npm install
```

Login to Cloudflare:

```bash
npx wrangler login
```

Create the D1 database and run migrations:

```bash
npx wrangler d1 create gugu-db
npx wrangler d1 execute gugu-db --file=./schema.sql
```

> **Note:** Update the `database_id` in `wrangler.toml` with the ID returned by `d1 create`.

Start the backend dev server:

```bash
npm run dev
# API runs on http://localhost:8787
```

### 4. Deploy

**Backend** (Cloudflare Workers):

```bash
cd backend && npx wrangler deploy
```

**Frontend** (Vercel):

```bash
cd frontend && npm run build
# Deploy the `dist/` folder to Vercel
```

---

## 🗄️ Database Schema

| Table                | Purpose                                                           |
| -------------------- | ----------------------------------------------------------------- |
| `users`              | Patient & therapist accounts (email, password hash, role)         |
| `mood_logs`          | Mood scores (1–5) with timestamps                                 |
| `patient_summaries`  | AI-generated crisis escalation reports                            |
| `notes`              | Therapist clinical notes                                          |
| `appointments`       | Scheduled sessions between patients & therapists                  |
| `therapist_profiles` | Therapist bio, rate, specialties                                  |
| `therapy_requests`   | AI matching pipeline (pending → approved → scheduled → completed) |

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| `POST` | `/api/auth/register` | Register a new user   |
| `POST` | `/api/auth/login`    | Login & get JWT token |
| `GET`  | `/api/auth/me`       | Get current user info |

### Patient

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| `GET`  | `/api/dashboard`            | Dashboard stats & mood history |
| `POST` | `/api/summaries`            | Save AI escalation summary     |
| `POST` | `/api/therapy-requests`     | Request therapist matching     |
| `GET`  | `/api/therapy-requests/my`  | View my therapy requests       |
| `GET`  | `/api/appointments/patient` | View my appointments           |

### Therapist

| Method     | Endpoint                             | Description              |
| ---------- | ------------------------------------ | ------------------------ |
| `GET`      | `/api/summaries`                     | View patient escalations |
| `GET`      | `/api/patients`                      | List assigned patients   |
| `GET/POST` | `/api/notes`                         | Manage clinical notes    |
| `GET/POST` | `/api/appointments`                  | Manage appointments      |
| `GET/POST` | `/api/therapist/profile`             | Manage profile           |
| `PATCH`    | `/api/therapy-requests/:id/approve`  | Approve a request        |
| `PATCH`    | `/api/therapy-requests/:id/schedule` | Schedule a session       |

---

## 🤖 AI Chat Pipeline

1. **User sends message** → Chat history + system prompt sent to Hugging Face
2. **AI responds** with structured JSON containing:
   - `response` — The conversational reply
   - `isOutOfControl` — Crisis flag (auto-escalates to therapist)
   - `shouldRefer` — Referral suggestion (asks patient for consent)
   - `domain` — Concern area (anxiety, depression, trauma, etc.)
   - `therapistSummary` — Clinical summary for the therapist
3. **Crisis detected** → Automatic therapist notification + therapy request
4. **Referral suggested** → Patient confirms → Therapy request created

---

## 🎨 Design System

Custom color palette built on nature-inspired tones:

| Color | Name  | Hex       | Usage                           |
| ----- | ----- | --------- | ------------------------------- |
| 🟢    | Sage  | `#7a8c67` | Primary (buttons, nav, accents) |
| 🟡    | Warm  | `#e6b87a` | Backgrounds, warm highlights    |
| 🔴    | Clay  | `#e0704e` | Alerts, crisis indicators       |
| 🔵    | Ocean | `#368dae` | Charts, mood indicators         |

**Typography:** DM Sans (body) + DM Serif Display (headings)

---

## 🔒 Security Notes

- Passwords are hashed with **PBKDF2** (100,000 iterations, SHA-256)
- Authentication uses **JWT tokens** (HS256, 24-hour expiry)
- Role-based access control on all protected routes
- API keys should be stored in `.env` (gitignored) and never committed

---

## 👥 Roles

| Role          | Access                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| **Patient**   | Chat with Gugu, mood tracking, view dashboard & mini-games, browse therapists, manage appointments    |
| **Therapist** | View patient alerts, manage therapy requests, clinical notes, schedule appointments, profile settings |

---

## 📄 License

This project is private and proprietary.

---

<p align="center">
  Made with 💚 by the Gugu Team
</p>
