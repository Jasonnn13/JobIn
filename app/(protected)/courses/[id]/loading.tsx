// Shown instantly while the course loads, shaped like the page so nothing jumps.
export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6" aria-busy="true" aria-label="Loading course">
      <div className="skeleton mb-4 h-5 w-28" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="skeleton h-[28rem]" />
        <div className="skeleton h-64" />
      </div>
    </main>
  )
}
