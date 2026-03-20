"use client";

import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { BarChart3, Flame, Target, TrendingUp, Award, BookOpen } from "lucide-react";
import { useHistoryStore } from "@/store";
import { buildPerformancePoints, buildCategoryPerformance, scoreGrade, cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

const DIFF_ORDER: Difficulty[] = ["Easy", "Medium", "Hard"];

function calcStreak(entries: { completedAt: number }[]): number {
  if (!entries.length) return 0;
  const sorted = [...entries].sort((a, b) => b.completedAt - a.completedAt);
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const daysDiff =
      (sorted[i - 1].completedAt - sorted[i].completedAt) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 1.5) streak++;
    else break;
  }
  return streak;
}

export default function AnalyticsPage() {
  const { entries } = useHistoryStore();

  const perfPoints = useMemo(() => buildPerformancePoints(entries), [entries]);
  const categories = useMemo(() => buildCategoryPerformance(entries), [entries]);

  const avgScore = useMemo(() => {
    if (!entries.length) return 0;
    return Math.round(entries.reduce((s, e) => s + e.percentage, 0) / entries.length);
  }, [entries]);

  const bestScore = useMemo(
    () => (entries.length ? Math.max(...entries.map((e) => e.percentage)) : 0),
    [entries]
  );

  const streak = useMemo(() => calcStreak(entries), [entries]);

  const diffBreakdown = useMemo(() => {
    return DIFF_ORDER.map((d) => {
      const sub = entries.filter((e) => e.difficulty === d);
      return {
        difficulty: d,
        count: sub.length,
        avg: sub.length ? Math.round(sub.reduce((s, e) => s + e.percentage, 0) / sub.length) : 0,
      };
    });
  }, [entries]);

  const radarData = useMemo(
    () => categories.slice(0, 6).map((c) => ({ topic: c.topic.slice(0, 10), score: c.avgScore })),
    [categories]
  );

  if (!entries.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center py-24">
          <BarChart3 className="w-12 h-12 text-ghost/10 mx-auto mb-4" />
          <h2 className="font-display text-4xl text-ghost/20 tracking-wider mb-2">NO DATA YET</h2>
          <p className="text-ghost/30 text-sm mb-6">Complete some quizzes to see your analytics.</p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-acid text-ink rounded-xl font-medium hover:bg-acid-dim transition-all">
            Start a Quiz
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-slide-up" style={{ animationFillMode: "forwards" }}>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-acid" />
          <span className="font-mono text-xs text-ghost/40 uppercase tracking-widest">Performance Analytics</span>
        </div>
        <h1 className="font-display text-6xl text-ghost tracking-wider">YOUR STATS</h1>
      </div>

      {/* Stat cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 opacity-0 animate-slide-up stagger-1"
        style={{ animationFillMode: "forwards" }}
      >
        <StatCard icon={Target} label="Avg Score" value={`${avgScore}%`} color="text-acid" />
        <StatCard icon={Award} label="Best Score" value={`${bestScore}%`} color="text-ice" />
        <StatCard icon={Flame} label="Streak" value={`${streak}x`} color="text-ember" />
        <StatCard icon={BookOpen} label="Total Quizzes" value={String(entries.length)} color="text-plasma-light" />
      </div>

      {/* Score over time */}
      {perfPoints.length > 1 && (
        <div
          className="glass rounded-2xl p-6 opacity-0 animate-slide-up stagger-2"
          style={{ animationFillMode: "forwards" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-acid" />
            <h2 className="font-display text-xl text-ghost tracking-widest">SCORE OVER TIME</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={perfPoints} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid stroke="rgba(245,240,232,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "rgba(245,240,232,0.3)", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "rgba(245,240,232,0.3)", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1A1A2E", border: "1px solid rgba(200,241,53,0.15)", borderRadius: "10px", fontSize: "12px" }}
                labelStyle={{ color: "rgba(245,240,232,0.5)" }}
                itemStyle={{ color: "#C8F135" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#C8F135"
                strokeWidth={2}
                dot={{ fill: "#C8F135", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#C8F135" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category performance + Difficulty breakdown */}
      <div
        className="grid md:grid-cols-2 gap-4 opacity-0 animate-slide-up stagger-3"
        style={{ animationFillMode: "forwards" }}
      >
        {/* Top topics bar chart */}
        {categories.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl text-ghost tracking-widest mb-4">TOP TOPICS</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categories.slice(0, 6)} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(245,240,232,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="topic" type="category" width={80} tick={{ fill: "rgba(245,240,232,0.5)", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1A1A2E", border: "1px solid rgba(123,47,255,0.2)", borderRadius: "10px", fontSize: "12px" }}
                  labelStyle={{ color: "rgba(245,240,232,0.5)" }}
                  itemStyle={{ color: "#9D5FFF" }}
                />
                <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
                  {categories.slice(0, 6).map((_, i) => (
                    <Cell
                      key={i}
                      fill={`rgba(123,47,255,${0.4 + (i / 6) * 0.4})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Difficulty breakdown */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl text-ghost tracking-widest mb-4">BY DIFFICULTY</h2>
          <div className="space-y-4">
            {diffBreakdown.map(({ difficulty, count, avg }) => {
              const colors: Record<Difficulty, string> = {
                Easy: "#C8F135",
                Medium: "#9D5FFF",
                Hard: "#FF4D4D",
              };
              return (
                <div key={difficulty}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-sm text-ghost/60">{difficulty}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-ghost/30">{count} quizzes</span>
                      <span className="font-display text-xl" style={{ color: colors[difficulty] }}>
                        {avg}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-ghost/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${avg}%`, background: colors[difficulty] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Radar chart */}
      {radarData.length >= 3 && (
        <div
          className="glass rounded-2xl p-6 opacity-0 animate-slide-up stagger-4"
          style={{ animationFillMode: "forwards" }}
        >
          <h2 className="font-display text-xl text-ghost tracking-widest mb-4">KNOWLEDGE MAP</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(245,240,232,0.05)" />
              <PolarAngleAxis dataKey="topic" tick={{ fill: "rgba(245,240,232,0.4)", fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#C8F135"
                fill="#C8F135"
                fillOpacity={0.1}
                strokeWidth={1.5}
              />
              <Tooltip
                contentStyle={{ background: "#1A1A2E", border: "1px solid rgba(200,241,53,0.15)", borderRadius: "10px", fontSize: "12px" }}
                itemStyle={{ color: "#C8F135" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", color)} />
        <span className="font-mono text-xs text-ghost/30 uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn("font-display text-4xl tracking-wider", color)}>{value}</p>
    </div>
  );
}
