import Link from "next/link";
import { Briefcase, ChevronRight, HardHat, X } from "lucide-react";

// Set per environment, since JobHire's address depends on where it is deployed.
const JOBHIRE_URL = process.env.NEXT_PUBLIC_JOBHIRE_URL || "http://localhost:3001/";

const ROLES = [
  {
    href: "/signup",
    external: false,
    icon: HardHat,
    title: "I'm looking for work",
    body: "See jobs near you, apply from your phone, and take skills courses.",
  },
  {
    href: JOBHIRE_URL,
    external: true,
    icon: Briefcase,
    title: "I'm hiring workers",
    body: "Post jobs and choose applicants with JobHire. Opens in a new tab.",
  },
];

const Onboarding = () => {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-16 sm:px-6">
      <Link
        href="/"
        aria-label="Back to home page"
        className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground sm:right-6 sm:top-6"
      >
        <X className="size-5" aria-hidden />
      </Link>

      <h1 className="text-3xl font-semibold md:text-4xl">Sign up for JobIn</h1>
      <p className="mt-2 text-base text-muted-foreground">Choose the option that fits you best.</p>

      <ul className="mt-8 grid gap-3">
        {ROLES.map(({ href, external, icon: Icon, title, body }) => {
          const content = (
            <>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block text-lg font-semibold">{title}</span>
                <span className="mt-1 block text-base text-muted-foreground">{body}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
            </>
          );
          const className =
            "group flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50 hover:shadow-sm";
          return (
            <li key={title}>
              {external ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                  {content}
                </a>
              ) : (
                <Link href={href} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
};

export default Onboarding;
