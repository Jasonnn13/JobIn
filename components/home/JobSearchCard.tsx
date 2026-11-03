"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { JOB_CATEGORIES } from "@/lib/categories"

// Top of the feed: the one thing most people come to do.
export function JobSearchCard() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  return (
    <section className="rounded-lg border bg-card p-4">
      <h1 className="text-xl font-semibold">Find your next job</h1>
      <form
        role="search"
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const q = query.trim()
          router.push(q ? `/jobs?search=${encodeURIComponent(q)}` : "/jobs")
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="For example: builder, driver, Bandung"
            aria-label="Search jobs"
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      <ul className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {JOB_CATEGORIES.map((c) => (
          <li key={c.id} className="shrink-0">
            <Link
              href={`/jobs?category=${c.id}`}
              className="inline-flex h-9 items-center rounded-full border border-input px-4 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:border-foreground hover:text-foreground"
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
