"use client"

import * as React from "react"
import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FilterPills } from "./FilterPills"
import { JobRow } from "./JobRow"
import { JobDetailPanel } from "./JobDetailPanel"
import { fetchJobs } from "@/lib/jobs"
import { fetchMyApplications, MY_APPLICATIONS_KEY } from "@/lib/applications"
import { JOB_CATEGORIES } from "@/lib/categories"

const WIDE = "(min-width: 1024px)"

// Filters come from the URL (?search=&category=), so links and the voice assistant can set them.
// Keying on just those resets the filters when they change; picking a job (?job=) does not remount.
export function JobsBrowser() {
  const searchParams = useSearchParams()
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category")
  return (
    <JobsBrowserView
      key={`${search}|${category}`}
      initialSearch={search}
      initialCategory={category}
      initialJobId={searchParams.get("job")}
    />
  )
}

function JobsBrowserView({
  initialSearch,
  initialCategory,
  initialJobId,
}: {
  initialSearch: string
  initialCategory: string | null
  initialJobId: string | null
}) {
  const [keyword, setKeyword] = React.useState(initialSearch)
  const [category, setCategory] = React.useState<string | null>(initialCategory)
  const [selectedId, setSelectedId] = React.useState<string | null>(initialJobId)

  const { data: jobs = [], isLoading, error } = useSWR("jobs", fetchJobs, { revalidateOnFocus: false })
  const { data: applications = [] } = useSWR(MY_APPLICATIONS_KEY, fetchMyApplications, { revalidateOnFocus: false })
  const statusFor = (jobId: string) => applications.find((a) => a.jobId === jobId)?.status

  // Every word must appear in the title, location, employer, or category, so "driver Bandung" works.
  const words = keyword.toLowerCase().split(/\s+/).filter(Boolean)
  const filteredJobs = jobs.filter((job) => {
    const label = JOB_CATEGORIES.find((c) => c.id === job.category)?.label ?? ""
    const haystack = `${job.title} ${job.location} ${job.employer} ${label}`.toLowerCase()
    return words.every((w) => haystack.includes(w)) && (!category || job.category === category)
  })

  const selected = filteredJobs.find((j) => j.id === selectedId) ?? filteredJobs[0]

  // On wide screens, open the job beside the list and keep the URL shareable; on phones, follow the link.
  const select = (jobId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia(WIDE).matches) return
    e.preventDefault()
    setSelectedId(jobId)
    const url = new URL(window.location.href)
    url.searchParams.set("job", jobId)
    window.history.replaceState(window.history.state, "", url)
  }

  const clearFilters = () => {
    setKeyword("")
    setCategory(null)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Job title, employer, or city"
            aria-label="Search jobs"
            className="pl-10"
          />
        </div>
        <div className="mt-3">
          <FilterPills label="Type of work" options={JOB_CATEGORIES} value={category} onChange={setCategory} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-label="Job results" className="overflow-hidden rounded-lg border bg-card lg:max-h-[calc(100dvh-8.5rem)] lg:overflow-y-auto">
          <p className="border-b px-4 py-3 text-sm text-muted-foreground" aria-live="polite">
            {isLoading ? "Loading jobs…" : `${filteredJobs.length} ${filteredJobs.length === 1 ? "job" : "jobs"}`}
          </p>

          {isLoading && (
            <ul aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex gap-3 px-4 py-3">
                  <div className="skeleton size-12 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && error && (
            <p role="alert" className="p-6 text-base text-destructive">
              Jobs couldn’t be loaded. Check your internet connection, then reload the page.
            </p>
          )}

          {!isLoading && !error && filteredJobs.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-base font-semibold">No matching jobs</p>
              <p className="mt-1 text-base text-muted-foreground">Try another word, or show every type of work.</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Show all jobs
              </Button>
            </div>
          )}

          <ul className="divide-y">
            {filteredJobs.map((job) => (
              <li key={job.id}>
                <JobRow job={job} status={statusFor(job.id)} selected={job.id === selected?.id} onSelect={select(job.id)} />
              </li>
            ))}
          </ul>
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-[76px] max-h-[calc(100dvh-6rem)] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-4" aria-hidden>
                <div className="skeleton h-72" />
                <div className="skeleton h-40" />
              </div>
            ) : selected ? (
              // Keyed by job, so switching jobs crossfades the pane instead of snapping.
              <div key={selected.id} className="animate-enter">
                <JobDetailPanel job={selected} status={statusFor(selected.id)} />
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
