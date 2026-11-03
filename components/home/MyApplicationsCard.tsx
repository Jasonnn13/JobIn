"use client"

import Link from "next/link"
import useSWR from "swr"
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge"
import { fetchMyApplications, MY_APPLICATIONS_KEY } from "@/lib/applications"
import { timeAgo } from "@/lib/format"

// Right rail: where each application stands, newest first.
export function MyApplicationsCard() {
  const { data: applications = [], isLoading } = useSWR(MY_APPLICATIONS_KEY, fetchMyApplications, { revalidateOnFocus: false })

  return (
    <section className="rounded-lg border bg-card p-4">
      <h2 className="text-base font-semibold">Your applications</h2>
      {isLoading ? (
        <div className="mt-3 space-y-3" aria-busy="true">
          <div className="skeleton h-10" />
          <div className="skeleton h-10" />
        </div>
      ) : applications.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          You haven’t applied yet.{" "}
          <Link href="/jobs" className="font-semibold text-primary hover:underline">
            Find a job
          </Link>
        </p>
      ) : (
        <ul className="mt-2 divide-y">
          {applications.slice(0, 5).map((a) => (
            <li key={a.id} className="py-2.5">
              <Link href={`/jobs/${a.jobId}`} className="block text-sm font-semibold leading-snug hover:underline">
                {a.title}
              </Link>
              <p className="text-sm text-muted-foreground">{a.employer}</p>
              <div className="mt-1 flex items-center gap-2">
                <ApplicationStatusBadge status={a.status} />
                <span className="text-xs text-muted-foreground">{timeAgo(a.appliedAt)}</span>
              </div>
              {a.status === "accepted" && (
                <Link href={`/jobs/${a.jobId}#review`} className="mt-1 inline-block text-sm font-semibold text-primary hover:underline">
                  Review employer
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
