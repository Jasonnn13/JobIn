"use client"

import { useEffect, useState, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { JobCard } from "./JobCard"
import { SectionHeader } from "./SectionHeader"
import { fetchJobs } from "@/lib/jobs"
import type { Job } from "@/lib/types"

export default function Recommendations() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" })

  useEffect(() => {
    fetchJobs()
      .then((data) => setJobs(data))
      .finally(() => setLoading(false))
  }, [])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        title="More jobs"
        description="The latest jobs from every city."
        moreHref="/jobs"
        moreLabel="See all"
        onPrev={scrollPrev}
        onNext={scrollNext}
      />

      {loading ? (
        <div className="flex gap-5" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 flex-1 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-8 text-center text-base text-muted-foreground">
          No jobs yet. Check back later.
        </p>
      ) : (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {jobs.map((job) => (
              <div key={job.id} className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_31.5%]">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
