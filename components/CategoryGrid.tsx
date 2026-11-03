"use client"

import { cn } from "@/lib/utils"
import { JOB_CATEGORIES, type JobCategoryId } from "@/lib/categories"
import {
  Scissors,
  Hammer,
  Car,
  BrushCleaning,
  ShoppingCart,
  Wrench,
  CookingPot,
  ClipboardList,
} from "lucide-react"

export type Category = {
  id: string
  label: string
  icon: React.ElementType
}

const ICONS: Record<JobCategoryId, React.ElementType> = {
  tailor: Scissors,
  builder: Hammer,
  driver: Car,
  housekeeping: BrushCleaning,
  vendor: ShoppingCart,
  technician: Wrench,
  cook: CookingPot,
  admin: ClipboardList,
}

const defaultCategories: Category[] = JOB_CATEGORIES.map(({ id, label }) => ({ id, label, icon: ICONS[id] }))

type Props = {
  value?: string | null
  onChange?: (cat: string | null) => void
  categories?: Category[]
}

// Pictogram tiles: the icon carries the meaning for people who read slowly.
export function CategoryGrid({ value, onChange, categories = defaultCategories }: Props) {
  return (
    <fieldset className="mt-8">
      <legend className="text-base font-semibold">Type of work</legend>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8">
        {categories.map((c) => {
          const active = value === c.id
          const Icon = c.icon
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange?.(active ? null : c.id)}
              aria-pressed={active}
              className={cn(
                "flex min-h-22 flex-col items-center justify-center gap-2 rounded-xl border bg-card px-1 py-3 text-center transition-colors hover:border-primary/40",
                active && "border-primary bg-accent text-accent-foreground"
              )}
            >
              <Icon className="size-6" aria-hidden />
              <span className="text-sm font-medium leading-tight">{c.label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
