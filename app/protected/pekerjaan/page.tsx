import type { Metadata } from "next"
import { JobsBrowser } from "@/components/JobsBrowser"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "Cari Pekerjaan",
  description: "Temukan pekerjaan informal yang cocok untukmu",
}

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-dvh">
        <section className="pt-8 bg-background">
          <div className="w-full">
            <div className="px-10 lg:px-20">
              <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl w-full">
                Cari Pekerjaan
              </h1>
              <p className="mt-2 mb-6 text-muted-foreground md:text-lg w-full">
                Temukan pekerjaan informal yang cocok untukmu
              </p>
            </div>
          </div>
        </section>
        <JobsBrowser />
      </main>
      <Footer />
    </>
  )
}