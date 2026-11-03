"use client"

import * as React from "react"
import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FilterPills } from "./FilterPills"
import CourseCard from "./CourseCard"
import { fetchCourses } from "@/lib/courses"
import { COURSE_LEVELS } from "@/lib/categories"

const LEVEL_OPTIONS = COURSE_LEVELS.map((l) => ({ id: l, label: l }))

// Filters come from the URL (?search=&level=), so links and the voice assistant can set them.
// Keying on the URL resets the filters when it changes while this page is open.
export function CourseBrowser() {
  const searchParams = useSearchParams()
  return (
    <CourseBrowserView
      key={searchParams.toString()}
      initialSearch={searchParams.get("search") || ""}
      initialLevel={searchParams.get("level")}
    />
  )
}

function CourseBrowserView({ initialSearch, initialLevel }: { initialSearch: string; initialLevel: string | null }) {
  const [keyword, setKeyword] = React.useState(initialSearch)
  const [level, setLevel] = React.useState<string | null>(initialLevel)
  const { data: courses = [], isLoading, error } = useSWR("courses", fetchCourses, { revalidateOnFocus: false })

  const needle = keyword.trim().toLowerCase()
  const filteredCourses = courses.filter((course) => {
    const matchesKeyword =
      !needle || course.title.toLowerCase().includes(needle) || course.description.toLowerCase().includes(needle)
    return matchesKeyword && (!level || course.level === level)
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <section className="rounded-lg border bg-card p-4">
        <h1 className="text-xl font-semibold">Courses</h1>
        <p className="text-sm text-muted-foreground">Short, practical courses that build job skills.</p>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search courses"
            aria-label="Search courses"
            className="pl-10"
          />
        </div>
        <div className="mt-3">
          <FilterPills label="Level" options={LEVEL_OPTIONS} value={level} onChange={setLevel} />
        </div>
      </section>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={isLoading}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <li key={i} className="skeleton h-64" />)
          : !error && filteredCourses.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
      </ul>

      {!isLoading && error && (
        <p role="alert" className="rounded-lg border bg-card p-6 text-base text-destructive">
          Courses couldn’t be loaded. Check your internet connection, then reload the page.
        </p>
      )}

      {!isLoading && !error && filteredCourses.length === 0 && (
        <p className="rounded-lg border bg-card p-8 text-center text-base text-muted-foreground">
          No matching courses. Try another word, or choose a different level.
        </p>
      )}
    </div>
  )
}
