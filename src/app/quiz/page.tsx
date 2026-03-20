"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizTimer } from "@/components/quiz/QuizTimer";

export default function QuizPage() {
  const router = useRouter();
  const { session, completeQuiz } = useQuizStore();

  useEffect(() => {
    if (!session || session.status === "completed") {
      if (session?.status === "completed") {
        router.replace("/results");
      } else {
        router.replace("/");
      }
    }
  }, [session, router]);

  if (!session || session.status === "completed") return null;

  const currentQuestion = session.questions[session.currentIndex];
  const isLast = session.currentIndex === session.questions.length - 1;
  const allAnswered = session.questions.every((q) => session.answers[q.id]);

  function handleFinish() {
    completeQuiz();
    router.push("/results");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs text-ghost/40 uppercase tracking-widest">
            {session.config.topic}
          </p>
          <p className="font-mono text-xs text-acid mt-0.5">
            {session.config.difficulty}
          </p>
        </div>
        {session.config.timerEnabled && (
          <QuizTimer
            key={session.currentIndex}
            seconds={session.config.timeLimitSeconds}
            onExpire={() => {
              if (isLast && allAnswered) handleFinish();
              else useQuizStore.getState().goToQuestion(
                Math.min(session.currentIndex + 1, session.questions.length - 1)
              );
            }}
          />
        )}
      </div>

      {/* Progress */}
      <QuizProgress
        current={session.currentIndex + 1}
        total={session.questions.length}
        answers={session.answers}
        questions={session.questions}
        onJump={(i) => useQuizStore.getState().goToQuestion(i)}
      />

      {/* Question card */}
      <QuizCard
        key={currentQuestion.id}
        question={currentQuestion}
        selectedOption={session.answers[currentQuestion.id] ?? null}
        onSelect={(optionId) =>
          useQuizStore.getState().setAnswer(currentQuestion.id, optionId)
        }
        questionIndex={session.currentIndex}
        totalQuestions={session.questions.length}
        hintsUsed={session.hintsUsed}
        onPrev={() =>
          useQuizStore.getState().goToQuestion(session.currentIndex - 1)
        }
        onNext={() => {
          if (isLast) handleFinish();
          else useQuizStore.getState().goToQuestion(session.currentIndex + 1);
        }}
        isFirst={session.currentIndex === 0}
        isLast={isLast}
        allAnswered={allAnswered}
        onFinish={handleFinish}
      />
    </div>
  );
}
