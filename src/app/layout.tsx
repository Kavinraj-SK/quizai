import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ChatAssistant } from "@/components/quiz/ChatAssistant";

export const metadata: Metadata = {
  title: "QuizAI — Test What You Know",
  description: "AI-powered quiz app. Generate smart quizzes on any topic, track your progress, and master concepts with an AI learning assistant.",
  keywords: ["quiz", "AI", "learning", "GPT", "education"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-ink text-ghost font-body antialiased">
          <div className="relative min-h-screen flex flex-col">
            {/* Ambient background */}
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            >
              <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-plasma/10 blur-[120px]" />
              <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-acid/5 blur-[100px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-ink-soft/50 blur-[80px]" />
            </div>

            <Navbar />

            <main className="relative z-10 flex-1">
              {children}
            </main>

            <ChatAssistant />

            {/* Footer */}
            <footer className="relative z-10 border-t border-ghost/5 py-6 mt-12">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="font-display text-xl text-acid tracking-wider">QUIZAI</span>
                <p className="text-ghost/30 text-sm font-body">
                  Powered by GPT-4o · Built with Next.js 14
                </p>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
