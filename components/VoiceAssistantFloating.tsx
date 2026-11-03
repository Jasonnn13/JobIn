"use client";

import { useEffect, useRef, useState } from "react";
import { createSpeechConfig, recognizeOnce, speak, VAStatus } from "@/lib/voice";
import { resolveUtterance } from "@/lib/assistant/host";
import type { SpeechConfig } from "microsoft-cognitiveservices-speech-sdk";
import { Mic, Square } from "lucide-react";
import { useRouter } from "next/navigation";

// Reads a spoken summary of the current page. Uses no component state; status updates go through setStatusFn.
async function summarizeAndReadCurrentPage(cfg: SpeechConfig, setStatusFn: (s: VAStatus) => void) {
  try {
    const main = document.querySelector("main") || document.body;
    const title = (document.title || "").trim();
    const raw = (main?.textContent || "").replace(/\s+/g, " ").trim();
    if (!raw) {
      setStatusFn("speaking");
      await speak(cfg, "Sorry, this page has no text to summarize.");
      return;
    }

    setStatusFn("thinking");
    // The server writes the instructions; only the page itself is sent (it trims to 4,000 characters).
    const kind = /^\/profile\b/.test(window.location.pathname) ? "profile" : "page";
    const res = await fetch("/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text: raw.slice(0, 4000), kind }),
    });
    if (!res.ok) {
      try {
        console.error("/api/ai/summarize error:", await res.json());
      } catch {}
      setStatusFn("speaking");
      await speak(cfg, "Sorry, I can't reach the assistant to summarize right now.");
      return;
    }
    const json = await res.json();
    const summary: string = json?.text || "";
    if (!summary) {
      // provide audible feedback if response is empty
      setStatusFn("speaking");
      await speak(cfg, "Sorry, I didn't get a summary back.");
      return;
    }

    // Speak the summary in manageable chunks
    const MAX_CHUNK = 800;
    let i = 0;
    while (i < summary.length) {
      let end = Math.min(i + MAX_CHUNK, summary.length);
      if (end < summary.length) {
        const slice = summary.slice(i, end);
        const lastPunct = Math.max(slice.lastIndexOf("."), slice.lastIndexOf("!"), slice.lastIndexOf("?"));
        if (lastPunct > 100) end = i + lastPunct + 1;
      }
      const part = summary.slice(i, end).trim();
      if (part) {
        setStatusFn("speaking");
        await speak(cfg, part);
      }
      i = end;
    }

    setStatusFn("idle");
  } catch {
    setStatusFn("error");
  }
}

export default function VoiceAssistantFloating() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<VAStatus>("idle");
  const loopRef = useRef<boolean>(false);
  const busyRef = useRef<boolean>(false);

  useEffect(() => {
    loopRef.current = enabled;
    if (!enabled) return;
    let cancelled = false;
    (async function runLoop() {
      while (loopRef.current && !cancelled) {
        // Re-fetched each turn so the short-lived speech token stays fresh.
        const cfg = await createSpeechConfig();
        if (!cfg) {
          setStatus("error");
          return;
        }
        try {
          setStatus("listening");
          const text = await recognizeOnce(cfg);
          if (!loopRef.current || cancelled) break;
          if (!text) continue;
          if (busyRef.current) continue;
          busyRef.current = true;

          // The registry decides what the words mean; this component only speaks and runs the result.
          setStatus("thinking");
          const outcome = await resolveUtterance(text, {
            pathname: window.location.pathname,
            navigate: (href) => router.push(href),
            back: () => router.back(),
            readPage: () => summarizeAndReadCurrentPage(cfg, setStatus),
          });
          setStatus("speaking");
          if (outcome.kind === "action") {
            await speak(cfg, outcome.announce);
            await outcome.run();
          } else if (outcome.kind === "reply") {
            await speak(cfg, outcome.text);
          } else {
            await speak(cfg, "Sorry, I didn't understand. Try saying “find driver jobs” or “open my profile”.");
          }
        } catch {
          setStatus("error");
        } finally {
          busyRef.current = false;
          if (loopRef.current) setStatus("idle");
        }
      }
    })();
    return () => {
      cancelled = true;
      loopRef.current = false;
      setStatus("idle");
    };
  }, [enabled, router]);

  const listening = status === "listening";
  const thinking = status === "thinking";
  const speaking = status === "speaking";

  const stopAll = () => {
    loopRef.current = false;
    setEnabled(false);
    setStatus("idle");
  };

  const statusText = !enabled
    ? "Talk to Jobi"
    : status === "error"
      ? "Microphone unavailable"
      : listening
        ? "Listening…"
        : thinking
          ? "Thinking…"
          : speaking
            ? "Speaking…"
            : "Ready. Go ahead and speak";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border bg-card p-1.5 pl-4 shadow-lg">
      <p className="text-sm font-medium" aria-live="polite">
        {statusText}
      </p>
      {enabled && (
        <button
          onClick={stopAll}
          className="inline-flex size-12 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Square className="size-5" aria-hidden />
          <span className="sr-only">Stop Jobi</span>
        </button>
      )}
      <button
        onClick={() => setEnabled((v) => !v)}
        aria-pressed={enabled}
        className={`inline-flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 ${
          listening ? "ring-4 ring-primary/25 motion-safe:animate-pulse" : ""
        }`}
      >
        <Mic className="size-6" aria-hidden />
        <span className="sr-only">{enabled ? "Pause Jobi" : "Turn on Jobi"}</span>
      </button>
    </div>
  );
}
