"use client"

import * as React from "react"
import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { SearchInput } from "./SearchInput"
import { LevelGrid } from "./LevelGrid"
import CourseCard from "./CourseCard"
import { fetchCourses } from "@/lib/courses"

type Props = {
  showOnlyList?: boolean
}

// Filters come from the URL (?search=&level=), so links and the voice assistant can set them.
// Keying on the URL resets the filters when it changes while this page is open.
export function CourseBrowser(props: Props) {
  const searchParams = useSearchParams()
  return (
    <CourseBrowserView
      key={searchParams.toString()}
      {...props}
      initialSearch={searchParams.get("search") || ""}
      initialLevel={searchParams.get("level")}
    />
  )
}

function CourseBrowserView({
  showOnlyList = false,
  initialSearch,
  initialLevel,
}: Props & { initialSearch: string; initialLevel: string | null }) {
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
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      {!showOnlyList && (
        <>
          <SearchInput value={keyword} onChange={setKeyword} placeholder="Search courses" label="Search courses" />
          <LevelGrid value={level} onChange={setLevel} />
        </>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
          ))}

        {!isLoading && !error && filteredCourses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>

      {!isLoading && error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-base text-destructive">
          Courses couldn’t be loaded. Check your internet connection, then reload the page.
        </p>
      )}

      {!isLoading && !error && filteredCourses.length === 0 && (
        <p className="rounded-xl border border-dashed bg-card p-8 text-center text-base text-muted-foreground">
          No matching courses. Try another word, or choose a different level.
        </p>
      )}
    </div>
  )
}
