// In-page placeholder while client data loads; the header and tab bar stay visible around it.
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-40" />
      <div className="skeleton h-24" />
      <div className="skeleton h-24" />
    </div>
  )
}
