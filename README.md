# QuizAI ⚡

> AI-powered quiz application built with Next.js 14, GPT-4o, and Clerk auth.

![QuizAI](https://img.shields.io/badge/Next.js-14-black?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square) ![GPT-4o](https://img.shields.io/badge/GPT--4o-Powered-green?style=flat-square)

---

## Features

### Core
- 🤖 **AI Quiz Generation** — GPT-4o generates contextual MCQs with explanations, tailored by topic, difficulty, and count
- 📝 **Quiz Interface** — One question at a time, dot navigator, configurable per-question timer, hint system
- 📊 **Results & Breakdown** — Score, grade, time taken, question-by-question review with correct answers
- 📚 **Quiz History** — Searchable, filterable, sortable history; retake any past quiz
- 📈 **Analytics Dashboard** — Score trends, topic performance bar chart, difficulty breakdown, knowledge radar map

### Bonus
- 💬 **AI Learning Assistant** — Floating chat drawer powered by GPT-4o, quiz-context aware
- 💡 **Hint System** — Per-question AI hints with score penalty tracking
- 🔐 **Auth (Clerk)** — Sign in/up with social providers; UI adapts to auth state
- 📉 **Data Visualization** — Recharts: line chart, horizontal bar, radar chart

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/quizai.git
cd quizai
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# OpenAI — https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# Clerk — https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
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
- Model: `gpt-4o` with `response_format: { type: "json_object" }`
- Structured prompt enforces 4-option MCQ format with explanations
- Error handling: rate limits (429), empty responses, parse failures
- All API keys proxied server-side — never exposed to client

### Chat Assistant (`/api/chat`)
- Model: `gpt-4o` with quiz-context injected into system prompt
- Context includes: topic, difficulty, current question text
- Conversation history sent on each turn for multi-turn coherence

### Hint Generation (`/api/hint`)
- Generates subtle hints without revealing the answer
- Tracked per-session; score penalty logged in results

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── generate-quiz/     # GPT-4o quiz generation
│   │   ├── chat/              # AI assistant endpoint
│   │   └── hint/              # Per-question hints
│   ├── quiz/                  # Quiz session page
│   ├── results/               # Results & breakdown
│   ├── history/               # Quiz history
│   ├── analytics/             # Charts & stats
│   └── sign-in / sign-up/     # Clerk auth pages
├── components/
│   ├── layout/Navbar.tsx
│   └── quiz/
│       ├── QuizCard.tsx        # Question + options
│       ├── QuizProgress.tsx    # Progress bar + dot nav
│       ├── QuizTimer.tsx       # SVG countdown ring
│       └── ChatAssistant.tsx   # Floating chat drawer
├── store/index.ts              # Zustand (3 stores + localStorage)
├── lib/utils.ts                # Helpers, formatters, analytics builders
└── types/index.ts              # All TypeScript types
```

### Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Zustand + persist | Lightweight, minimal boilerplate, built-in localStorage |
| AI calls | Next.js API routes | Keys never reach client; centralized error handling |
| GPT-4o JSON mode | `response_format: json_object` | Reliable structured output, no regex hacking |
| Persistence | localStorage | No backend required; fast DX; sufficient for scope |
| Auth | Clerk | Drop-in, social login, free tier generous |
| Charts | Recharts | Best React ecosystem fit; declarative API |

### State Architecture

Three independent Zustand stores with `persist` middleware:

- **`useQuizStore`** — Active session (questions, answers, hints, index), result, generation state. Session persists across refreshes via `partialize`.
- **`useHistoryStore`** — All past `HistoryEntry[]`, fully persisted.
- **`useChatStore`** — Chat messages and open state (in-memory only, no persist).

---

## Known Limitations

- **No cross-device sync** — localStorage is per-browser; Supabase integration would fix this
- **No true offline support** — AI generation requires network; PWA caching not implemented
- **Rate limits** — OpenAI free tier has RPM limits; UI shows friendly error messages
- **Auth is cosmetic** — Clerk provides auth UI but history isn't tied to user ID (localStorage is local); merging is a next step
- **No question deduplication** — Same topic can produce similar questions across sessions

---

## Screenshots

| Page | Description |
|---|---|
| `/` | Quiz creation form with topic suggestions, difficulty, timer toggle |
| `/quiz` | Question card, dot navigator, hint button, timer ring |
| `/results` | Score hero, grade, per-question expandable breakdown |
| `/history` | Searchable table with retake and delete |
| `/analytics` | Line chart, bar chart, radar chart, stat cards |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **AI**: OpenAI GPT-4o
- **Auth**: Clerk
- **Charts**: Recharts
- **Animations**: CSS keyframes + Tailwind
- **Fonts**: Bebas Neue (display), DM Sans (body), JetBrains Mono (mono)
- **Icons**: Lucide React
- **Hosting**: Vercel
