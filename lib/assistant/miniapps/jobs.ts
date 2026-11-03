import { z } from "zod";
import { JOB_CATEGORIES, JOB_CATEGORY_IDS } from "@/lib/categories";
import { defineAction, type MiniApp } from "../types";

const search = defineAction({
  description:
    "Open the job list, optionally filtered. Use when the user wants to find, see, or browse jobs or work, for example 'driver jobs' or 'work in Bandung'.",
  params: z.object({
    query: z.string().optional().describe("Free-text search such as a job title or city. Omit if not mentioned."),
    category: z.enum(JOB_CATEGORY_IDS).optional().describe("Type of work, if the user names one."),
  }),
  keywords: [
    "jobs", "job", "work", "find work", "pekerjaan", "lowongan", "kerja", "cari kerja",
    ...JOB_CATEGORIES.flatMap((c) => c.synonyms),
  ],
  localParams: (text) => {
    const t = ` ${text.toLowerCase()} `;
    const category = JOB_CATEGORIES.find((c) => c.synonyms.some((s) => t.includes(` ${s} `)))?.id;
    return category ? { category } : {};
  },
  announce: ({ query, category }) => {
    const label = JOB_CATEGORIES.find((c) => c.id === category)?.label.toLowerCase();
    if (label && query) return `Showing ${label} jobs for ${query}`;
    if (label) return `Showing ${label} jobs`;
    if (query) return `Searching jobs for ${query}`;
    return "Opening jobs";
  },
  run: ({ query, category }, ctx) => {
    const qs = new URLSearchParams();
    if (query) qs.set("search", query);
    if (category) qs.set("category", category);
    ctx.navigate(qs.size ? `/jobs?${qs}` : "/jobs");
  },
});

export const jobsMiniApp: MiniApp = {
  id: "jobs",
  name: "Jobs",
  actions: { search },
};
