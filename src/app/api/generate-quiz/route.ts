import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import type { GenerateQuizPayload, QuizQuestion, GenerateQuizResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateQuizPayload = await req.json();
    const { topic, numQuestions, difficulty } = body;

    if (!topic || !numQuestions || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `You are a professional quiz maker. Generate exactly ${numQuestions} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.

RULES:
- Each question must have exactly 4 options labeled A, B, C, D
- Only one option is correct
- Provide a clear, concise explanation (1-2 sentences) for the correct answer
- Easy: fundamental concepts, simple recall
- Medium: application and understanding  
- Hard: analysis, synthesis, edge cases
- CRITICAL: The correctOptionId MUST be the letter (A, B, C, or D) of the actual correct answer
- CRITICAL: The explanation MUST explain why the option in correctOptionId is correct
- CRITICAL: Double-check every question before responding — correctOptionId must match the explanation

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "A",
      "explanation": "Brief explanation of why A is correct."
    }
  ]
}`;

    const res = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "command-r-08-2024",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json(
          { error: "Rate limit reached. Please wait a moment and try again." },
          { status: 429 }
        );
      }
      const err = await res.json();
      throw new Error(err?.message ?? "Cohere API error");
    }

    const data = await res.json();
    let raw = data.message?.content?.[0]?.text ?? "";

    // Strip markdown code fences if present
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(raw) as {
      questions: Omit<QuizQuestion, "id" | "topic">[];
    };

    const questions: QuizQuestion[] = parsed.questions
  .filter((q) => ["A", "B", "C", "D"].includes(q.correctOptionId))
  .map((q) => ({
    ...q,
    id: uuid(),
    topic,
  }));

if (questions.length === 0) {
  throw new Error("No valid questions generated");
}

return NextResponse.json<GenerateQuizResponse>({ questions });
  } catch (err) {
    console.error("[generate-quiz]", err);
    return NextResponse.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 }
    );
  }
}