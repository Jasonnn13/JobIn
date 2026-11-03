// In-page error state; the header stays usable so people can navigate away.
export default function Error() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center" role="alert">
      <img src="/error-image.png" alt="" className="size-32 object-contain" />
      <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
      <p className="mt-1 text-base text-muted-foreground">Check your connection and reload the page to try again.</p>
    </div>
  )
}
