import { z } from "zod";
import { defineAction, type MiniApp } from "../types";

const home = defineAction({
  description: "Open the home page with nearby jobs and suggested courses.",
  params: z.object({}),
  keywords: ["home", "home page", "main page", "dashboard", "beranda"],
  announce: () => "Opening home",
  run: (_, ctx) => ctx.navigate("/home"),
});

const about = defineAction({
  description: "Open the About us page with JobIn's mission and support contact details.",
  params: z.object({}),
  keywords: ["about", "about us", "contact", "support", "tentang kami", "kontak"],
  announce: () => "Opening about us",
  run: (_, ctx) => ctx.navigate("/about"),
});

const back = defineAction({
  description: "Go back to the previous page.",
  params: z.object({}),
  keywords: ["back", "go back", "previous page", "kembali"],
  announce: () => "Going back",
  run: (_, ctx) => ctx.back(),
});

const readPage = defineAction({
  description: "Read a short spoken summary of the page the user is on. Use when they ask what is on the screen.",
  params: z.object({}),
  keywords: ["read this page", "read the page", "summarize", "what's on this page", "bacakan halaman", "ringkas halaman"],
  announce: () => "Reading this page",
  run: (_, ctx) => ctx.readPage(),
});

export const generalMiniApp: MiniApp = {
  id: "general",
  name: "General",
  actions: { home, about, back, readPage },
};
