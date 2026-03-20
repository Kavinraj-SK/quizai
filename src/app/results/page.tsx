"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy, Clock, CheckCircle2, XCircle, MinusCircle,
  RotateCcw, Home, ChevronDown, ChevronUp, Lightbulb,
} from "lucide-react";
import { useState } from "react";
import { useQuizStore } from "@/store";
import { cn, scoreGrade, formatDuration, difficultyColor } from "@/lib/utils";
import type { QuestionResult } from "@/types";

export default function ResultsPage() {
  const router = useRouter();
  const { result, resetQuiz } = useQuizStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!result) router.replace("/");
  }, [result, router]);

  if (!result) return null;

  const { percentage, score, totalQuestions, timeTakenSeconds, config, questionResults } = result;
  const grade = scoreGrade(percentage);

  function handleRetake() {
    // Session already has questions; just reset answers via store
    useQuizStore.setState((s) => ({
      session: s.session
        ? { ...s.session, answers: {}, hintsUsed: [], currentIndex: 0, startedAt: Date.now(), status: "active" }
        : null,
      result: null,
    }));
    router.push("/quiz");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Hero score card */}
      <div
        className="glass rounded-2xl p-8 text-center mb-6 relative overflow-hidden opacity-0 animate-slide-up"
        style={{ animationFillMode: "forwards" }}
      >
        {/* Background score ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <span className="font-display text-[16rem] text-acid leading-none">{percentage}</span>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-ghost/5 border border-ghost/10 rounded-full mb-4">
            <span className={cn("text-xs font-mono uppercase tracking-widest", difficultyColor(config.difficulty).split(" ")[0])}>
              {config.difficulty}
            </span>
            <span className="text-ghost/20">·</span>
            <span className="text-xs font-mono text-ghost/40">{config.topic}</span>
          </div>

          <div className="text-8xl mb-2">{grade.emoji}</div>

          <div className="font-display text-7xl md:text-8xl text-acid tracking-wider leading-none mb-2">
            {percentage}%
          </div>

          <p className={cn("font-display text-3xl tracking-widest mb-6", grade.color)}>
            {grade.label.toUpperCase()}
          </p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-ink/40 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-4 h-4 text-acid" />
                <span className="font-display text-2xl text-acid">{score}</span>
              </div>
              <p className="text-ghost/30 text-xs font-mono">CORRECT</p>
            </div>
            <div className="p-3 bg-ink/40 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="w-4 h-4 text-ember" />
                <span className="font-display text-2xl text-ember">{totalQuestions - score}</span>
              </div>
              <p className="text-ghost/30 text-xs font-mono">WRONG</p>
            </div>
            <div className="p-3 bg-ink/40 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-ice" />
                <span className="font-display text-2xl text-ice">{formatDuration(timeTakenSeconds)}</span>
              </div>
              <p className="text-ghost/30 text-xs font-mono">TIME</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex gap-3 mb-8 opacity-0 animate-slide-up stagger-1"
        style={{ animationFillMode: "forwards" }}
      >
        <button
          onClick={handleRetake}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-acid/30 text-acid hover:bg-acid/10 transition-all font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Retake
        </button>
        <Link
          href="/"
          onClick={resetQuiz}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-acid text-ink hover:bg-acid-dim transition-all font-medium"
        >
          <Home className="w-4 h-4" />
          New Quiz
        </Link>
      </div>

      {/* Question breakdown */}
      <div
        className="opacity-0 animate-slide-up stagger-2"
        style={{ animationFillMode: "forwards" }}
      >
        <h2 className="font-display text-3xl text-ghost tracking-widest mb-4">BREAKDOWN</h2>
        <div className="space-y-3">
          {questionResults.map((qr, i) => (
            <QuestionResultItem
              key={qr.question.id}
              qr={qr}
              index={i}
              expanded={expandedId === qr.question.id}
              onToggle={() =>
                setExpandedId((id) => (id === qr.question.id ? null : qr.question.id))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestionResultItem({
  qr,
  index,
  expanded,
  onToggle,
}: {
  qr: QuestionResult;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { question, chosenOptionId, isCorrect, hintUsed } = qr;
  const skipped = chosenOptionId === null;

  const StatusIcon = skipped ? MinusCircle : isCorrect ? CheckCircle2 : XCircle;
  const statusColor = skipped
    ? "text-ghost/30"
    : isCorrect
    ? "text-acid"
    : "text-ember";

  return (
    <div
      className={cn(
        "rounded-xl border transition-all overflow-hidden",
        isCorrect ? "border-acid/15" : skipped ? "border-ghost/5" : "border-ember/20"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-ghost/3 transition-all"
      >
        <span className="font-mono text-xs text-ghost/30 w-5 shrink-0">{index + 1}</span>
        <StatusIcon className={cn("w-4 h-4 shrink-0", statusColor)} />
        <span className="flex-1 text-sm text-ghost/80 leading-snug line-clamp-2">
          {question.question}
        </span>
        {hintUsed && (
          <Lightbulb className="w-3.5 h-3.5 text-yellow-500/50 shrink-0" />
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-ghost/30 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ghost/30 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-ghost/5 pt-3">
          {/* Options */}
          <div className="space-y-2">
            {question.options.map((opt) => {
              const isChosen = opt.id === chosenOptionId;
              const isCorrectOpt = opt.id === question.correctOptionId;
              return (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg text-sm",
                    isCorrectOpt
                      ? "bg-acid/10 border border-acid/30 text-ghost"
                      : isChosen && !isCorrect
                      ? "bg-ember/10 border border-ember/30 text-ghost/70"
                      : "bg-ghost/3 border border-transparent text-ghost/40"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded flex items-center justify-center font-mono text-xs shrink-0",
                      isCorrectOpt ? "bg-acid text-ink" : "bg-ghost/5 text-ghost/30"
                    )}
                  >
                    {opt.id}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                  {isCorrectOpt && <CheckCircle2 className="w-3.5 h-3.5 text-acid shrink-0" />}
                  {isChosen && !isCorrect && <XCircle className="w-3.5 h-3.5 text-ember shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="p-3 bg-plasma/5 border border-plasma/15 rounded-lg flex gap-2">
            <Trophy className="w-4 h-4 text-plasma-light shrink-0 mt-0.5" />
            <p className="text-sm text-ghost/70 leading-relaxed">{question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
