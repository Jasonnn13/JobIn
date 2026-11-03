import type { z } from "zod";

// What an action may do when it runs in the browser. The host (the voice assistant) provides it.
export type AssistantContext = {
  pathname: string;
  navigate: (href: string) => void;
  back: () => void;
  readPage: () => Promise<void>;
};

export type AssistantAction<S extends z.ZodObject = z.ZodObject> = {
  /** Tells the model when to pick this action. */
  description: string;
  params: S;
  /** English and Indonesian phrases for the offline matcher, used when the AI can't be reached. */
  keywords: string[];
  /** Pulls params out of the raw text for the offline matcher, which has no model to do it. */
  localParams?: (text: string) => Partial<z.infer<S>>;
  /** Short sentence spoken before the action runs. */
  announce: (params: z.infer<S>) => string;
  run: (params: z.infer<S>, ctx: AssistantContext) => void | Promise<void>;
};

// A feature area that plugs its actions into the assistant, like a mini-app in a super-app.
export type MiniApp = {
  id: string;
  name: string;
  actions: Record<string, AssistantAction>;
};

// Helper so each action keeps its own param types.
export function defineAction<S extends z.ZodObject>(action: AssistantAction<S>): AssistantAction {
  return action as unknown as AssistantAction;
}
