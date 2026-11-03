"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SUGGESTIONS = [
  "Construction", "Bricklaying", "Painting", "Plastering", "Repairs", "Electrical", "Plumbing", "AC servicing",
  "Driving", "Motorbike delivery", "Sewing", "Tailoring", "Cooking", "Catering", "Housework", "Laundry",
  "Cleaning", "Gardening", "Childcare", "Customer service", "Cash handling",
]

const MAX_SKILLS = 20 // matches the database constraint
const MAX_LENGTH = 40

// Free-form skills as removable chips, with one-tap suggestions.
export function SkillsInput({ value, onChange }: { value: string[]; onChange: (skills: string[]) => void }) {
  const [draft, setDraft] = useState("")
  const full = value.length >= MAX_SKILLS
  const has = (s: string) => value.some((v) => v.toLowerCase() === s.toLowerCase())

  const add = (raw: string) => {
    const skill = raw.trim().replace(/\s+/g, " ").slice(0, MAX_LENGTH)
    if (!skill || has(skill) || full) return
    onChange([...value, skill])
    setDraft("")
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Skills</legend>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <li key={skill} className="animate-enter flex items-center gap-1 rounded-full border bg-card py-1 pl-3 pr-1 text-sm font-medium">
              {skill}
              <button
                type="button"
                onClick={() => onChange(value.filter((s) => s !== skill))}
                aria-label={`Remove ${skill}`}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault() // add the skill instead of submitting the whole form
              add(draft)
            }
          }}
          placeholder={full ? "You can add up to 20 skills" : "Type a skill, then press Enter"}
          aria-label="Add a skill"
          disabled={full}
        />
        <Button type="button" variant="outline" onClick={() => add(draft)} disabled={full || !draft.trim()}>
          Add
        </Button>
      </div>

      {!full && (
        <div>
          <p className="text-sm text-muted-foreground">Suggestions</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {SUGGESTIONS.filter((s) => !has(s))
              .slice(0, 10)
              .map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => add(s)}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-input px-3 text-sm text-muted-foreground transition-colors duration-150 hover:border-foreground hover:text-foreground"
                  >
                    <Plus className="size-3.5" aria-hidden />
                    {s}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </fieldset>
  )
}
