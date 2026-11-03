"use client"

import { cn } from "@/lib/utils"

type Option = { id: string; label: string }

// Single-choice filter as a horizontal row of pills; pressing the active one clears it.
export function FilterPills({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly Option[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  return (
    <div role="group" aria-label={label} className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
      {options.map((o) => {
        const active = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : o.id)}
            className={cn(
              "h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors duration-150",
              active
                ? "border-success bg-success text-white"
                : "border-input bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
