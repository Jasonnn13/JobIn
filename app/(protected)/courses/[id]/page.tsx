import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { COURSE_COLUMNS, toCourse } from "@/lib/courses"
import { CourseDetailClient } from "./CourseDetailClient"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from("courses").select(COURSE_COLUMNS).eq("id", id).maybeSingle()
  if (!data) notFound()

  return <CourseDetailClient course={toCourse(data)} />
}
