"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="font-mono text-xs text-ember/60 uppercase tracking-widest mb-4">Unexpected Error</p>
      <h1 className="font-display text-6xl text-ember tracking-wider leading-none mb-4">CRASHED</h1>
      <p className="text-ghost/40 mb-2 max-w-sm text-sm">{error.message}</p>
      <p className="text-ghost/20 mb-8 text-xs font-mono">
        Something went wrong. Try again or start fresh.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-acid text-ink rounded-xl font-medium hover:bg-acid-dim transition-all"
        >
          Try Again
        </button>
        <a href="/" className="px-5 py-2.5 border border-ghost/10 text-ghost/60 rounded-xl hover:border-ghost/30 transition-all">
          Go Home
        </a>
      </div>
    </div>
  );
}
