import { Suspense } from "react"
import Header from "@/components/Header"
import { CourseBrowser } from "@/components/CoursesBrowser"
import Footer from "@/components/Footer"

export default function CoursesPage() {
  return (
    <>
      <Header />
      <main className="min-h-dvh">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold md:text-4xl">Skills courses</h1>
          <p className="mt-2 max-w-[60ch] text-base text-muted-foreground">
            Short courses that build job skills. You can take them on your phone.
          </p>
        </div>
        <Suspense>
          <CourseBrowser />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
