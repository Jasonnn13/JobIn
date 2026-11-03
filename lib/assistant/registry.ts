import { z } from "zod";
import type { AssistantAction, MiniApp } from "./types";
import { jobsMiniApp } from "./miniapps/jobs";
import { coursesMiniApp } from "./miniapps/courses";
import { accountMiniApp } from "./miniapps/account";
import { generalMiniApp } from "./miniapps/general";

// Every feature plugs in here. Adding a mini-app is the only change the assistant needs.
export const MINI_APPS: MiniApp[] = [jobsMiniApp, coursesMiniApp, accountMiniApp, generalMiniApp];

// Tool names must match ^[a-zA-Z0-9_-]+$, so "jobs.search" is exposed as "jobs_search".
export const ACTIONS = new Map<string, AssistantAction>(
  MINI_APPS.flatMap((app) => Object.entries(app.actions).map(([name, action]) => [`${app.id}_${name}`, action] as const))
);

export type Intent = { action: string; params: Record<string, unknown> };

export function toolDefinitions() {
  return [...ACTIONS].map(([name, action]) => {
    const parameters = z.toJSONSchema(action.params) as Record<string, unknown>;
    delete parameters.$schema;
    return { type: "function" as const, function: { name, description: action.description, parameters } };
  });
}

/** Returns the params if they fit the action's schema, otherwise null. */
export function validateParams(actionName: string, raw: unknown): Record<string, unknown> | null {
  const action = ACTIONS.get(actionName);
  if (!action) return null;
  const parsed = action.params.safeParse(raw ?? {});
  return parsed.success ? (parsed.data as Record<string, unknown>) : null;
}

const normalize = (s: string) => ` ${s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;

/** Offline fallback: the action whose longest keyword appears in the text. */
export function matchLocally(text: string): Intent | null {
  const t = normalize(text);
  let best: { name: string; action: AssistantAction; score: number } | null = null;
  for (const [name, action] of ACTIONS) {
    for (const keyword of action.keywords) {
      const k = normalize(keyword);
      if (t.includes(k) && (!best || k.length > best.score)) best = { name, action, score: k.length };
    }
  }
  if (!best) return null;
  return { action: best.name, params: best.action.localParams?.(t.trim()) ?? {} };
}
