'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="relative loading-page flex flex-col items-center justify-center min-h-screen space-y-4">
      <Button
        onClick={handleBack}
        className="absolute top-5 right-5 bg-primary/30 rounded-full text-neutral-600 py-5 font-bold hover:text-background"
      >
        <X className="w-6 h-6" />
        <span className="sr-only">Go back</span>
      </Button>

      <Image
        src="/error-image.png"
        alt="Error"
        width={200}
        height={200}
        priority
      />

      <h3 className="font-semibold text-lg text-neutral-700">
        This page doesn’t exist
      </h3>
    </div>
  )
}
