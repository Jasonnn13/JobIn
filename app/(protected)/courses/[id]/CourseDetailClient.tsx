import Link from "next/link"
import { ArrowLeft, Clock, PlayCircle, Star, TrendingUp } from "lucide-react"
import type { Course } from "@/lib/types"

// Course page: what you'll learn on the left, the lesson list beside it.
export function CourseDetailClient({ course }: { course: Course }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link href="/courses" className="mb-4 inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        All courses
      </Link>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="overflow-hidden rounded-lg border bg-card">
          <img src={course.image} alt="" className="aspect-video w-full bg-muted object-cover" />
          <div className="p-6">
            <p className="text-sm text-muted-foreground">{course.category}</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight">{course.title}</h1>
            {course.author && <p className="mt-1 text-base text-muted-foreground">By {course.author}</p>}
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {course.duration}
              </li>
              <li className="flex items-center gap-1.5">
                <TrendingUp className="size-4" aria-hidden />
                {course.level}
              </li>
              {course.rating !== null && (
                <li className="flex items-center gap-1.5">
                  <Star className="size-4 text-signal-strong" aria-hidden />
                  {course.rating} out of 5
                </li>
              )}
            </ul>
            <h2 className="mt-6 text-lg font-semibold">About this course</h2>
            <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">{course.description}</p>
          </div>
        </article>

        <section className="rounded-lg border bg-card lg:sticky lg:top-[76px]">
          <h2 className="border-b px-4 py-3 text-base font-semibold">
            Contents{course.lessons.length > 0 && <span className="font-normal text-muted-foreground"> ({course.lessons.length} lessons)</span>}
          </h2>
          {course.lessons.length > 0 ? (
            <ol className="divide-y">
              {course.lessons.map((lesson, i) => (
                <li key={i} className="flex items-start gap-3 px-4 py-3">
                  <PlayCircle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <span className="text-base">
                    <span className="text-muted-foreground">{i + 1}.</span> {lesson.title}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="p-4 text-base text-muted-foreground">No lessons have been added yet.</p>
          )}
        </section>
      </div>
    </main>
  )
}
