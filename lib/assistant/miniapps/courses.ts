import { z } from "zod";
import { COURSE_LEVELS } from "@/lib/categories";
import { defineAction, type MiniApp } from "../types";

const browse = defineAction({
  description:
    "Open the course list, optionally filtered. Use when the user wants to learn, train, or see courses or classes.",
  params: z.object({
    query: z.string().optional().describe("Free-text search such as a skill or course name. Omit if not mentioned."),
    level: z.enum(COURSE_LEVELS).optional().describe("Course level, if the user names one."),
  }),
  keywords: ["courses", "course", "class", "classes", "training", "learn", "kelas", "pelatihan", "belajar"],
  announce: ({ query, level }) => {
    if (level && query) return `Showing ${level.toLowerCase()} courses for ${query}`;
    if (level) return `Showing ${level.toLowerCase()} courses`;
    if (query) return `Searching courses for ${query}`;
    return "Opening courses";
  },
  run: ({ query, level }, ctx) => {
    const qs = new URLSearchParams();
    if (query) qs.set("search", query);
    if (level) qs.set("level", level);
    ctx.navigate(qs.size ? `/courses?${qs}` : "/courses");
  },
});

export const coursesMiniApp: MiniApp = {
  id: "courses",
  name: "Courses",
  actions: { browse },
};
