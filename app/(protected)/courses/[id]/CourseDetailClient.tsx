import Link from "next/link"
import { ArrowLeft, Clock, PlayCircle, Star, TrendingUp } from "lucide-react"
import Header from "@/components/Header"
import type { Course } from "@/lib/types"

export function CourseDetailClient({ course }: { course: Course }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/courses" className="inline-flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          Back to courses
        </Link>

        <article className="mt-4 rounded-xl border bg-card p-6">
          <div className="grid gap-8 md:grid-cols-2">
            <img src={course.image} alt="" className="aspect-[4/3] w-full rounded-lg bg-muted object-cover" />
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold">{course.title}</h1>
              {course.author && <p className="text-base text-muted-foreground">by {course.author}</p>}
              <ul className="flex flex-wrap gap-4 text-base text-muted-foreground">
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
              <p className="whitespace-pre-wrap text-base leading-relaxed">{course.description}</p>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">Lessons</h2>
            {course.lessons.length > 0 ? (
              <ol className="mt-4 space-y-2">
                {course.lessons.map((lesson, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg bg-accent p-3 text-accent-foreground">
                    <PlayCircle className="size-5 shrink-0" aria-hidden />
                    <span className="text-base font-medium">
                      {i + 1}. {lesson.title}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-base text-muted-foreground">No lessons have been added yet.</p>
            )}
          </section>
        </article>
      </main>
    </>
  )
}
