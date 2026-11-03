"use client"

import { useState } from "react"
import { monthLabels, type MonthPoint } from "@/lib/stats"

type Props = {
  title: string
  description: string
  data: MonthPoint[]
  /** Formats a value for the tooltip and table, e.g. n => `${n} hires`. */
  format: (value: number) => string
}

// Single-series monthly column chart. One color (no legend needed; the title names it),
// bars capped at 24px with a rounded top on a shared baseline, hairline gridlines,
// a hover/focus tooltip per column, and a table for screen readers.
export function BarChart({ title, description, data, format }: Props) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.value))
  // Round the top gridline up to a whole number so ticks read cleanly.
  const top = max <= 4 ? max : Math.ceil(max / 2) * 2
  const ticks = top <= 1 ? [0, top] : [0, top / 2, top]
  const allZero = data.every((d) => d.value === 0)

  return (
    <figure className="rounded-lg border bg-card p-4">
      <figcaption>
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </figcaption>

      <div className="relative mt-4 h-36">
        {/* Gridlines and their labels, behind the bars. */}
        {ticks.map((t) => (
          <div key={t} aria-hidden className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${(t / top) * 100}%` }}>
            <span className="w-5 -translate-y-1/2 text-right text-xs tabular-nums text-muted-foreground">{Number.isInteger(t) ? t : ""}</span>
            <span className="h-px flex-1 -translate-y-1/2 bg-border" />
          </div>
        ))}

        <div className="absolute inset-y-0 left-7 right-0 flex">
          {data.map((d, i) => (
            <div
              key={d.month}
              tabIndex={0}
              role="img"
              aria-label={`${monthLabels(d.month).long}: ${format(d.value)}`}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="relative flex flex-1 cursor-default items-end justify-center outline-none focus-visible:bg-accent/40"
            >
              {d.value > 0 && (
                <div
                  className="w-[min(24px,55%)] rounded-t bg-primary transition-[height,opacity] duration-500 ease-out"
                  style={{ height: `${(d.value / top) * 100}%`, opacity: active === null || active === i ? 1 : 0.55 }}
                />
              )}
              {active === i && (
                <div className="pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs shadow-md">
                  <p className="font-semibold">{monthLabels(d.month).long}</p>
                  <p className="text-muted-foreground">{format(d.value)}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {allZero && (
          <p aria-hidden className="pointer-events-none absolute inset-x-7 top-1/3 text-center text-sm text-muted-foreground">No activity in the last six months</p>
        )}
      </div>

      <div className="ml-7 mt-1 flex" aria-hidden>
        {data.map((d) => (
          <span key={d.month} className="flex-1 text-center text-xs text-muted-foreground">
            {monthLabels(d.month).short}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}>
              <td>{monthLabels(d.month).long}</td>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
