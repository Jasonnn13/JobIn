import { Suspense } from "react"
import { CourseBrowser } from "@/components/CoursesBrowser"

export default function CoursesPage() {
  return (
    <main>
      <Suspense>
        <CourseBrowser />
      </Suspense>
    </main>
  )
}
