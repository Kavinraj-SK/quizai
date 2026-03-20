"use client";

import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";

interface Props {
  current: number;
  total: number;
  answers: Record<string, string>;
  questions: QuizQuestion[];
  onJump: (index: number) => void;
}

export function QuizProgress({ current, total, answers, questions, onJump }: Props) {
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / total) * 100);

  return (
    <div className="mb-6 space-y-3">
      {/* Bar */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs text-ghost/30 uppercase tracking-widest">Progress</span>
        <span className="font-mono text-xs text-acid">
          {answeredCount}/{total} answered
        </span>
      </div>

      <div className="h-1.5 bg-ghost/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-acid rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Dot nav */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {questions.map((q, i) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = i === current - 1;
          return (
            <button
              key={q.id}
              onClick={() => onJump(i)}
              title={`Question ${i + 1}`}
              className={cn(
                "w-7 h-7 rounded-md text-xs font-mono font-medium transition-all",
                isCurrent
                  ? "bg-acid text-ink scale-110"
                  : isAnswered
                  ? "bg-acid/20 text-acid border border-acid/30 hover:bg-acid/30"
                  : "bg-ghost/5 text-ghost/30 border border-ghost/5 hover:bg-ghost/10 hover:text-ghost/50"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
