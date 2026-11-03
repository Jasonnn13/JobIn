import Link from "next/link";
import { BadgeCheck, Mic, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

const POINTS = [
  { icon: BadgeCheck, title: "Free for workers", body: "Sign up, apply, and take courses at no cost." },
  { icon: Mic, title: "Works by voice", body: "Ask Jobi to open a page or read it aloud." },
  { icon: Wifi, title: "Light on weak connections", body: "Pages keep working when the signal drops in and out." },
];

const LandingPage = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-card">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="size-7" />
            <span className="text-xl font-semibold tracking-tight">JobIn</span>
          </span>
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-[1.1] md:text-5xl lg:text-6xl">
              Daily work and skills training, in one app.
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
              JobIn connects blue-collar workers with jobs nearby, from construction and driving to repairs and
              cooking, and offers short courses to build new skills.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/role">Sign up free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t bg-background">
          <ul className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-base font-semibold tracking-normal">{title}</h2>
                  <p className="mt-1 text-base text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
