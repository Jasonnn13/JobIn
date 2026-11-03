import Link from "next/link"
import { Building2, MapPin } from "lucide-react"
import type { Job } from "@/lib/types"

type Props = {
  job: Job
}

export function JobCard({ job }: Props) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      <img
        src={job.image || "/empty-image.jpg"}
        alt=""
        loading="lazy"
        className="aspect-[16/9] w-full bg-muted object-cover"
      />

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">{job.title}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="size-4 shrink-0" aria-hidden />
          {job.employer}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden />
          {job.location}
        </p>
        <p className="mt-auto pt-4 text-lg font-semibold text-primary">{job.pay}</p>
      </div>
    </Link>
  )
}
