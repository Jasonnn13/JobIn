// Shown instantly while the employer loads, shaped like the page so nothing jumps.
export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6" aria-busy="true" aria-label="Loading employer">
      <div className="skeleton h-5 w-24" />
      <div className="skeleton h-64" />
      <div className="skeleton h-20" />
      <div className="skeleton h-56" />
    </main>
  )
}
