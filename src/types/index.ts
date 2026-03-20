// ─── Quiz Core Types ────────────────────────────────────────────────────────

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface QuizOption {
  id: string; // "A" | "B" | "C" | "D"
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  topic: string;
}

export interface QuizConfig {
  topic: string;
  numQuestions: number;
  difficulty: Difficulty;
  timerEnabled: boolean;
  timeLimitSeconds: number; // per question, 0 = no limit
}

// ─── Quiz Session (in-progress) ─────────────────────────────────────────────

export interface QuizSession {
  id: string;
  config: QuizConfig;
  questions: QuizQuestion[];
  answers: Record<string, string>; // questionId → chosen optionId
  hintsUsed: string[]; // questionIds where hint was used
  currentIndex: number;
  startedAt: number; // Date.now()
  completedAt?: number;
  status: "idle" | "active" | "paused" | "completed";
}

// ─── Quiz Result ─────────────────────────────────────────────────────────────

export interface QuestionResult {
  question: QuizQuestion;
  chosenOptionId: string | null;
  isCorrect: boolean;
  hintUsed: boolean;
}

export interface QuizResult {
  sessionId: string;
  config: QuizConfig;
  questionResults: QuestionResult[];
  score: number; // raw correct count
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  completedAt: number;
}

// ─── Quiz History ─────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  topic: string;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  completedAt: number;
  questions: QuizQuestion[]; // stored for retake
  answers: Record<string, string>;
}

// ─── Chat / Assistant ─────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface PerformancePoint {
  date: string; // "MMM dd"
  score: number;
  topic: string;
  difficulty: Difficulty;
}

export interface CategoryPerformance {
  topic: string;
  avgScore: number;
  attempts: number;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface GenerateQuizPayload {
  topic: string;
  numQuestions: number;
  difficulty: Difficulty;
}

export interface GenerateQuizResponse {
  questions: QuizQuestion[];
}

export interface ChatPayload {
  messages: { role: "user" | "assistant"; content: string }[];
  quizContext?: {
    topic: string;
    difficulty: Difficulty;
    currentQuestion?: string;
  };
}

export interface HintPayload {
  question: QuizQuestion;
  topic: string;
}

export interface HintResponse {
  hint: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
