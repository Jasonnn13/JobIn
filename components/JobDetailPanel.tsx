import Link from "next/link"
import { Building2, CalendarDays, MapPin, Tag, Wallet } from "lucide-react"
import { CompanyLogo } from "@/components/CompanyLogo"
import { ApplyButton } from "@/components/ApplyButton"
import { EmployerReviewPrompt } from "@/components/EmployerReviewPrompt"
import { Button } from "@/components/ui/button"
import type { ApplicationStatus } from "@/lib/applications"
import { JOB_CATEGORIES } from "@/lib/categories"
import { timeAgo } from "@/lib/format"
import type { Job } from "@/lib/types"

// Full job view: used beside the list on wide screens and as the /jobs/[id] page.
export function JobDetailPanel({
  job,
  status,
  headingLevel = "h2",
}: {
  job: Job
  status?: ApplicationStatus | null
  headingLevel?: "h1" | "h2"
}) {
  const Heading = headingLevel
  const category = JOB_CATEGORIES.find((c) => c.id === job.category)?.label ?? job.category

  return (
    <article className="space-y-4">
      <section className="rounded-lg border bg-card p-6">
        <CompanyLogo name={job.employer} src={job.image} className="size-14" />
        <p className="mt-3 text-base font-medium">{job.employer}</p>
        <Heading className="mt-1 text-2xl font-semibold leading-tight">{job.title}</Heading>
        <ul className="mt-3 space-y-1.5 text-base text-muted-foreground">
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {job.location}
          </li>
          <li className="flex items-center gap-2">
            <Wallet className="size-4 shrink-0" aria-hidden />
            <span className="font-semibold text-foreground">{job.pay}</span>
          </li>
          <li className="flex items-center gap-2">
            <Tag className="size-4 shrink-0" aria-hidden />
            {category}
          </li>
          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            Posted {timeAgo(job.postedDate)}
          </li>
        </ul>
        <div className="mt-5">
          <ApplyButton jobId={job.id} open={job.status === "open"} initialStatus={status ?? null} />
        </div>
      </section>

      <EmployerReviewPrompt jobId={job.id} employerName={job.employer} />

      <section className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold">About the job</h3>
        <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">
          {job.description || "The employer hasn’t added a description yet."}
        </p>
      </section>

      <section className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold">About the employer</h3>
        <Link href={`/employers/${job.uid}`} className="group mt-3 flex items-center gap-3">
          <CompanyLogo name={job.employer} className="size-10 text-xs" />
          <span className="flex items-center gap-2 text-base font-medium group-hover:underline">
            <Building2 className="size-4 text-muted-foreground" aria-hidden />
            {job.employer}
          </span>
        </Link>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/employers/${job.uid}`}>View employer profile</Link>
        </Button>
      </section>
    </article>
  )
}
