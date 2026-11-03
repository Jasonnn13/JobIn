import { ACTIONS, matchLocally, validateParams, type Intent } from "./registry";
import type { AssistantContext } from "./types";

export type Outcome =
  | { kind: "action"; announce: string; run: () => Promise<void> }
  | { kind: "reply"; text: string }
  | { kind: "unknown" };

type RemoteResult = Intent | { reply: string };

// Asks the server's model first; on any failure (offline, timeout, error) falls back to keyword matching.
async function resolveRemotely(text: string, pathname: string): Promise<RemoteResult | null> {
  try {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, pathname }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as RemoteResult;
  } catch {
    return null;
  }
}

export async function resolveUtterance(text: string, ctx: AssistantContext): Promise<Outcome> {
  const intent = (await resolveRemotely(text, ctx.pathname)) ?? matchLocally(text);
  if (!intent) return { kind: "unknown" };
  if ("reply" in intent) return { kind: "reply", text: intent.reply };

  const action = ACTIONS.get(intent.action);
  const params = validateParams(intent.action, intent.params);
  if (!action || !params) return { kind: "unknown" };

  return {
    kind: "action",
    announce: action.announce(params),
    run: async () => {
      await action.run(params, ctx);
    },
  };
}
