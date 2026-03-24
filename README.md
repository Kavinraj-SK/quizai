# QuizAI 🧠

> AI-powered quiz and learning management platform built with Next.js 14, Cohere, and Supabase.

![QuizAI](https://img.shields.io/badge/Next.js-14-black?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square) ![Cohere](https://img.shields.io/badge/Cohere-Powered-green?style=flat-square)

---

## Live Demo
🔗 https://quizai-weld.vercel.app

---

## Features

### Core Quiz App
- 🤖 **AI Quiz Generation** — Cohere generates contextual MCQs tailored by topic, difficulty, and count
- 📝 **Quiz Interface** — One question at a time, dot navigator, configurable per-question timer, hint system
- 📊 **Results & Breakdown** — Score, grade, time taken, question-by-question review
- 📚 **Quiz History** — Persistent history tied to user account, saved across sessions and devices
- 📈 **Analytics Dashboard** — Score trends, topic performance, difficulty breakdown

### Authentication
- 🔐 **Custom Auth** — Login and registration pages built with Supabase Auth
- 👤 **Persistent Data** — Quiz history and scores saved to database, available on every login
- <img width="407" height="527" alt="image" src="https://github.com/user-attachments/assets/7738dbef-86ca-4072-8733-f6431ae846cb" />

  <img width="1303" height="610" alt="image" src="https://github.com/user-attachments/assets/b1e02dce-8e07-474f-a012-473ffd4b9725" />
  


### Teacher / Student Mode (LMS)
- **Teacher Dashboard** Create timed tests, set start/end window, assign to students by email
-  **Student Dashboard** View assigned tests, take them within the allowed time window
-  **Results Tracking**  Scores and attempts saved to Supabase database

**- press home button or create button to navigate to quiz page**

<img width="1303" height="610" alt="image" src="https://github.com/user-attachments/assets/224f15a2-f32c-4039-8586-c69562242308" />
<img width="1303" height="610" alt="image" src="https://github.com/user-attachments/assets/cff51ecb-004d-47db-9e3d-8ca0f0226ba4" />
<img width="1303" height="610" alt="image" src="https://github.com/user-attachments/assets/6c21cb4d-eb70-4c9c-9160-883373cd988a" />
<img width="1303" height="610" alt="image" src="https://github.com/user-attachments/assets/0bd9061d-02e0-48e3-97de-ee39e1d7fc52" />




---

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/Kavinraj-SK/quizai.git
cd quizai
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
# Cohere — https://dashboard.cohere.com
COHERE_API_KEY=your-cohere-key

# Clerk — https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase — https://supabase.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Deploy to Vercel
```bash
npx vercel --prod
# Add env vars in Vercel dashboard
```

---

## AI Integration

### Quiz Generation (`/api/generate-quiz`)
- Model: Cohere `command-r-plus`
- Structured prompt enforces 4-option MCQ format
- Error handling: rate limits, empty responses, parse failures
- All API keys proxied server-side — never exposed to client

### Chat Assistant (`/api/chat`)
- Context-aware AI assistant with quiz topic injected into system prompt
- Multi-turn conversation history sent on each request

### Hint Generation (`/api/hint`)
- Generates subtle hints without revealing the answer
- Tracked per-session with score penalty

---

## Architecture
```
src/
├── app/
│   ├── api/
│   │   ├── generate-quiz/     # Cohere quiz generation
│   │   ├── chat/              # AI assistant endpoint
│   │   └── hint/              # Per-question hints
│   ├── login/                 # Custom login page
│   ├── register/              # Custom register page
│   ├── role-select/           # Teacher or Student selection
│   ├── teacher/               # Teacher dashboard
│   ├── student/               # Student dashboard
│   ├── exam/                  # Anti-cheat exam page
│   │   └── result/            # Exam result page
│   ├── quiz/                  # Free quiz session
│   ├── results/               # Quiz results
│   ├── history/               # Quiz history
│   └── analytics/             # Charts & stats
├── components/
│   ├── layout/Navbar.tsx
│   └── quiz/
│       ├── QuizCard.tsx
│       ├── QuizProgress.tsx
│       ├── QuizTimer.tsx
│       └── ChatAssistant.tsx
├── lib/
│   ├── supabase.ts            # Supabase client
│   └── utils.ts
├── store/index.ts             # Zustand state
└── types/index.ts
```

### Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Zustand + persist | Lightweight, minimal boilerplate, built-in localStorage |
| AI calls | Next.js API routes | Keys never reach client; centralized error handling |
| Auth & Database | Supabase | Free tier, built-in auth, real-time DB, cross-device sync |
| Anti-cheat | Browser APIs | Fullscreen API, visibilitychange event, getUserMedia |
| Charts | Recharts | Best React ecosystem fit; declarative API |

---

## Known Limitations

- **Face recognition** — Webcam is active but ML-based face detection not yet implemented; planned via face-api.js
- **Rate limits** — Cohere free tier has RPM limits; UI shows friendly error messages
- **Question deduplication** — Same topic can produce similar questions across sessions

---

## Screenshots

| Page | Description |
|---|---|
| `/login` | Custom login page with Supabase auth |
| `/role-select` | Choose Teacher or Student role |
| `/teacher` | Create and assign timed tests |
| `/student` | View assigned tests and quiz history |
| `/exam` | Fullscreen anti-cheat exam with webcam |
| `/` | Quiz creation with topic, difficulty, timer |
| `/quiz` | Question card with hint and timer |
| `/results` | Score, grade, per-question breakdown |
| `/analytics` | Charts and performance stats |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **AI**: Cohere API
- **Auth & Database**: Supabase
- **Charts**: Recharts
- **Fonts**: Bebas Neue (display), DM Sans (body), JetBrains Mono (mono)
- **Icons**: Lucide React
- **Hosting**: Vercel
