"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, Edit, LogOut, Mail, MapPin, Phone, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import Error from "@/components/Error";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage() {
  const { profile, loading, logout } = useProfile();
  const router = useRouter();

  if (loading) return <Loading />;
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10 sm:px-6">
        <section className="flex flex-col items-start gap-6 rounded-xl border bg-card p-6 sm:flex-row sm:items-center">
          <img
            src={profile.photoUrl || "/empty-profile.png"}
            alt=""
            className="size-24 shrink-0 rounded-full bg-muted object-cover"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-semibold">{profile.username}</h1>
            <p className="mt-1 text-lg text-primary">{profile.occupation || "No occupation added yet"}</p>
            <ul className="mt-3 space-y-1 text-base text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden />
                {profile.location || "No location added"}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" aria-hidden />
                {profile.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4" aria-hidden />
                {profile.phone || "No phone number added"}
              </li>
            </ul>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <Button asChild>
              <Link href="/edit-profile">
                <Edit aria-hidden />
                Edit profile
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut aria-hidden />
              Log out
            </Button>
          </div>
        </section>

        {profile.experience && (
          <section className="rounded-xl border bg-card p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Briefcase className="size-5" aria-hidden />
              Experience
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-base text-muted-foreground">{profile.experience}</p>
          </section>
        )}

        {profile.skills.length > 0 && (
          <section className="rounded-xl border bg-card p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Wrench className="size-5" aria-hidden />
              Skills
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <li key={skill}>
                  <Badge variant="secondary">{skill}</Badge>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
