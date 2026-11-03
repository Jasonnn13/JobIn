"use client"

import useSWR from "swr"
import { ReviewForm } from "@/components/profile/ReviewForm"
import { fetchMyApplications, MY_APPLICATIONS_KEY } from "@/lib/applications"
import { fetchMyReviewedApplicationIds, MY_REVIEWED_KEY } from "@/lib/reviews"

// Once a worker is hired for this job, invite them to review the employer (once).
export function EmployerReviewPrompt({ jobId, employerName }: { jobId: string; employerName: string }) {
  const { data: applications } = useSWR(MY_APPLICATIONS_KEY, fetchMyApplications, { revalidateOnFocus: false })
  const { data: reviewed, mutate } = useSWR(MY_REVIEWED_KEY, fetchMyReviewedApplicationIds, { revalidateOnFocus: false })

  const hire = applications?.find((a) => a.jobId === jobId && a.status === "accepted")
  if (!hire || !reviewed || reviewed.includes(hire.id)) return null

  return (
    <section id="review" className="animate-enter rounded-lg border bg-card p-6">
      <ReviewForm applicationId={hire.id} revieweeName={employerName} onDone={() => mutate()} />
    </section>
  )
}
