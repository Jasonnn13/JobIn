"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/CompanyLogo";
import Error from "@/components/Error";
import { useProfile } from "@/hooks/useProfile";
import { MyProfileSections } from "@/components/profile/MyProfileSections";

function Section({ title, empty, children }: { title: string; empty?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href="/edit-profile" aria-label={`Edit ${title.toLowerCase()}`} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Pencil className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-3">
        {empty ? (
          <Link href="/edit-profile" className="text-base font-semibold text-primary hover:underline">
            Add {title.toLowerCase()}
          </Link>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const { profile, loading, logout } = useProfile();
  const router = useRouter();

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6" aria-busy="true">
        <div className="skeleton h-80" />
        <div className="skeleton h-32" />
        <div className="skeleton h-32" />
      </main>
    );
  }
  if (!profile) return <Error />;

  const handleLogout = async () => {
    if (await logout()) {
      router.replace("/login");
      router.refresh();
    } else {
      toast.error("You couldn’t be logged out. Try again.");
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="h-24 bg-accent sm:h-32" aria-hidden />
        <div className="px-6 pb-6">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt="" className="-mt-14 size-28 rounded-full border-4 border-card bg-muted object-cover sm:-mt-16 sm:size-32" />
          ) : (
            <CompanyLogo name={profile.username} rounded="full" className="-mt-14 size-28 border-4 border-card text-3xl sm:-mt-16 sm:size-32" />
          )}
          <h1 className="mt-3 text-2xl font-semibold leading-tight">{profile.username}</h1>
          <p className="mt-1 text-base">{profile.occupation || "Add a work headline so employers know what you do"}</p>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {profile.location || "No city added"}
            </li>
            <li className="flex items-center gap-1.5">
              <Phone className="size-4" aria-hidden />
              {profile.phone || "No phone number added"}
            </li>
            <li className="flex items-center gap-1.5">
              <Mail className="size-4" aria-hidden />
              {profile.email}
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/edit-profile">Edit profile</Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut aria-hidden />
              Log out
            </Button>
          </div>
        </div>
      </section>

      <Section title="About" empty={!profile.description}>
        <p className="whitespace-pre-wrap text-base leading-relaxed">{profile.description}</p>
      </Section>

      <Section title="Experience" empty={!profile.experience}>
        <p className="whitespace-pre-wrap text-base leading-relaxed">{profile.experience}</p>
      </Section>

      <Section title="Skills" empty={profile.skills.length === 0}>
        <ul className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <li key={skill} className="rounded-full border px-3 py-1 text-sm font-medium">
              {skill}
            </li>
          ))}
        </ul>
      </Section>

      <MyProfileSections userId={profile.id} />
    </main>
  );
}
