"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { History, RotateCcw, Trash2, Filter, ArrowUpDown, Search, BookOpen, Eye, ChevronDown, ChevronUp, CheckCircle2, XCircle, MinusCircle, Trophy } from "lucide-react";
import { useHistoryStore, useQuizStore } from "@/store";
import { cn, formatDate, formatRelative, formatDuration, difficultyColor, scoreGrade } from "@/lib/utils";
import type { Difficulty, HistoryEntry } from "@/types";

type SortKey = "date" | "score" | "topic";
type SortDir = "asc" | "desc";

export default function HistoryPage() {
  const router = useRouter();
  const { entries, removeEntry, clearHistory } = useHistoryStore();
  const { retakeQuiz } = useQuizStore();

  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState<Difficulty | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [confirmClear, setConfirmClear] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...entries];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.topic.toLowerCase().includes(q));
    }
    if (filterDiff !== "All") {
      list = list.filter((e) => e.difficulty === filterDiff);
    }
    list.sort((a, b) => {
      let diff = 0;
      if (sortKey === "date") diff = a.completedAt - b.completedAt;
      else if (sortKey === "score") diff = a.percentage - b.percentage;
      else diff = a.topic.localeCompare(b.topic);
      return sortDir === "desc" ? -diff : diff;
    });
    return list;
  }, [entries, search, filterDiff, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function handleRetake(entry: HistoryEntry) {
    retakeQuiz(entry);
    router.push("/quiz");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 opacity-0 animate-slide-up" style={{ animationFillMode: "forwards" }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-acid" />
            <span className="font-mono text-xs text-ghost/40 uppercase tracking-widest">Quiz History</span>
          </div>
          <h1 className="font-display text-6xl text-ghost tracking-wider">
            {entries.length} ATTEMPTS
          </h1>
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => setConfirmClear((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-ghost/30 hover:text-ember transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {confirmClear ? "Are you sure?" : "Clear all"}
          </button>
        )}
      </div>

      {confirmClear && (
        <div className="mb-4 p-3 bg-ember/10 border border-ember/30 rounded-lg flex items-center justify-between animate-slide-up" style={{ animationFillMode: "forwards" }}>
          <p className="text-sm text-ember">This will permanently delete all quiz history.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmClear(false)} className="text-xs text-ghost/40 hover:text-ghost px-2 py-1">Cancel</button>
            <button onClick={() => { clearHistory(); setConfirmClear(false); }} className="text-xs bg-ember/20 text-ember border border-ember/30 px-3 py-1 rounded-lg hover:bg-ember/30 transition-all">Delete</button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 opacity-0 animate-slide-up stagger-1" style={{ animationFillMode: "forwards" }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ghost/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-9 pr-4 py-2.5 bg-ink/60 border border-ghost/10 rounded-xl text-sm text-ghost placeholder:text-ghost/20 focus:outline-none focus:border-acid/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-ghost/30 shrink-0" />
              {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDiff(d)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    filterDiff === d
                      ? d === "All"
                        ? "border-ghost/30 bg-ghost/10 text-ghost"
                        : difficultyColor(d as Difficulty)
                      : "border-ghost/10 text-ghost/30 hover:border-ghost/25"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 mb-2 text-xs font-mono text-ghost/30 uppercase tracking-widest">
            <button className="flex items-center gap-1 hover:text-ghost transition-colors" onClick={() => handleSort("topic")}>
              Topic <ArrowUpDown className="w-3 h-3" />
            </button>
            <span>Diff</span>
            <button className="flex items-center gap-1 hover:text-ghost transition-colors" onClick={() => handleSort("score")}>
              Score <ArrowUpDown className="w-3 h-3" />
            </button>
            <span>Time</span>
            <button className="flex items-center gap-1 hover:text-ghost transition-colors" onClick={() => handleSort("date")}>
              Date <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          {/* Entries */}
          <div className="space-y-2">
            {filtered.map((entry, i) => (
              <div key={entry.id}>
                <HistoryRow
                  entry={entry}
                  index={i}
                  expanded={expandedId === entry.id}
                  onToggleExpand={() => setExpandedId((id) => id === entry.id ? null : entry.id)}
                  onRetake={() => handleRetake(entry)}
                  onRemove={() => removeEntry(entry.id)}
                />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-ghost/20 font-mono text-sm">
              No results match your filters.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HistoryRow({
  entry,
  index,
  expanded,
  onToggleExpand,
  onRetake,
  onRemove,
}: {
  entry: HistoryEntry;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onRetake: () => void;
  onRemove: () => void;
}) {
  const grade = scoreGrade(entry.percentage);

  return (
    <div
      className="glass rounded-xl overflow-hidden opacity-0 animate-slide-up"
      style={{ animationFillMode: "forwards", animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
    >
      {/* Main row */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-3 sm:gap-4 items-center">
        <div className="min-w-0">
          <p className="font-medium text-ghost truncate">{entry.topic}</p>
          <p className="text-xs text-ghost/30 sm:hidden mt-0.5">
            {entry.difficulty} · {entry.score}/{entry.totalQuestions} · {formatRelative(entry.completedAt)}
          </p>
        </div>
        <span className={cn("hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-medium border", difficultyColor(entry.difficulty))}>
          {entry.difficulty}
        </span>
        <div className="hidden sm:flex items-center gap-2">
          <span className={cn("font-display text-2xl", grade.color)}>{entry.percentage}%</span>
          <span className="text-ghost/30 text-xs font-mono">{entry.score}/{entry.totalQuestions}</span>
        </div>
        <span className="hidden sm:block font-mono text-xs text-ghost/40">{formatDuration(entry.timeTakenSeconds)}</span>
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-ghost/40">{formatDate(entry.completedAt)}</span>
          <span className="text-xs text-ghost/20">{formatRelative(entry.completedAt)}</span>
        </div>

        {/* Mobile score */}
        <div className="flex sm:hidden items-center justify-between">
          <span className={cn("font-display text-xl", grade.color)}>{entry.percentage}%</span>
          <div className="flex gap-2">
            <button onClick={onToggleExpand} className="flex items-center gap-1 text-xs text-plasma-light border border-plasma/30 px-2.5 py-1 rounded-lg hover:bg-plasma/10 transition-all">
              <Eye className="w-3 h-3" /> Review
            </button>
            <button onClick={onRetake} className="flex items-center gap-1 text-xs text-acid border border-acid/30 px-2.5 py-1 rounded-lg hover:bg-acid/10 transition-all">
              <RotateCcw className="w-3 h-3" /> Retake
            </button>
            <button onClick={onRemove} className="p-1.5 text-ghost/20 hover:text-ember transition-colors rounded-lg">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop actions */}
      <div className="hidden sm:flex items-center justify-end gap-1 px-4 pb-3 -mt-1">
        <button onClick={onToggleExpand} className="flex items-center gap-1.5 text-xs text-plasma-light hover:bg-plasma/10 border border-transparent hover:border-plasma/20 px-2.5 py-1 rounded-lg transition-all">
          <Eye className="w-3 h-3" />
          {expanded ? "Hide review" : "Review answers"}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <button onClick={onRetake} className="flex items-center gap-1 text-xs text-ghost/30 hover:text-acid border border-transparent hover:border-acid/20 px-2.5 py-1 rounded-lg transition-all">
          <RotateCcw className="w-3 h-3" /> Retake
        </button>
        <button onClick={onRemove} className="p-1 text-ghost/20 hover:text-ember transition-colors rounded-lg">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded review */}
      {expanded && (
        <div className="border-t border-ghost/5 p-4 space-y-3">
          <p className="font-mono text-xs text-ghost/30 uppercase tracking-widest mb-3">Question Breakdown</p>
          {entry.questions.map((q, i) => {
            const chosen = entry.answers[q.id] ?? null;
            const isCorrect = chosen === q.correctOptionId;
            const skipped = chosen === null;
            const StatusIcon = skipped ? MinusCircle : isCorrect ? CheckCircle2 : XCircle;
            const statusColor = skipped ? "text-ghost/30" : isCorrect ? "text-acid" : "text-ember";

            return (
              <div key={q.id} className={cn("rounded-xl border p-4", isCorrect ? "border-acid/15" : skipped ? "border-ghost/5" : "border-ember/20")}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="font-mono text-xs text-ghost/30 mt-0.5 shrink-0">{i + 1}</span>
                  <StatusIcon className={cn("w-4 h-4 shrink-0 mt-0.5", statusColor)} />
                  <p className="text-sm text-ghost/80 leading-snug">{q.question}</p>
                </div>
                <div className="space-y-1.5 ml-7">
                  {q.options.map((opt) => {
                    const isChosen = opt.id === chosen;
                    const isCorrectOpt = opt.id === q.correctOptionId;
                    return (
                      <div
                        key={opt.id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                          isCorrectOpt ? "bg-acid/10 border border-acid/30 text-ghost" :
                          isChosen && !isCorrect ? "bg-ember/10 border border-ember/30 text-ghost/70" :
                          "bg-ghost/3 border border-transparent text-ghost/40"
                        )}
                      >
                        <span className={cn("w-5 h-5 rounded flex items-center justify-center font-mono text-xs shrink-0", isCorrectOpt ? "bg-acid text-ink" : "bg-ghost/5 text-ghost/30")}>
                          {opt.id}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {isCorrectOpt && <CheckCircle2 className="w-3.5 h-3.5 text-acid shrink-0" />}
                        {isChosen && !isCorrect && <XCircle className="w-3.5 h-3.5 text-ember shrink-0" />}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 ml-7 p-2.5 bg-plasma/5 border border-plasma/15 rounded-lg flex gap-2">
                  <Trophy className="w-3.5 h-3.5 text-plasma-light shrink-0 mt-0.5" />
                  <p className="text-xs text-ghost/60 leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards" }}>
      <BookOpen className="w-12 h-12 text-ghost/10 mx-auto mb-4" />
      <h2 className="font-display text-4xl text-ghost/20 tracking-wider mb-2">NO HISTORY YET</h2>
      <p className="text-ghost/30 text-sm mb-6">Complete your first quiz to see results here.</p>
      <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-acid text-ink rounded-xl font-medium hover:bg-acid-dim transition-all">
        Start a Quiz
      </a>
    </div>
  );
}