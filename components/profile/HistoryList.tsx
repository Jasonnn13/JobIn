import { BadgeCheck, Briefcase } from "lucide-react"
import type { WorkHistoryRow } from "@/lib/supabase/database.types"
import { formatDate } from "@/lib/format"

export type VerifiedHire = { application_id: string; job_title: string; employer_name: string; hired_at: string }
type Entry = Pick<WorkHistoryRow, "id" | "role" | "employer" | "start_year" | "end_year" | "description">

// Work history: hires made through JobIn (verified) first, then jobs the worker added.
export function HistoryList({ hires, entries, emptyText }: { hires: VerifiedHire[]; entries: Entry[]; emptyText: string }) {
  if (hires.length === 0 && entries.length === 0) {
    return <p className="text-base text-muted-foreground">{emptyText}</p>
  }
  return (
    <ul className="divide-y">
      {hires.map((h) => (
        <li key={h.application_id} className="flex gap-3 py-3 first:pt-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <BadgeCheck className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-base font-semibold">{h.job_title}</p>
            <p className="text-sm">{h.employer_name}</p>
            <p className="text-sm text-muted-foreground">Hired through JobIn on {formatDate(h.hired_at)}</p>
          </div>
        </li>
      ))}
      {entries.map((e) => (
        <li key={e.id} className="flex gap-3 py-3 first:pt-0">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Briefcase className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-base font-semibold">{e.role}</p>
            {e.employer && <p className="text-sm">{e.employer}</p>}
            <p className="text-sm text-muted-foreground">
              {e.start_year} to {e.end_year ?? "present"}
            </p>
            {e.description && <p className="mt-1 whitespace-pre-wrap text-base">{e.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  )
}
