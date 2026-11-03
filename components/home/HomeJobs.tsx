"use client"

import Link from "next/link"
import useSWR from "swr"
import { JobRow } from "@/components/JobRow"
import { fetchJobs } from "@/lib/jobs"
import { fetchMyApplications, MY_APPLICATIONS_KEY } from "@/lib/applications"
import { useUserLocation } from "@/hooks/useUserLocation"

const SHOWN = 5

// Center feed: jobs in the user's city when known, otherwise the newest jobs.
export function HomeJobs() {
  const { data: jobs = [], isLoading, error } = useSWR("jobs", fetchJobs, { revalidateOnFocus: false })
  const { data: applications = [] } = useSWR(MY_APPLICATIONS_KEY, fetchMyApplications, { revalidateOnFocus: false })
  const { label, status } = useUserLocation()

  const city = status === "resolved" ? label.toLowerCase() : null
  const nearby = city ? jobs.filter((j) => j.location.split(",")[0].trim().toLowerCase() === city) : []
  const showNearby = nearby.length > 0
  const list = (showNearby ? nearby : jobs).slice(0, SHOWN)

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <header className="px-4 pt-4">
        <h2 className="text-lg font-semibold">{showNearby ? `Jobs in ${label}` : "Recommended for you"}</h2>
        <p className="text-sm text-muted-foreground">
          {showNearby ? "Hiring near you right now" : "The newest jobs on JobIn"}
        </p>
      </header>

      {isLoading ? (
        <ul className="mt-2" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex gap-3 px-4 py-3">
              <div className="skeleton size-12 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <p role="alert" className="p-4 text-base text-destructive">
          Jobs couldn’t be loaded. Check your connection and reload the page.
        </p>
      ) : list.length === 0 ? (
        <p className="p-4 text-base text-muted-foreground">No jobs yet. Check back soon.</p>
      ) : (
        <ul className="mt-2 divide-y border-t">
          {list.map((job) => (
            <li key={job.id}>
              <JobRow job={job} status={applications.find((a) => a.jobId === job.id)?.status} />
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/jobs"
        className="block border-t px-4 py-3 text-center text-base font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
      >
        Show all jobs
      </Link>
    </section>
  )
}
