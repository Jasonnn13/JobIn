"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { JobCard } from "./JobCard";
import { SectionHeader } from "./SectionHeader";
import { fetchJobs } from "@/lib/jobs";
import type { Job } from "@/lib/types";
import { useUserLocation } from "@/hooks/useUserLocation";

const JobsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, slidesToScroll: 1 });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const { label, status } = useUserLocation();

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await fetchJobs();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  // Only filter by city once the location is actually known.
  const nearbyJobs =
    status === "resolved"
      ? jobs.filter((job) => job.location.split(",")[0].trim().toLowerCase() === label.toLowerCase())
      : jobs;

  return (
    <section id="jobs" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader
        title={status === "resolved" ? `Jobs in ${label}` : "Jobs near you"}
        description="Daily and freelance work that's hiring now."
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
      ) : nearbyJobs.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-8 text-center text-base text-muted-foreground">
          No jobs in your city yet. See all jobs to find work in other cities.
        </p>
      ) : (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {nearbyJobs.map((job) => (
              <div key={job.id} className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_31.5%]">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default JobsCarousel;
