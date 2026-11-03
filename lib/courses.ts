import { createClient } from "@/lib/supabase/client"
import type { CourseRow } from "@/lib/supabase/database.types"
import type { Course } from "@/lib/types"

export const COURSE_COLUMNS = "id, title, category, level, duration, image_url, description, author, rating, lessons, created_at"

export function toCourse(row: CourseRow): Course {
  const lessons = Array.isArray(row.lessons)
    ? row.lessons.flatMap((l) =>
        l && typeof l === "object" && !Array.isArray(l) && typeof l.title === "string" ? [{ title: l.title }] : []
      )
    : []
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    duration: row.duration || "Self-paced",
    level: row.level,
    image: row.image_url || "/empty-image.jpg",
    description: row.description,
    author: row.author,
    rating: row.rating,
    lessons,
  }
}

export async function fetchCourses(): Promise<Course[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("courses").select(COURSE_COLUMNS).order("created_at")
  if (error) throw error
  return data.map(toCourse)
}
