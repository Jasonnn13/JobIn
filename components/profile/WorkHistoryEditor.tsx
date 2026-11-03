"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { myProfileDataKey } from "./MyProfileSections"

const THIS_YEAR = new Date().getFullYear()

async function fetchEntries(): Promise<
  { id: string; role: string; employer: string; start_year: number; end_year: number | null; description: string }[]
> {
  // Row-level security returns only the signed-in worker's own entries here.
  const supabase = createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const { data, error } = await supabase
    .from("work_history")
    .select("id, role, employer, start_year, end_year, description")
    .eq("profile_id", claims?.claims.sub ?? "")
    .order("start_year", { ascending: false })
  if (error) throw error
  return data
}

// Past jobs the worker adds themselves. Saves straight away; JobIn hires appear on the
// profile automatically and don't need adding here.
export function WorkHistoryEditor({ userId }: { userId: string }) {
  const { data: entries = [], mutate } = useSWR("my-work-history", fetchEntries, { revalidateOnFocus: false })
  const { mutate: mutateGlobal } = useSWRConfig()
  const [role, setRole] = useState("")
  const [employer, setEmployer] = useState("")
  const [startYear, setStartYear] = useState("")
  const [endYear, setEndYear] = useState("")
  const [current, setCurrent] = useState(false)
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    await mutate()
    await mutateGlobal(myProfileDataKey(userId))
  }

  const start = Number(startYear)
  const end = current ? null : Number(endYear)
  const valid =
    role.trim().length >= 2 &&
    Number.isInteger(start) && start >= 1950 && start <= THIS_YEAR &&
    (end === null || (Number.isInteger(end) && end >= start && end <= THIS_YEAR))

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) {
      setError("Add a role (at least 2 characters) and years between 1950 and now; the end year can't be before the start.")
      return
    }
    setSaving(true)
    setError("")
    const { error: insertError } = await createClient().from("work_history").insert({
      role: role.trim(),
      employer: employer.trim(),
      start_year: start,
      end_year: end,
      description: description.trim(),
    })
    setSaving(false)
    if (insertError) {
      console.error("Work history insert failed", insertError)
      setError("This job couldn’t be saved. Check the fields and try again.")
      return
    }
    setRole("")
    setEmployer("")
    setStartYear("")
    setEndYear("")
    setCurrent(false)
    setDescription("")
    await refresh()
  }

  const remove = async (id: string) => {
    const { error: deleteError } = await createClient().from("work_history").delete().eq("id", id)
    if (deleteError) {
      console.error("Work history delete failed", deleteError)
      setError("That job couldn’t be removed. Try again.")
      return
    }
    await refresh()
  }

  return (
    <section id="history" className="scroll-mt-24 space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Work history</h2>
        <p className="text-sm text-muted-foreground">Jobs you got through JobIn are added automatically and marked as verified.</p>
      </div>

      {entries.length > 0 && (
        <ul className="divide-y rounded-lg border">
          {entries.map((e) => (
            <li key={e.id} className="flex items-start gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">{e.role}</p>
                <p className="text-sm text-muted-foreground">
                  {[e.employer, `${e.start_year} to ${e.end_year ?? "present"}`].filter(Boolean).join(", ")}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(e.id)} aria-label={`Remove ${e.role}`}>
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="space-y-4 rounded-lg bg-secondary/60 p-4" noValidate>
        <p className="text-base font-semibold">Add a past job</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="wh-role">Role</Label>
            <Input id="wh-role" value={role} maxLength={100} onChange={(e) => setRole(e.target.value)} placeholder="For example: Mason's helper" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wh-employer">Employer (optional)</Label>
            <Input id="wh-employer" value={employer} maxLength={100} onChange={(e) => setEmployer(e.target.value)} placeholder="Company or person" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wh-start">Start year</Label>
            <Input id="wh-start" inputMode="numeric" value={startYear} onChange={(e) => setStartYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2021" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wh-end">End year</Label>
            <Input
              id="wh-end"
              inputMode="numeric"
              value={current ? "" : endYear}
              disabled={current}
              onChange={(e) => setEndYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder={current ? "Present" : "2023"}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} className="size-4" />
              I still work here
            </label>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wh-desc">What you did (optional)</Label>
          <Textarea id="wh-desc" rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" variant="outline" disabled={saving}>
          {saving ? "Saving…" : "Add job"}
        </Button>
      </form>
    </section>
  )
}
