"use client"

import Link from "next/link"
import useSWR from "swr"
import { Clock } from "lucide-react"
import { fetchCourses } from "@/lib/courses"

// Center feed, below jobs: a few courses to build skills.
export function HomeCourses() {
  const { data: courses = [], isLoading } = useSWR("courses", fetchCourses, { revalidateOnFocus: false })

  return (
    <section className="rounded-lg border bg-card">
      <header className="px-4 pt-4">
        <h2 className="text-lg font-semibold">Build your skills</h2>
        <p className="text-sm text-muted-foreground">Short courses you can take on your phone</p>
      </header>
      <ul className="grid gap-3 p-4 sm:grid-cols-3" aria-busy={isLoading}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <li key={i} className="skeleton h-44" />)
          : courses.slice(0, 3).map((course) => (
              <li key={course.id}>
                <Link href={`/courses/${course.id}`} className="group block">
                  <img src={course.image} alt="" className="aspect-video w-full rounded-md bg-muted object-cover" />
                  <p className="mt-2 line-clamp-2 text-base font-semibold leading-snug group-hover:underline">{course.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden />
                    {course.duration}
                  </p>
                </Link>
              </li>
            ))}
      </ul>
      <Link
        href="/courses"
        className="block border-t px-4 py-3 text-center text-base font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
      >
        Show all courses
      </Link>
    </section>
  )
}
