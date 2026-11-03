import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { JobRow } from "@/components/JobRow";
import { BarChart } from "@/components/charts/BarChart";
import { StatGrid } from "@/components/profile/StatGrid";
import { ReviewsSection } from "@/components/profile/Reviews";
import { createClient } from "@/lib/supabase/server";
import { JOB_COLUMNS, toJob } from "@/lib/jobs";
import { parseEmployerStats, percent } from "@/lib/stats";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const memberSince = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

// What a worker sees about an employer before applying: who they are, how they hire,
// what they have open, and what past workers say.
export default async function EmployerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: profiles }, { data: statsJson }, { data: jobRows }, { data: reviews }] = await Promise.all([
    supabase.rpc("employer_public_profile", { p_employer: id }),
    supabase.rpc("employer_stats", { p_employer: id }),
    supabase.from("jobs").select(JOB_COLUMNS).eq("employer_id", id).eq("status", "open").order("posted_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("id, reviewer_name, job_title, rating, comment, created_at")
      .eq("reviewee_id", id)
      .order("created_at", { ascending: false }),
  ]);
  const employer = profiles?.[0];
  if (!employer) notFound();

  const stats = parseEmployerStats(statsJson);
  const logoUrl = employer.photo_path
    ? (await supabase.storage.from("avatars").createSignedUrl(employer.photo_path, 3600)).data?.signedUrl
    : null;
  const jobs = (jobRows ?? []).map((row) => toJob(row, supabase));
  const responseRate = stats ? percent(stats.decidedTotal, stats.applicationsTotal) : null;

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6">
      <Link href="/jobs" className="inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        All jobs
      </Link>

      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="h-24 bg-accent sm:h-32" aria-hidden />
        <div className="px-6 pb-6">
          <CompanyLogo name={employer.username} src={logoUrl} className="-mt-12 size-24 border-4 border-card text-2xl" />
          <h1 className="mt-3 text-2xl font-semibold leading-tight">{employer.username}</h1>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {employer.location && (
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden />
                {employer.location}
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              On JobIn since {memberSince.format(new Date(employer.member_since))}
            </li>
          </ul>
          {employer.description && <p className="mt-4 max-w-[70ch] whitespace-pre-wrap text-base leading-relaxed">{employer.description}</p>}
        </div>
      </section>

      {stats && (
        <>
          <StatGrid
            stats={[
              { label: "Open jobs", value: String(stats.jobsOpen) },
              { label: "Workers hired", value: String(stats.hiresTotal) },
              {
                label: "Replies to applicants",
                value: responseRate === null ? "New" : `${responseRate}%`,
                hint: stats.avgResponseDays !== null ? `Usually within ${Math.max(1, Math.round(stats.avgResponseDays))} days` : undefined,
              },
              {
                label: "Rating",
                value: stats.ratingAvg !== null ? `${stats.ratingAvg.toFixed(1)} / 5` : "No ratings",
                hint: stats.ratingCount ? `${stats.ratingCount} ${stats.ratingCount === 1 ? "review" : "reviews"}` : undefined,
              },
            ]}
          />
          <BarChart
            title="Workers hired"
            description="Hires through JobIn in the last six months"
            data={stats.byMonth}
            format={(n) => `${n} ${n === 1 ? "worker hired" : "workers hired"}`}
          />
        </>
      )}

      <section className="overflow-hidden rounded-lg border bg-card">
        <h2 className="border-b px-4 py-3 text-lg font-semibold">
          Open jobs <span className="font-normal text-muted-foreground">({jobs.length})</span>
        </h2>
        {jobs.length === 0 ? (
          <p className="p-4 text-base text-muted-foreground">No open jobs right now.</p>
        ) : (
          <ul className="divide-y">
            {jobs.map((job) => (
              <li key={job.id}>
                <JobRow job={job} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ReviewsSection reviews={reviews ?? []} emptyText="No reviews yet. Workers hired through JobIn can review this employer." />
    </main>
  );
}
