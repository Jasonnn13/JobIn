"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"
import { CompanyLogo } from "@/components/CompanyLogo"
import { useProfile } from "@/hooks/useProfile"

// Left rail: who you are, and how complete your profile looks to employers.
export function ProfileSummaryCard() {
  const { profile, loading } = useProfile()

  if (loading || !profile) {
    return <div className="skeleton h-64" aria-busy={loading} />
  }

  const checks = [
    profile.photo_path,
    profile.occupation,
    profile.location,
    profile.phone,
    profile.experience,
    profile.description,
    profile.skills.length > 0,
  ]
  const strength = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="h-14 bg-accent" aria-hidden />
      <div className="px-4 pb-4">
        {profile.photoUrl ? (
          <img src={profile.photoUrl} alt="" className="-mt-8 size-16 rounded-full border-4 border-card bg-muted object-cover" />
        ) : (
          <CompanyLogo name={profile.username} rounded="full" className="-mt-8 size-16 border-4 border-card text-base" />
        )}
        <Link href="/profile" className="mt-2 block text-lg font-semibold leading-tight hover:underline">
          {profile.username}
        </Link>
        <p className="mt-0.5 text-sm text-muted-foreground">{profile.occupation || "Add a work headline"}</p>
        {profile.location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden />
            {profile.location}
          </p>
        )}
      </div>
      <div className="border-t px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Profile strength</span>
          <span className="text-muted-foreground">{strength}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={100} aria-label="Profile strength">
          <div className="h-full rounded-full bg-success transition-[width] duration-500" style={{ width: `${strength}%` }} />
        </div>
        {strength < 100 && (
          <Link href="/edit-profile" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
            Complete your profile
          </Link>
        )}
      </div>
    </section>
  )
}
