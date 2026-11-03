import type { Metadata } from "next"
import { Suspense } from "react"
import { JobsBrowser } from "@/components/JobsBrowser"

export const metadata: Metadata = {
  title: "Jobs",
  description: "Find blue-collar work near you",
}

export default function JobsPage() {
  return (
    <main>
      <h1 className="sr-only">Jobs</h1>
      <Suspense>
        <JobsBrowser />
      </Suspense>
    </main>
  )
}
