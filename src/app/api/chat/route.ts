import { NextRequest, NextResponse } from "next/server";
import type { ChatPayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: ChatPayload = await req.json();
    const { messages, quizContext } = body;

    const systemPrompt = `You are QuizAI Assistant — a helpful, enthusiastic, and knowledgeable learning companion embedded in a quiz application.

Your role:
- Help users understand quiz topics deeply
- Answer follow-up questions about concepts
- Explain why answers are right or wrong
- Encourage learners and celebrate their progress
- Keep responses concise and engaging (2-4 sentences unless more detail is requested)

${quizContext ? `Current quiz context:
- Topic: ${quizContext.topic}
- Difficulty: ${quizContext.difficulty}
${quizContext.currentQuestion ? `- Current question: "${quizContext.currentQuestion}"` : ""}` : ""}

Tone: Smart, warm, and direct.`;

    const cohereMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const res = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "command-r-plus",
        messages: [
          { role: "system", content: systemPrompt },
          ...cohereMessages,
        ],
        max_tokens: 512,
        temperature: 0.75,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json({ error: "Rate limit reached." }, { status: 429 });
      }
      throw new Error("Cohere API error");
    }

    const data = await res.json();
    const reply = data.message?.content?.[0]?.text ?? "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json({ error: "Failed to get response." }, { status: 500 });
  }
}