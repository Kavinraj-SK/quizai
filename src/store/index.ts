import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  QuizSession,
  QuizConfig,
  QuizQuestion,
  QuizResult,
  HistoryEntry,
  QuestionResult,
  ChatMessage,
} from "@/types";

// ─── Quiz Store ───────────────────────────────────────────────────────────────

interface QuizStore {
  session: QuizSession | null;
  result: QuizResult | null;
  isGenerating: boolean;
  generationError: string | null;

  // Actions
  startSession: (config: QuizConfig, questions: QuizQuestion[]) => void;
  setAnswer: (questionId: string, optionId: string) => void;
  goToQuestion: (index: number) => void;
  markHintUsed: (questionId: string) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  setGenerating: (v: boolean) => void;
  setGenerationError: (e: string | null) => void;
  retakeQuiz: (entry: HistoryEntry) => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      session: null,
      result: null,
      isGenerating: false,
      generationError: null,

      startSession: (config, questions) => {
        set({
          session: {
            id: uuid(),
            config,
            questions,
            answers: {},
            hintsUsed: [],
            currentIndex: 0,
            startedAt: Date.now(),
            status: "active",
          },
          result: null,
        });
      },

      setAnswer: (questionId, optionId) => {
        const { session } = get();
        if (!session) return;
        set({
          session: {
            ...session,
            answers: { ...session.answers, [questionId]: optionId },
          },
        });
      },

      goToQuestion: (index) => {
        const { session } = get();
        if (!session) return;
        set({ session: { ...session, currentIndex: index } });
      },

      markHintUsed: (questionId) => {
        const { session } = get();
        if (!session || session.hintsUsed.includes(questionId)) return;
        set({
          session: {
            ...session,
            hintsUsed: [...session.hintsUsed, questionId],
          },
        });
      },

      completeQuiz: () => {
        const { session } = get();
        if (!session) return;

        const completedAt = Date.now();
        const timeTakenSeconds = Math.round(
          (completedAt - session.startedAt) / 1000
        );

        const questionResults: QuestionResult[] = session.questions.map((q) => {
          const chosen = session.answers[q.id] ?? null;
          return {
            question: q,
            chosenOptionId: chosen,
            isCorrect: chosen === q.correctOptionId,
            hintUsed: session.hintsUsed.includes(q.id),
          };
        });

        const score = questionResults.filter((r) => r.isCorrect).length;
        const percentage = Math.round((score / session.questions.length) * 100);

        const result: QuizResult = {
          sessionId: session.id,
          config: session.config,
          questionResults,
          score,
          totalQuestions: session.questions.length,
          percentage,
          timeTakenSeconds,
          completedAt,
        };

        set({
          session: { ...session, status: "completed", completedAt },
          result,
        });

        // Persist to history
        useHistoryStore.getState().addEntry({
          id: session.id,
          topic: session.config.topic,
          difficulty: session.config.difficulty,
          score,
          totalQuestions: session.questions.length,
          percentage,
          timeTakenSeconds,
          completedAt,
          questions: session.questions,
          answers: session.answers,
        });
      },

      resetQuiz: () => set({ session: null, result: null, generationError: null }),

      setGenerating: (v) => set({ isGenerating: v }),

      setGenerationError: (e) => set({ generationError: e }),

      retakeQuiz: (entry) => {
        set({
          session: {
            id: uuid(),
            config: {
              topic: entry.topic,
              difficulty: entry.difficulty,
              numQuestions: entry.totalQuestions,
              timerEnabled: false,
              timeLimitSeconds: 0,
            },
            questions: entry.questions,
            answers: {},
            hintsUsed: [],
            currentIndex: 0,
            startedAt: Date.now(),
            status: "active",
          },
          result: null,
        });
      },
    }),
    {
      name: "quizai-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
    }
  )
);

// ─── History Store ────────────────────────────────────────────────────────────

interface HistoryStore {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({ entries: [entry, ...state.entries] })),
      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      clearHistory: () => set({ entries: [] }),
    }),
    {
      name: "quizai-history",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Chat Store ───────────────────────────────────────────────────────────────

interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  setLoading: (v: boolean) => void;
  toggleChat: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>()((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: uuid(), timestamp: Date.now() },
      ],
    })),
  setLoading: (v) => set({ isLoading: v }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  clearChat: () => set({ messages: [] }),
}));
