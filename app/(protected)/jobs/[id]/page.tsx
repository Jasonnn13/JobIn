import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, MapPin, Tag } from "lucide-react";
import Header from "@/components/Header";
import { ApplyButton } from "./ApplyButton";
import { createClient } from "@/lib/supabase/server";
import { toJob } from "@/lib/jobs";
import { JOB_CATEGORIES } from "@/lib/categories";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: row }, { data: application }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, employer_id, employer_name, title, category, location, pay, description, image_path, status, posted_at")
      .eq("id", id)
      .maybeSingle(),
    // Row-level security only returns the signed-in worker's own application.
    supabase.from("applications").select("status").eq("job_id", id).maybeSingle(),
  ]);
  if (!row) notFound();

  const job = toJob(row, supabase);
  const category = JOB_CATEGORIES.find((c) => c.id === job.category)?.label ?? job.category;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          Back to jobs
        </Link>

        <article className="mt-4 grid gap-8 rounded-xl border bg-card p-6 md:grid-cols-2">
          <img src={job.image} alt="" className="aspect-[4/3] w-full rounded-lg bg-muted object-cover" />

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold">{job.title}</h1>
            <p className="text-2xl font-semibold text-primary">{job.pay}</p>
            <ul className="space-y-2 text-base text-muted-foreground">
              <li className="flex items-center gap-2">
                <Building2 className="size-4" aria-hidden />
                {job.employer}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden />
                {job.location}
              </li>
              <li className="flex items-center gap-2">
                <Tag className="size-4" aria-hidden />
                {category}
              </li>
              <li className="flex items-center gap-2">
                <CalendarDays className="size-4" aria-hidden />
                Posted {dateFormat.format(new Date(job.postedDate))}
              </li>
            </ul>
            {job.description && <p className="whitespace-pre-wrap text-base leading-relaxed">{job.description}</p>}

            <ApplyButton jobId={job.id} open={job.status === "open"} initialStatus={application?.status ?? null} />
          </div>
        </article>
      </main>
    </>
  );
}
