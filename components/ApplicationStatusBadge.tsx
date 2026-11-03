import { Badge } from "@/components/ui/badge"
import { STATUS_LABEL, type ApplicationStatus } from "@/lib/applications"

const VARIANT = { pending: "secondary", accepted: "success", rejected: "outline" } as const

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant={VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
