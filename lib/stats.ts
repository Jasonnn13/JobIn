import type { Json } from "@/lib/supabase/database.types"

export type MonthPoint = { month: string; value: number }

export type WorkerStats = {
  applicationsTotal: number
  accepted: number
  rejected: number
  pending: number
  ratingAvg: number | null
  ratingCount: number
  byMonth: MonthPoint[]
}

export type EmployerStats = {
  jobsTotal: number
  jobsOpen: number
  applicationsTotal: number
  hiresTotal: number
  decidedTotal: number
  avgResponseDays: number | null
  ratingAvg: number | null
  ratingCount: number
  byMonth: MonthPoint[]
}

type JsonObject = { [key: string]: Json | undefined }

const isObject = (v: Json | undefined): v is JsonObject => !!v && typeof v === "object" && !Array.isArray(v)
const num = (o: JsonObject, key: string) => (typeof o[key] === "number" ? (o[key] as number) : 0)
const numOrNull = (o: JsonObject, key: string) => (typeof o[key] === "number" ? (o[key] as number) : null)

function months(o: JsonObject): MonthPoint[] {
  const list = o.by_month
  if (!Array.isArray(list)) return []
  return list.flatMap((p) => (isObject(p) && typeof p.month === "string" ? [{ month: p.month, value: num(p, "value") }] : []))
}

/** Parses worker_stats(); null when the caller may not see them. */
export function parseWorkerStats(json: Json | null): WorkerStats | null {
  if (!isObject(json ?? undefined)) return null
  const o = json as JsonObject
  return {
    applicationsTotal: num(o, "applications_total"),
    accepted: num(o, "accepted"),
    rejected: num(o, "rejected"),
    pending: num(o, "pending"),
    ratingAvg: numOrNull(o, "rating_avg"),
    ratingCount: num(o, "rating_count"),
    byMonth: months(o),
  }
}

/** Parses employer_stats(); null when the id isn't an employer. */
export function parseEmployerStats(json: Json | null): EmployerStats | null {
  if (!isObject(json ?? undefined)) return null
  const o = json as JsonObject
  return {
    jobsTotal: num(o, "jobs_total"),
    jobsOpen: num(o, "jobs_open"),
    applicationsTotal: num(o, "applications_total"),
    hiresTotal: num(o, "hires_total"),
    decidedTotal: num(o, "decided_total"),
    avgResponseDays: numOrNull(o, "avg_response_days"),
    ratingAvg: numOrNull(o, "rating_avg"),
    ratingCount: num(o, "rating_count"),
    byMonth: months(o),
  }
}

const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "short" })
const monthYearFormat = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" })

/** "2026-11" -> "Nov" (axis) and "November 2026" (tooltip). */
export function monthLabels(month: string) {
  const [y, m] = month.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, 15))
  return { short: monthFormat.format(date), long: monthYearFormat.format(date) }
}

/** Share of a whole as a whole percentage, or null when there is nothing to divide. */
export function percent(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : null
}
