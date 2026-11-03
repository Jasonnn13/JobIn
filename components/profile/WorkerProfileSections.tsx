import Link from "next/link"
import { Pencil } from "lucide-react"
import { BarChart } from "@/components/charts/BarChart"
import { StatGrid } from "@/components/profile/StatGrid"
import { HistoryList, type VerifiedHire } from "@/components/profile/HistoryList"
import { ReviewsSection } from "@/components/profile/Reviews"
import type { ReviewRow, WorkHistoryRow } from "@/lib/supabase/database.types"
import { percent, type WorkerStats } from "@/lib/stats"

export type WorkerProfileData = {
  stats: WorkerStats | null
  hires: VerifiedHire[]
  entries: Pick<WorkHistoryRow, "id" | "role" | "employer" | "start_year" | "end_year" | "description">[]
  reviews: Pick<ReviewRow, "id" | "reviewer_name" | "job_title" | "rating" | "comment" | "created_at">[]
}

// Stats, history, and reviews for a worker. Shared by the worker's own profile (JobIn)
// and the applicant page employers see (JobHire), so both show the same picture.
export function WorkerProfileSections({ data, editable }: { data: WorkerProfileData; editable?: boolean }) {
  const { stats, hires, entries, reviews } = data
  const acceptance = stats ? percent(stats.accepted, stats.accepted + stats.rejected) : null

  return (
    <>
      {stats && (
        <section aria-label="Activity" className="space-y-4">
          <StatGrid
            stats={[
              { label: "Applications sent", value: String(stats.applicationsTotal) },
              { label: "Hired through JobIn", value: String(stats.accepted) },
              { label: "Acceptance rate", value: acceptance === null ? "New" : `${acceptance}%`, hint: "Of decided applications" },
              {
                label: "Rating",
                value: stats.ratingAvg !== null ? `${stats.ratingAvg.toFixed(1)} / 5` : "No ratings",
                hint: stats.ratingCount ? `${stats.ratingCount} ${stats.ratingCount === 1 ? "review" : "reviews"}` : undefined,
              },
            ]}
          />
          <BarChart
            title="Applications"
            description="Jobs applied for in the last six months"
            data={stats.byMonth}
            format={(n) => `${n} ${n === 1 ? "application" : "applications"}`}
          />
        </section>
      )}

      <section className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Work history</h2>
          {editable && (
            <Link href="/edit-profile#history" aria-label="Edit work history" className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <Pencil className="size-4" aria-hidden />
            </Link>
          )}
        </div>
        <div className="mt-3">
          <HistoryList
            hires={hires}
            entries={entries}
            emptyText={editable ? "Add past jobs so employers can see your experience." : "No work history yet."}
          />
        </div>
      </section>

      <ReviewsSection
        reviews={reviews}
        emptyText={editable ? "Employers who hire you through JobIn can leave a review here." : "No reviews yet."}
      />
    </>
  )
}
