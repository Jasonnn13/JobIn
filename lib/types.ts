export type Job = {
  id: string
  title: string
  location: string
  pay: string
  /** Category id from lib/categories. */
  category: string
  employer: string
  description: string
  image: string
  status: "open" | "closed"
  uid: string
  /** ISO timestamp. */
  postedDate: string
}

export type Course = {
  id: string
  title: string
  category: string
  duration: string
  level: string
  image: string
  description: string
  author: string | null
  rating: number | null
  lessons: { title: string }[]
}
