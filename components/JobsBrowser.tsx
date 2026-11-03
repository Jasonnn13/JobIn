"use client"

import * as React from "react"
import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { SearchInput } from "./SearchInput"
import { CategoryGrid } from "./CategoryGrid"
import { JobCard } from "./JobCard"
import { Button } from "@/components/ui/button"
import { fetchJobs } from "@/lib/jobs"
import { JOB_CATEGORIES } from "@/lib/categories"
import type { Job } from "@/lib/types"

type Props = {
  showOnlyList?: boolean
}

// Filters come from the URL (?search=&category=), so links and the voice assistant can set them.
// Keying on the URL resets the filters when it changes while this page is open.
export function JobsBrowser(props: Props) {
  const searchParams = useSearchParams()
  return (
    <JobsBrowserView
      key={searchParams.toString()}
      {...props}
      initialSearch={searchParams.get("search") || ""}
      initialCategory={searchParams.get("category")}
    />
  )
}

function JobsBrowserView({
  showOnlyList = false,
  initialSearch,
  initialCategory,
}: Props & { initialSearch: string; initialCategory: string | null }) {
  const [keyword, setKeyword] = React.useState(initialSearch)
  const [category, setCategory] = React.useState<string | null>(initialCategory)

  const { data, isLoading, error } = useSWR("jobs", fetchJobs, {
    revalidateOnFocus: false,
  })

  const jobs = (data || []) as Job[]

  // Every word must appear in the title, location, employer, or category, so "driver Bandung" works.
  const words = keyword.toLowerCase().split(/\s+/).filter(Boolean)
  const filteredJobs = jobs.filter((job) => {
    const label = JOB_CATEGORIES.find((c) => c.id === job.category)?.label ?? ""
    const haystack = `${job.title} ${job.location} ${job.employer} ${label}`.toLowerCase()
    const matchesKeyword = words.every((w) => haystack.includes(w))
    const matchesCategory = !category || job.category === category
    return matchesKeyword && matchesCategory
  })

  const clearFilters = () => {
    setKeyword("")
    setCategory(null)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      {!showOnlyList && (
        <>
          <SearchInput value={keyword} onChange={setKeyword} />
          <CategoryGrid value={category} onChange={setCategory} />
        </>
      )}

      {!isLoading && !error && (
        <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
          {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
        </p>
      )}

      <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
          ))}

        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {!isLoading && error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-base text-destructive">
          Jobs couldn’t be loaded. Check your internet connection, then reload the page.
        </p>
      )}

      {!isLoading && !error && filteredJobs.length === 0 && (
        <div className="rounded-xl border border-dashed bg-card p-8 text-center">
          <p className="text-base font-semibold">No matching jobs</p>
          <p className="mt-1 text-base text-muted-foreground">Try another word, or show every type of work.</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Show all jobs
          </Button>
        </div>
      )}
    </div>
  )
}
