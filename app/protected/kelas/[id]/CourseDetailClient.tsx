"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, Clock, TrendingUp, PlayCircle } from "lucide-react"
import Header from "@/components/Header"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  course: {
    title: string
    image: string
    description: string
    level: string
    duration: string
    rating?: number
    author?: string
    content?: { id: number; title: string }[]
  }
}

export function CourseDetailClient({ course }: Props) {
  const router = useRouter()

  return (
    <>
    <Header />
    <main className="min-h-screen bg-[#F8FAF6] p-8">
      <div className="relative max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="flex items-center gap-2 absolute top-5 left-5 mb-50  bg-transparent hover:bg-transparent font-semibold hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          
        </Button>

        <div className="flex flex-col md:flex-row gap-8 mt-10">
          {/* Image */}
          <div className="md:w-1/2 w-full">
            <Image
                src={course.image}
                alt={course.title}
                width={500}
                height={300}
                unoptimized
                className="rounded-xl object-cover w-full h-[300px]"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              {course.title}
            </h1>

            <p className="text-muted-foreground">
              oleh: {course.author || "Instruktur Profesional"}
            </p>

            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {course.duration}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> {course.level}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />{" "}
                {course.rating || "4.6"}
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mt-3">
              {course.description}
            </p>
          </div>
        </div>

        {/* Course content */}
        <div className="mt-10 grid md:grid-cols-1 gap-10">
          <div>
            <h2 className="text-lg font-semibold mb-4">Konten Kursus</h2>
            <div className="space-y-3">
              {course.content?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl bg-primary/20 p-3 hover:bg-primary/30 transition-colors"
                >
                  <PlayCircle className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium">
                    {item.id}. {item.title}
                  </p>
                </div>
              ))}
              {!course.content && (
                <p className="text-muted-foreground text-sm">
                  Belum ada konten yang ditambahkan.
                </p>
              )}
            </div>
          </div>

          
        </div>
      </div>
    </main>
    </>
  )
}
