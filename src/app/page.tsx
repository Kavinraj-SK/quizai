"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, BookOpen, Gauge, Hash, Clock, ChevronRight, Sparkles } from "lucide-react";
import { useQuizStore } from "@/store";
import { cn, difficultyColor } from "@/lib/utils";
import type { Difficulty } from "@/types";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const QUESTION_COUNTS = [5, 10, 15, 20];

const TOPIC_SUGGESTIONS = [
  "React Hooks", "World History", "Python Basics", "Astronomy",
  "Machine Learning", "Ancient Rome", "JavaScript ES6", "Human Biology",
  "Climate Science", "Linear Algebra", "Film Noir", "Microeconomics",
];

export default function HomePage() {
  const router = useRouter();
  const { startSession, setGenerating, setGenerationError, isGenerating, generationError } =
    useQuizStore();

  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(30);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setGenerationError(null);

    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), numQuestions, difficulty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate quiz");
      }

      startSession(
        { topic: topic.trim(), numQuestions, difficulty, timerEnabled, timeLimitSeconds },
        data.questions
      );

      router.push("/quiz");
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
      {/* Hero */}
      <div className="mb-12 opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: "forwards" }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-xs text-acid tracking-widest uppercase bg-acid/10 px-3 py-1 rounded-full border border-acid/20">
            GPT-4o Powered
          </span>
        </div>
        <h1 className="font-display text-7xl md:text-9xl text-ghost leading-none tracking-wider mb-4">
          TEST WHAT<br />
          <span className="text-acid">YOU KNOW</span>
        </h1>
        <p className="text-ghost/50 text-lg max-w-md leading-relaxed">
          Generate AI-crafted quizzes on any topic in seconds. Track your progress. Master anything.
        </p>
      </div>

      {/* Form card */}
      <div
        className="glass rounded-2xl p-6 md:p-8 space-y-6 opacity-0 animate-slide-up stagger-2"
        style={{ animationFillMode: "forwards" }}
      >
        {/* Topic input */}
        <div>
          <label className="flex items-center gap-2 text-xs font-mono text-ghost/40 uppercase tracking-widest mb-2">
            <BookOpen className="w-3 h-3" /> Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="e.g. JavaScript Closures, World War II, Quantum Physics..."
            className="w-full bg-ink/60 border border-ghost/10 rounded-xl px-4 py-3 text-ghost placeholder:text-ghost/20 focus:outline-none focus:border-acid/50 focus:ring-2 focus:ring-acid/10 transition-all font-body text-base"
          />
          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {TOPIC_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setTopic(s)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-all",
                  topic === s
                    ? "border-acid/50 bg-acid/10 text-acid"
                    : "border-ghost/10 text-ghost/30 hover:border-ghost/30 hover:text-ghost/60"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Number of questions */}
        <div>
          <label className="flex items-center gap-2 text-xs font-mono text-ghost/40 uppercase tracking-widest mb-2">
            <Hash className="w-3 h-3" /> Questions
          </label>
          <div className="grid grid-cols-4 gap-2">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setNumQuestions(n)}
                className={cn(
                  "py-2.5 rounded-lg text-sm font-medium border transition-all",
                  numQuestions === n
                    ? "border-acid bg-acid/10 text-acid"
                    : "border-ghost/10 text-ghost/40 hover:border-ghost/30 hover:text-ghost"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="flex items-center gap-2 text-xs font-mono text-ghost/40 uppercase tracking-widest mb-2">
            <Gauge className="w-3 h-3" /> Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "py-2.5 rounded-lg text-sm font-medium border transition-all",
                  difficulty === d
                    ? difficultyColor(d)
                    : "border-ghost/10 text-ghost/40 hover:border-ghost/30 hover:text-ghost"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Timer toggle */}
        <div className="flex items-center justify-between p-4 bg-ink/40 rounded-xl border border-ghost/5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-ghost/40" />
            <span className="text-sm text-ghost/60">Timer per question</span>
          </div>
          <div className="flex items-center gap-3">
            {timerEnabled && (
              <div className="flex items-center gap-1">
                {[15, 30, 60].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTimeLimitSeconds(s)}
                    className={cn(
                      "text-xs px-2 py-1 rounded border transition-all",
                      timeLimitSeconds === s
                        ? "border-acid/50 bg-acid/10 text-acid"
                        : "border-ghost/10 text-ghost/30"
                    )}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setTimerEnabled((v) => !v)}
              className={cn(
                "relative w-10 h-6 rounded-full transition-all",
                timerEnabled ? "bg-acid" : "bg-ghost/10"
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-4 h-4 bg-ink rounded-full transition-all",
                  timerEnabled ? "left-5" : "left-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* Error */}
        {generationError && (
          <div className="p-3 bg-ember/10 border border-ember/30 rounded-lg text-ember text-sm">
            {generationError}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-display text-2xl tracking-widest transition-all",
            topic.trim() && !isGenerating
              ? "bg-acid text-ink hover:bg-acid-dim acid-glow animate-pulse-acid cursor-pointer"
              : "bg-ghost/5 text-ghost/20 cursor-not-allowed"
          )}
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              GENERATING...
            </>
          ) : (
            <>
              GENERATE QUIZ
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Ticker tape */}
      <div className="mt-10 ticker-wrapper opacity-0 animate-fade-in stagger-3" style={{ animationFillMode: "forwards" }}>
        <div className="flex gap-8 animate-ticker whitespace-nowrap">
          {[...TOPIC_SUGGESTIONS, ...TOPIC_SUGGESTIONS].map((s, i) => (
            <span key={i} className="font-display text-ghost/10 text-2xl tracking-widest shrink-0">
              {s} ·
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
