import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

export type ApplicationStatus = Database["public"]["Enums"]["application_status"]

export type MyApplication = {
  id: string
  jobId: string
  status: ApplicationStatus
  appliedAt: string
  title: string
  employer: string
}

/** SWR key shared by every component showing the worker's applications, so one fetch serves all. */
export const MY_APPLICATIONS_KEY = "my-applications"

// Row-level security returns only the signed-in worker's own applications.
export async function fetchMyApplications(): Promise<MyApplication[]> {
  const { data, error } = await createClient()
    .from("applications")
    .select("id, job_id, status, applied_at, jobs(title, employer_name)")
    .order("applied_at", { ascending: false })
  if (error) throw error
  return data.map((a) => ({
    id: a.id,
    jobId: a.job_id,
    status: a.status,
    appliedAt: a.applied_at,
    title: a.jobs?.title ?? "Job",
    employer: a.jobs?.employer_name ?? "",
  }))
}

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "Applied",
  accepted: "Accepted",
  rejected: "Not selected",
}
