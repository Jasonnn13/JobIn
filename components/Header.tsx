"use client";

import { MapPin, Briefcase, GraduationCap, User, Info, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/courses", label: "Courses", icon: GraduationCap },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/about", label: "About us", icon: Info },
];

const Header = () => {
  const { label: locationLabel } = useUserLocation();
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/home" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="size-7" />
          <span className="text-xl font-semibold tracking-tight">JobIn</span>
        </Link>

        <nav aria-label="Main menu" className="hidden h-full items-stretch gap-1 md:flex">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 border-b-2 border-transparent px-3 pt-0.5 text-base font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(href) && "border-primary text-primary"
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <p className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium lg:flex" title={locationLabel}>
          <MapPin className="size-4" aria-hidden />
          <span className="max-w-[16ch] truncate">{locationLabel}</span>
        </p>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <SheetHeader>
              <SheetTitle className="text-xl font-semibold">Menu</SheetTitle>
            </SheetHeader>
            <nav aria-label="Main menu" className="grid px-2">
              {NAV.map(({ href, label, icon: Icon }) => (
                <SheetClose asChild key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center gap-3 rounded-md px-3 text-base font-medium",
                      isActive(href) ? "bg-accent text-accent-foreground" : "hover:bg-secondary"
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                    {label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <p className="mt-auto flex items-center gap-1.5 px-5 pb-6 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden />
              {locationLabel}
            </p>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
