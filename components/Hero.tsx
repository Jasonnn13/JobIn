"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserLocation } from "@/hooks/useUserLocation";

const QUICK_PICKS = ["Builder", "Driver", "Tailor", "Cook"];

const Hero = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { label, status } = useUserLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    router.push(query ? `/jobs?search=${encodeURIComponent(query)}` : "/jobs");
  };

  return (
    <section className="border-b bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground">
          <MapPin className="size-4" aria-hidden />
          {label}
        </p>
        <h1 className="mt-4 max-w-[20ch] text-4xl font-semibold leading-tight md:text-5xl">
          {status === "resolved" ? `Find work in ${label}` : "Find work near you"}
        </h1>

        <form onSubmit={handleSearch} role="search" className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
          <label htmlFor="hero-search" className="sr-only">
            Search jobs
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              id="hero-search"
              type="search"
              placeholder="For example: builder, driver, AC technician"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 text-base"
            />
          </div>
          <Button type="submit" size="lg">
            Search jobs
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Popular searches:</span>
          {QUICK_PICKS.map((pick) => (
            <Link
              key={pick}
              href={`/jobs?search=${encodeURIComponent(pick)}`}
              className="rounded-full border px-3 py-1 text-sm font-medium hover:border-primary hover:text-primary"
            >
              {pick}
            </Link>
          ))}
        </div>

        <div className="mt-10 flex max-w-3xl items-center gap-4 rounded-xl bg-accent p-4">
          <Image src="/maskot-AI.png" alt="" width={48} height={48} className="size-12 shrink-0 rounded-full" />
          <p className="text-base text-accent-foreground">
            <span className="font-semibold">Need help?</span> Press the microphone button at the bottom right and
            talk to Jobi. For example, say “show me driver jobs” or “I want to learn sewing”.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
