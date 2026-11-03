// Shown instantly while the job loads, shaped like the page so nothing jumps.
export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6" aria-busy="true" aria-label="Loading job">
      <div className="skeleton h-5 w-24" />
      <div className="skeleton h-72" />
      <div className="skeleton h-40" />
    </main>
  )
}
