import { Suspense } from "react"
import type { Metadata } from "next"
import { JobsBrowser } from "@/components/JobsBrowser"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "Find jobs",
  description: "Find blue-collar work near you",
}

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-dvh">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold md:text-4xl">Find jobs</h1>
          <p className="mt-2 max-w-[60ch] text-base text-muted-foreground">
            Type the name of a job, or choose a type of work below.
          </p>
        </div>
        <Suspense>
          <JobsBrowser />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
