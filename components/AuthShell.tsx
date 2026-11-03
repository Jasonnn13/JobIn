import Link from "next/link"

// Shared frame for the log-in and sign-up pages: brand at the top, one focused card.
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="Back to home page">
          <img src="/logo.png" alt="" className="size-8" />
          <span className="text-xl font-semibold tracking-tight">JobIn</span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:pt-0">
        <div className="animate-enter w-full max-w-md rounded-lg border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  )
}
