export type Stat = { label: string; value: string; hint?: string }

// Key figures read together, as one strip rather than separate cards.
export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-lg border bg-card md:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex flex-col-reverse p-4 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}
        >
          <dt className="text-sm text-muted-foreground">
            {s.label}
            {s.hint && <span className="block text-xs">{s.hint}</span>}
          </dt>
          <dd className="mb-0.5 text-2xl font-semibold tabular-nums">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}
