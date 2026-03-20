import { NextRequest, NextResponse } from "next/server";
import type { HintPayload, HintResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: HintPayload = await req.json();
    const { question, topic } = body;

    const prompt = `You are a helpful quiz hint generator. Give a useful hint for the following multiple-choice question WITHOUT revealing the answer directly.

Topic: ${topic}
Question: ${question.question}
Options: ${question.options.map((o) => `${o.id}) ${o.text}`).join(" | ")}

Provide ONE concise hint (1-2 sentences) that helps the user think in the right direction without directly stating the correct answer.`;

    const res = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "command-r-08-2024",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.6,
      }),
    });

    if (!res.ok) throw new Error("Cohere API error");

    const data = await res.json();
    const hint = data.message?.content?.[0]?.text ?? "Think carefully about the key concepts in this topic.";

    return NextResponse.json<HintResponse>({ hint });
  } catch (err) {
    console.error("[hint]", err);
    return NextResponse.json({ error: "Could not generate hint." }, { status: 500 });
  }
}