// app/layout.tsx
import type { Metadata } from "next"
import { Instrument_Sans } from "next/font/google"
import "./globals.css"
import { SerwistProvider } from "@serwist/turbopack/react"
import { Toaster } from "sonner"

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "JobIn",
  description:
    "JobIn helps blue-collar workers in Indonesia find work nearby, apply, and learn new skills with an AI voice assistant, even on a weak connection.",
  icons: {
    icon: '/icon-web.png',
  },
}


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${instrument.variable} font-sans antialiased`}>
        <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV === "development"}>
          {children}
          <Toaster position="top-center" richColors />
        </SerwistProvider>
      </body>
    </html>
  )
}
      
