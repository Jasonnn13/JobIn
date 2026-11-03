import Image from "next/image";
import Link from "next/link";
import { ProfileSummaryCard } from "@/components/home/ProfileSummaryCard";
import { JobSearchCard } from "@/components/home/JobSearchCard";
import { HomeJobs } from "@/components/home/HomeJobs";
import { HomeCourses } from "@/components/home/HomeCourses";
import { MyApplicationsCard } from "@/components/home/MyApplicationsCard";

const FOOTER_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/courses", label: "Courses" },
  { href: "/profile", label: "Profile" },
];

// Three columns on wide screens (you, the feed, your applications); one column on phones.
export default function HomePage() {
  return (
    <main className="mx-auto grid max-w-6xl items-start gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_300px]">
      <aside className="hidden lg:sticky lg:top-[76px] lg:block">
        <ProfileSummaryCard />
      </aside>

      <div className="space-y-4">
        <JobSearchCard />
        <HomeJobs />
        <HomeCourses />
      </div>

      <aside className="space-y-4 lg:col-start-2 xl:sticky xl:top-[76px] xl:col-start-auto">
        <MyApplicationsCard />
        <section className="flex items-center gap-3 rounded-lg border bg-card p-4">
          <Image src="/maskot-AI.png" alt="" width={40} height={40} className="size-10 shrink-0 rounded-full" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Prefer to talk?</span> Press the microphone button and ask Jobi,
            for example “show me driver jobs”.
          </p>
        </section>
        <nav aria-label="More" className="px-2 text-sm text-muted-foreground">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-primary hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2">JobIn © 2025</p>
        </nav>
      </aside>
    </main>
  );
}
