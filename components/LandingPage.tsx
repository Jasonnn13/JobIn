import Link from "next/link";
import { BadgeCheck, MapPin, Mic, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/CompanyLogo";
import { JOB_CATEGORIES } from "@/lib/categories";

const POINTS = [
  { icon: BadgeCheck, title: "Free for workers", body: "Sign up, apply, and take courses at no cost." },
  { icon: Mic, title: "Works by voice", body: "Ask Jobi to open a page or read it aloud." },
  { icon: Wifi, title: "Light on weak connections", body: "Pages keep working when the signal drops in and out." },
];

// Illustrative only: shows visitors what the job list looks like once they sign in.
const PREVIEW_JOBS = [
  { title: "Construction helper", employer: "Maju Jaya Konstruksi", place: "Jakarta Selatan", pay: "Rp 180,000/day" },
  { title: "Catering cook", employer: "Rumah Sari Services", place: "Bandung", pay: "Rp 160,000/day" },
  { title: "Pickup truck driver", employer: "Maju Jaya Konstruksi", place: "Jakarta Selatan", pay: "Rp 4,800,000/month" },
];

const LandingPage = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-card">
      <header>
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="size-8" />
            <span className="text-xl font-semibold tracking-tight">JobIn</span>
          </span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="max-sm:hidden">
              <Link href="/role">Join now</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
          <div className="animate-enter">
            <h1 className="text-4xl font-semibold leading-[1.12] md:text-5xl">
              Find work near you, and the skills to get it.
            </h1>
            <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-muted-foreground">
              JobIn connects blue-collar workers with jobs nearby, from construction and driving to repairs and
              cooking, and offers short courses to build new skills.
            </p>
            <div className="mt-8 flex max-w-sm flex-col gap-3">
              <Button asChild size="lg">
                <Link href="/role">Sign up free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>

          <figure className="animate-enter rounded-lg border bg-card shadow-sm [animation-delay:80ms]" aria-label="Preview of the JobIn job list">
            <figcaption className="border-b px-4 py-3">
              <p className="text-base font-semibold">Jobs near you</p>
              <p className="text-sm text-muted-foreground">Hiring right now</p>
            </figcaption>
            <ul className="divide-y">
              {PREVIEW_JOBS.map((job) => (
                <li key={job.title} className="flex gap-3 px-4 py-3">
                  <CompanyLogo name={job.employer} />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-primary">{job.title}</p>
                    <p className="truncate text-sm">{job.employer}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden />
                      {job.place}
                    </p>
                    <p className="mt-1 text-sm font-medium">{job.pay}</p>
                  </div>
                </li>
              ))}
            </ul>
          </figure>
        </section>

        <section className="bg-background">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold">Explore jobs by type</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {JOB_CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/jobs?category=${c.id}`}
                    className="inline-flex h-10 items-center rounded-full border border-input bg-card px-5 text-base font-semibold text-muted-foreground transition-colors duration-150 hover:border-foreground hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="mt-12 grid gap-8 md:grid-cols-3">
              {POINTS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="mt-1 text-base text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-8">
          JobIn © 2025. Jobs and training for blue-collar workers.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
