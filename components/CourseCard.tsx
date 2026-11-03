import Link from "next/link"
import { Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Course } from "@/lib/types"

interface CourseCardProps {
  course: Course
}

const CourseCard = ({ course }: CourseCardProps) => {
  if (!course) return null

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      <img
        src={course.image || "/empty-image.jpg"}
        alt=""
        loading="lazy"
        className="aspect-[16/9] w-full bg-muted object-cover"
      />

      <div className="flex flex-1 flex-col p-5">
        {course.level && (
          <Badge variant="secondary" className="mb-3">
            {course.level}
          </Badge>
        )}
        <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">{course.title}</h3>
        <p className="mt-auto flex items-center gap-1.5 pt-4 text-sm text-muted-foreground">
          <Clock className="size-4" aria-hidden />
          {course.duration}
        </p>
      </div>
    </Link>
  )
}

export default CourseCard
