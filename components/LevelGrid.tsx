"use client"

import { cn } from "@/lib/utils"
import { Sprout, Settings, Rocket } from "lucide-react"

export type Level = {
  id: string
  label: string
  icon: React.ElementType
}

const defaultLevels: Level[] = [
  { id: "Beginner", label: "Beginner", icon: Sprout },
  { id: "Intermediate", label: "Intermediate", icon: Settings },
  { id: "Advanced", label: "Advanced", icon: Rocket },
]

type Props = {
  value?: string | null
  onChange?: (level: string | null) => void
  levels?: Level[]
}

export function LevelGrid({ value, onChange, levels = defaultLevels }: Props) {
  return (
    <fieldset className="mt-8">
      <legend className="text-base font-semibold">Level</legend>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
        {levels.map((lvl) => {
          const active = value === lvl.id
          const Icon = lvl.icon
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onChange?.(active ? null : lvl.id)}
              aria-pressed={active}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-lg border bg-card px-2 transition-colors hover:border-primary/40",
                active && "border-primary bg-accent text-accent-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="text-sm font-medium sm:text-base">{lvl.label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
