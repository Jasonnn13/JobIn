"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, GraduationCap, Home, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/profile", label: "Profile", icon: User },
];

function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        router.push(q ? `/jobs?search=${encodeURIComponent(q)}` : "/jobs");
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search jobs"
        aria-label="Search jobs"
        className="h-10 w-full rounded-md bg-secondary pl-9 pr-3 text-base outline-none transition-[box-shadow,background-color] duration-150 placeholder:text-muted-foreground focus:bg-card focus:ring-2 focus:ring-ring/30"
      />
    </form>
  );
}

// Lives in the (protected) layout, so it stays still while page content changes below it.
const Header = () => {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6 md:h-[60px]">
          <Link href="/home" className="flex shrink-0 items-center gap-2" aria-label="JobIn home">
            <img src="/logo.png" alt="" className="size-8" />
            <span className="text-lg font-semibold tracking-tight max-md:sr-only">JobIn</span>
          </Link>
          <HeaderSearch className="w-full max-w-xs" />

          <nav aria-label="Main menu" className="ml-auto hidden h-full md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex w-20 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-150",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-5" aria-hidden strokeWidth={active ? 2.25 : 1.75} />
                  {label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-foreground transition-opacity duration-200",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Phones: thumb-reachable tabs at the bottom, like most native apps. */}
      <nav
        aria-label="Main menu"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="size-6" aria-hidden strokeWidth={active ? 2.25 : 1.75} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default Header;
