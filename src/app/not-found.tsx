import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="font-mono text-xs text-ghost/30 uppercase tracking-widest mb-4">Error 404</p>
      <h1 className="font-display text-8xl md:text-9xl text-acid tracking-wider leading-none mb-4">
        LOST?
      </h1>
      <p className="text-ghost/40 mb-8 max-w-sm">
        This page doesn't exist. Maybe the quiz topic was too obscure.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-acid text-ink rounded-xl font-medium hover:bg-acid-dim transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
