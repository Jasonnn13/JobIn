import Link from "next/link"
import { X } from "lucide-react"

// Shared frame for the log-in and sign-up pages.
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-card px-4 py-16">
      <Link
        href="/"
        aria-label="Back to home page"
        className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground sm:right-6 sm:top-6"
      >
        <X className="size-5" aria-hidden />
      </Link>
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  )
}
