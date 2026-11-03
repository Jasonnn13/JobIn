'use client'
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Error() {
  return (
    <div className="relative loading-page flex flex-col items-center justify-center min-h-screen space-y-4">

      <Image
        src="/error-image.png"
        alt="Error"
        width={200}
        height={200}
        priority
      />

      <h3 className="font-semibold text-lg text-neutral-700">
        Something went wrong. Reload the page to try again.
      </h3>
    </div>
  )
}
