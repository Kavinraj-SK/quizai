"use client";

import { useRef, useEffect, useState } from "react";
import { MessageSquare, X, Send, Loader2, Bot, Sparkles } from "lucide-react";
import { useChatStore, useQuizStore } from "@/store";
import { cn } from "@/lib/utils";

export function ChatAssistant() {
  const { messages, isOpen, isLoading, addMessage, setLoading, toggleChat } = useChatStore();
  const { session } = useQuizStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    addMessage({ role: "user", content: text });
    setLoading(true);

    try {
      const currentQuestion = session?.questions[session.currentIndex];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
          quizContext: session
            ? {
                topic: session.config.topic,
                difficulty: session.config.difficulty,
                currentQuestion: currentQuestion?.question,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      addMessage({ role: "assistant", content: data.reply ?? "Sorry, I couldn't respond." });
    } catch {
      addMessage({ role: "assistant", content: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all",
          isOpen
            ? "bg-ghost/10 border border-ghost/20 text-ghost rotate-0"
            : "bg-acid text-ink hover:bg-acid-dim acid-glow animate-pulse-acid"
        )}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </button>

      {/* Chat drawer */}
      <div
        className={cn(
          "fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 glass rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden",
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto h-[480px]" : "opacity-0 translate-y-4 pointer-events-none h-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-ghost/5 flex-shrink-0">
          <div className="w-8 h-8 bg-plasma/20 border border-plasma/30 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-plasma-light" />
          </div>
          <div>
            <p className="text-sm font-medium text-ghost">AI Learning Assistant</p>
            <p className="text-xs text-ghost/30">
              {session ? `Helping with: ${session.config.topic}` : "Ask me anything"}
            </p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-acid animate-pulse" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <MessageSquare className="w-8 h-8 text-ghost/10" />
              <p className="text-ghost/30 text-sm">
                Ask me about the quiz topic, get explanations, or request help with concepts.
              </p>
              {session && (
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {[
                    `Explain ${session.config.topic} basics`,
                    "Help me understand this question",
                    "What should I focus on?",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-xs px-2.5 py-1 rounded-full border border-ghost/10 text-ghost/40 hover:border-acid/30 hover:text-acid transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-plasma/20 border border-plasma/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-plasma-light" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-acid/15 border border-acid/20 text-ghost rounded-tr-sm"
                    : "bg-ghost/5 border border-ghost/5 text-ghost/80 rounded-tl-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-plasma/20 border border-plasma/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-plasma-light" />
              </div>
              <div className="bg-ghost/5 border border-ghost/5 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-ghost/30 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-ghost/30 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-ghost/30 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-ghost/5 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 bg-ink/60 border border-ghost/10 rounded-xl px-3 py-2 text-sm text-ghost placeholder:text-ghost/20 focus:outline-none focus:border-acid/30 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                input.trim() && !isLoading
                  ? "bg-acid text-ink hover:bg-acid-dim"
                  : "bg-ghost/5 text-ghost/20 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
