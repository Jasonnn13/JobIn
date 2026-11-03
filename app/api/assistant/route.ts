import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { guardApiRequest } from "@/lib/api-guard";
import { ACTIONS, toolDefinitions, validateParams } from "@/lib/assistant/registry";

const SYSTEM_PROMPT = `You are Jobi, the voice assistant in JobIn, an app where blue-collar workers in Indonesia, such as builders, drivers, technicians, and cooks, find jobs and take short skills courses.
Users may be blind or new to smartphones, and may speak English or Indonesian.
If the user wants to go somewhere or see something in the app, call exactly one tool with only the parameters they actually mentioned.
Otherwise, answer in one or two short, plain English sentences. Never invent jobs, courses, or pages.`;

// Turns what the user said into one registered action, or a short spoken reply.
export async function POST(req: Request) {
  const guard = await guardApiRequest(req, {
    role: "worker",
    rateLimit: { bucket: "assistant", limit: 60, windowSeconds: 3600 },
  });
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 500) : "";
  // Goes into the system prompt, so only a plain path is accepted.
  const rawPath = typeof body?.pathname === "string" ? body.pathname : "";
  const pathname = /^\/[a-z0-9/_-]{0,100}$/i.test(rawPath) ? rawPath : "/";
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY missing in environment");
    return NextResponse.json({ error: "Assistant is not configured" }, { status: 500 });
  }

  try {
    const client = new Groq({ apiKey });
    const response = await client.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\nThe user is currently on the page ${pathname}.` },
        { role: "user", content: text },
      ],
      tools: toolDefinitions(),
      tool_choice: "auto",
      temperature: 0,
      max_tokens: 600,
    });

    const message = response.choices[0]?.message;
    const call = message?.tool_calls?.[0];
    if (call && ACTIONS.has(call.function.name)) {
      let raw: unknown = {};
      try {
        raw = JSON.parse(call.function.arguments || "{}");
      } catch {}
      const params = validateParams(call.function.name, raw);
      if (params) return NextResponse.json({ action: call.function.name, params });
    }

    return NextResponse.json({ reply: message?.content?.trim() || "Sorry, I didn't catch that. Please try again." });
  } catch (error) {
    console.error("Assistant intent resolution failed", error);
    return NextResponse.json({ error: "Assistant is unavailable" }, { status: 502 });
  }
}
