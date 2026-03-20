"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Lightbulb, Flag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuizStore } from "@/store";
import type { QuizQuestion } from "@/types";

interface Props {
  question: QuizQuestion;
  selectedOption: string | null;
  onSelect: (optionId: string) => void;
  questionIndex: number;
  totalQuestions: number;
  hintsUsed: string[];
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  allAnswered: boolean;
  onFinish: () => void;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export function QuizCard({
  question,
  selectedOption,
  onSelect,
  questionIndex,
  totalQuestions,
  hintsUsed,
  onPrev,
  onNext,
  isFirst,
  isLast,
  allAnswered,
  onFinish,
}: Props) {
  const { markHintUsed } = useQuizStore();
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  const hintAlreadyUsed = hintsUsed.includes(question.id);

  async function fetchHint() {
    if (hintAlreadyUsed) return;
    setLoadingHint(true);
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, topic: question.topic }),
      });
      const data = await res.json();
      setHint(data.hint ?? "No hint available.");
      markHintUsed(question.id);
    } catch {
      setHint("Could not load hint.");
    } finally {
      setLoadingHint(false);
    }
  }

  return (
    <div className="opacity-0 animate-slide-up" style={{ animationFillMode: "forwards" }}>
      {/* Question number */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-xs text-ghost/30">
          {String(questionIndex + 1).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
        </span>
        {hintAlreadyUsed && (
          <span className="font-mono text-xs text-yellow-500/60 bg-yellow-500/10 px-2 py-0.5 rounded-full">
            hint used −5pts
          </span>
        )}
      </div>

      {/* Question */}
      <div className="glass rounded-2xl p-6 md:p-8 mb-4">
        <h2 className="text-xl md:text-2xl font-medium text-ghost leading-relaxed mb-6">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, i) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={cn(
                "quiz-option w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                selectedOption === option.id
                  ? "border-acid bg-acid/10 text-ghost"
                  : "border-ghost/10 bg-ink/30 text-ghost/70 hover:border-ghost/25 hover:bg-ink/50 hover:text-ghost"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-medium transition-all",
                  selectedOption === option.id
                    ? "bg-acid text-ink"
                    : "bg-ghost/5 text-ghost/40"
                )}
              >
                {OPTION_LABELS[i]}
              </span>
              <span className="text-sm md:text-base leading-snug">{option.text}</span>
            </button>
          ))}
        </div>

        {/* Hint section */}
        {hint && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200/80">{hint}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={fetchHint}
          disabled={hintAlreadyUsed || loadingHint}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all",
            hintAlreadyUsed
              ? "text-ghost/20 cursor-not-allowed"
              : "text-yellow-400/60 hover:text-yellow-400 hover:bg-yellow-400/10 border border-yellow-400/10 hover:border-yellow-400/30"
          )}
        >
          {loadingHint ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lightbulb className="w-4 h-4" />
          )}
          {hintAlreadyUsed ? "Hint used" : "Get hint"}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className={cn(
              "flex items-center gap-1 px-3 py-2 rounded-lg text-sm border transition-all",
              isFirst
                ? "border-ghost/5 text-ghost/15 cursor-not-allowed"
                : "border-ghost/15 text-ghost/50 hover:border-ghost/30 hover:text-ghost"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          {isLast ? (
            <button
              onClick={onFinish}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-all",
                allAnswered
                  ? "bg-acid text-ink hover:bg-acid-dim"
                  : "bg-plasma/20 text-plasma-light hover:bg-plasma/30 border border-plasma/30"
              )}
            >
              <Flag className="w-4 h-4" />
              {allAnswered ? "Finish Quiz" : "Submit Anyway"}
            </button>
          ) : (
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-ghost/5 border border-ghost/10 text-ghost/70 hover:bg-ghost/10 hover:text-ghost hover:border-ghost/25 transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
