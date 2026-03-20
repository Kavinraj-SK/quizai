"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  seconds: number;
  onExpire: () => void;
}

export function QuizTimer({ seconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpireRef.current();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const pct = remaining / seconds;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  const isWarning = pct <= 0.5;
  const isDanger = pct <= 0.25;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24" cy="24" r={radius}
            fill="none"
            stroke="rgba(245,240,232,0.05)"
            strokeWidth="3"
          />
          <circle
            cx="24" cy="24" r={radius}
            fill="none"
            stroke={isDanger ? "#FF4D4D" : isWarning ? "#FFB800" : "#C8F135"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "font-mono text-sm font-medium",
              isDanger ? "text-ember" : isWarning ? "text-yellow-400" : "text-ghost"
            )}
          >
            {remaining}
          </span>
        </div>
      </div>
      <span className="font-mono text-xs text-ghost/30 uppercase tracking-widest">sec</span>
    </div>
  );
}
