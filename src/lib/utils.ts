import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import type { Difficulty, HistoryEntry, PerformancePoint, CategoryPerformance } from "@/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function formatDate(timestamp: number): string {
  return format(new Date(timestamp), "MMM d, yyyy");
}

export function formatRelative(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function scoreGrade(percentage: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (percentage >= 90) return { label: "Excellent", color: "text-acid", emoji: "🏆" };
  if (percentage >= 75) return { label: "Great", color: "text-ice", emoji: "⚡" };
  if (percentage >= 60) return { label: "Good", color: "text-plasma-light", emoji: "✨" };
  if (percentage >= 40) return { label: "Fair", color: "text-yellow-400", emoji: "📚" };
  return { label: "Needs Work", color: "text-ember", emoji: "💪" };
}

export function difficultyColor(difficulty: Difficulty): string {
  return {
    Easy: "text-acid bg-acid/10 border-acid/30",
    Medium: "text-plasma-light bg-plasma/10 border-plasma/30",
    Hard: "text-ember bg-ember/10 border-ember/30",
  }[difficulty];
}

export function buildPerformancePoints(entries: HistoryEntry[]): PerformancePoint[] {
  return [...entries]
    .sort((a, b) => a.completedAt - b.completedAt)
    .slice(-20)
    .map((e) => ({
      date: format(new Date(e.completedAt), "MMM dd"),
      score: e.percentage,
      topic: e.topic,
      difficulty: e.difficulty,
    }));
}

export function buildCategoryPerformance(entries: HistoryEntry[]): CategoryPerformance[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const e of entries) {
    const existing = map.get(e.topic) ?? { total: 0, count: 0 };
    map.set(e.topic, { total: existing.total + e.percentage, count: existing.count + 1 });
  }
  return Array.from(map.entries())
    .map(([topic, { total, count }]) => ({
      topic,
      avgScore: Math.round(total / count),
      attempts: count,
    }))
    .sort((a, b) => b.attempts - a.attempts);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
