import Link from "next/link"
import type { Course } from "@/lib/types"

const CourseCard = ({ course }: { course: Course }) => {
  if (!course) return null

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-shadow duration-200 hover:shadow-md"
    >
      <div className="relative">
        <img src={course.image} alt="" loading="lazy" className="aspect-video w-full bg-muted object-cover" />
        <span className="absolute bottom-2 right-2 rounded bg-foreground/80 px-1.5 py-0.5 text-xs font-semibold text-white">
          {course.duration}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm text-muted-foreground">{course.level}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug group-hover:underline">{course.title}</h3>
        {course.author && <p className="mt-auto pt-2 text-sm text-muted-foreground">By {course.author}</p>}
      </div>
    </Link>
  )
}

export default CourseCard
