import Link from "next/link"
import { CompanyLogo } from "@/components/CompanyLogo"
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge"
import type { ApplicationStatus } from "@/lib/applications"
import { timeAgo } from "@/lib/format"
import type { Job } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  job: Job
  status?: ApplicationStatus
  selected?: boolean
  /** Lets a two-pane list open the job beside it instead of navigating. */
  onSelect?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

// One job in a list: employer mark, title, employer, place, pay, and age.
export function JobRow({ job, status, selected, onSelect }: Props) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "group flex gap-3 border-l-2 px-4 py-3 transition-colors duration-150",
        selected ? "border-l-primary bg-accent/60" : "border-l-transparent hover:bg-secondary/70"
      )}
    >
      <CompanyLogo name={job.employer} src={job.image} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-primary group-hover:underline">{job.title}</p>
        <p className="truncate text-sm">{job.employer}</p>
        <p className="truncate text-sm text-muted-foreground">{job.location}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-medium">{job.pay}</span>
          <span className="text-muted-foreground">{timeAgo(job.postedDate)}</span>
          {status && <ApplicationStatusBadge status={status} />}
        </div>
      </div>
    </Link>
  )
}
