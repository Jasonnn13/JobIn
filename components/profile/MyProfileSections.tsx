"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { parseWorkerStats } from "@/lib/stats"
import { WorkerProfileSections, type WorkerProfileData } from "./WorkerProfileSections"

export const myProfileDataKey = (userId: string) => ["my-profile-data", userId] as const

async function fetchMyProfileData([, userId]: readonly [string, string]): Promise<WorkerProfileData> {
  const supabase = createClient()
  const [stats, hires, entries, reviews] = await Promise.all([
    supabase.rpc("worker_stats", { p_worker: userId }),
    supabase.rpc("worker_job_history", { p_worker: userId }),
    supabase
      .from("work_history")
      .select("id, role, employer, start_year, end_year, description")
      .eq("profile_id", userId)
      .order("start_year", { ascending: false }),
    supabase
      .from("reviews")
      .select("id, reviewer_name, job_title, rating, comment, created_at")
      .eq("reviewee_id", userId)
      .order("created_at", { ascending: false }),
  ])
  const error = stats.error ?? hires.error ?? entries.error ?? reviews.error
  if (error) throw error
  return {
    stats: parseWorkerStats(stats.data),
    hires: hires.data ?? [],
    entries: entries.data ?? [],
    reviews: reviews.data ?? [],
  }
}

// The signed-in worker's stats, history, and reviews, loaded in the browser.
export function MyProfileSections({ userId }: { userId: string }) {
  const { data, error, isLoading } = useSWR(myProfileDataKey(userId), fetchMyProfileData, { revalidateOnFocus: false })

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="skeleton h-20" />
        <div className="skeleton h-56" />
        <div className="skeleton h-40" />
      </div>
    )
  }
  if (error || !data) {
    return (
      <p role="alert" className="rounded-lg border bg-card p-4 text-base text-destructive">
        Your activity couldn’t be loaded. Reload the page to try again.
      </p>
    )
  }
  return <WorkerProfileSections data={data} editable />
}
