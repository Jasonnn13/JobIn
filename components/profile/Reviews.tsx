import { Star } from "lucide-react"
import type { ReviewRow } from "@/lib/supabase/database.types"
import { timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"

export function Stars({ value, className }: { value: number; className?: string }) {
  const rounded = Math.round(value)
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("size-4", n <= rounded ? "fill-signal text-signal" : "text-input")} aria-hidden />
      ))}
    </span>
  )
}

type Review = Pick<ReviewRow, "id" | "reviewer_name" | "job_title" | "rating" | "comment" | "created_at">

// Average, star breakdown, and the reviews themselves.
export function ReviewsSection({ reviews, emptyText }: { reviews: Review[]; emptyText: string }) {
  const count = reviews.length
  const avg = count ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0

  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold">Reviews</h2>

      {count === 0 ? (
        <p className="mt-2 text-base text-muted-foreground">{emptyText}</p>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <p className="text-4xl font-semibold tabular-nums">{avg.toFixed(1)}</p>
              <Stars value={avg} className="mt-1" />
              <p className="mt-1 text-sm text-muted-foreground">
                {count} {count === 1 ? "review" : "reviews"}
              </p>
            </div>
            {/* Star breakdown: one bar per rating, count labelled beside it. */}
            <ul className="flex-1 space-y-1.5" aria-label="Ratings breakdown">
              {[5, 4, 3, 2, 1].map((stars) => {
                const n = reviews.filter((r) => r.rating === stars).length
                return (
                  <li key={stars} className="flex items-center gap-3 text-sm">
                    <span className="w-12 text-muted-foreground">{stars} star</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                      <span className="block h-full rounded-full bg-signal" style={{ width: `${(n / count) * 100}%` }} />
                    </span>
                    <span className="w-6 text-right tabular-nums text-muted-foreground">{n}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <ul className="mt-6 divide-y border-t">
            {reviews.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-base font-semibold">{r.reviewer_name || "JobIn user"}</span>
                  <Stars value={r.rating} />
                  <span className="text-sm text-muted-foreground">{timeAgo(r.created_at)}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">For: {r.job_title}</p>
                {r.comment && <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">{r.comment}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
