import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { JobDetailPanel } from "@/components/JobDetailPanel";
import { createClient } from "@/lib/supabase/server";
import { toJob } from "@/lib/jobs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link href="/jobs" className="mb-4 inline-flex items-center gap-2 text-base font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        All jobs
      </Link>
      <JobDetailPanel job={toJob(row, supabase)} status={application?.status ?? null} headingLevel="h1" />
    </main>
  );
}
