import type { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Database, JobRow } from "@/lib/supabase/database.types"
import type { Job } from "@/lib/types"

const JOB_COLUMNS = "id, employer_id, employer_name, title, category, location, pay, description, image_path, status, posted_at"

export function toJob(row: JobRow, supabase: SupabaseClient<Database>): Job {
  return {
    id: row.id,
    title: row.title,
    location: row.location || "Unknown",
    pay: row.pay || "Pay not listed",
    category: row.category,
    employer: row.employer_name || "Unknown",
    description: row.description,
    // Public bucket: building the URL needs no network request.
    image: row.image_path
      ? supabase.storage.from("job-images").getPublicUrl(row.image_path).data.publicUrl
      : "/empty-image.jpg",
    status: row.status,
    uid: row.employer_id,
    postedDate: row.posted_at,
  }
}

/** Newest open jobs. Row-level security already hides anything the user may not see. */
export async function fetchJobs(): Promise<Job[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_COLUMNS)
    .eq("status", "open")
    .order("posted_at", { ascending: false })
    .limit(200)
  if (error) throw error
  return data.map((row) => toJob(row, supabase))
}

export async function fetchJobById(id: string): Promise<Job | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("jobs").select(JOB_COLUMNS).eq("id", id).maybeSingle()
  if (error) throw error
  return data ? toJob(data, supabase) : null
}
