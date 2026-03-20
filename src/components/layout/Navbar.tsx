"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Zap, History, BarChart3, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Create", icon: Zap },
  { href: "/history", label: "History", icon: History },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <header className="relative z-20 border-b border-ghost/5 bg-ink/80 backdrop-blur-md sticky top-0">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-acid rounded-sm flex items-center justify-center">
            <Zap className="w-4 h-4 text-ink" />
          </div>
          <span
            className="font-display text-2xl text-ghost tracking-widest glitch"
            data-text="QUIZAI"
          >
            QUIZAI
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                pathname === href
                  ? "bg-acid/10 text-acid"
                  : "text-ghost/50 hover:text-ghost hover:bg-ghost/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 border border-acid/30",
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-ghost/60 hover:text-ghost border border-ghost/10 hover:border-ghost/30 rounded-md transition-all">
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden flex border-t border-ghost/5">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-all",
              pathname === href ? "text-acid" : "text-ghost/40"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}
