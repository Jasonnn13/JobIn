"use client"

import { useEffect, useState, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import CourseCard from "./CourseCard"
import { SectionHeader } from "./SectionHeader"
import { fetchCourses } from "@/lib/courses"
import type { Course } from "@/lib/types"

const CoursesCarousel = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    slidesToScroll: 1,
  })

  useEffect(() => {
    const loadCourses = async () => {
      const data = await fetchCourses()
      setCourses(data)
      setLoading(false)
    }
    loadCourses()
  }, [])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section id="courses" className="border-y bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          title="Build your skills"
          description="Short courses you can take on your phone."
          moreHref="/courses"
          moreLabel="All courses"
          onPrev={scrollPrev}
          onNext={scrollNext}
        />

        {loading ? (
          <div className="flex gap-5" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 flex-1 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5">
              {courses.map((course) => (
                <div key={course.id} className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_31.5%]">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CoursesCarousel
