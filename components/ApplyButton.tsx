"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { fetchMyApplications, MY_APPLICATIONS_KEY, STATUS_LABEL, type ApplicationStatus } from "@/lib/applications";

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  pending: "text-foreground",
  accepted: "text-success",
  rejected: "text-muted-foreground",
};

export function ApplyButton({ jobId, open, initialStatus = null }: { jobId: string; open: boolean; initialStatus?: ApplicationStatus | null }) {
  // Shared with the home page and job list, so applying updates them all at once.
  const { data: applications, mutate } = useSWR(MY_APPLICATIONS_KEY, fetchMyApplications, { revalidateOnFocus: false });
  const status = applications?.find((a) => a.jobId === jobId)?.status ?? initialStatus;
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const apply = async () => {
    setSending(true);
    setError("");
    // Only job_id is sent: the database sets the applicant and a "pending" status itself.
    const { error: insertError } = await createClient().from("applications").insert({ job_id: jobId });
    if (insertError && insertError.code !== "23505") {
      console.error("Application failed", insertError);
      setError(
        insertError.code === "42501"
          ? "This job is no longer accepting applications."
          : "Your application couldn’t be sent. Check your connection and try again."
      );
    } else {
      await mutate(); // 23505 means an earlier application exists; refresh shows it either way.
    }
    setSending(false);
  };

  if (status) {
    return (
      <p className={`flex items-center gap-2 text-base font-semibold ${STATUS_STYLE[status]}`} aria-live="polite">
        <CheckCircle2 className="size-5" aria-hidden />
        {status === "pending" ? "Applied. Waiting for the employer." : STATUS_LABEL[status]}
      </p>
    );
  }

  if (!open) {
    return <p className="text-base font-medium text-muted-foreground">No longer accepting applications</p>;
  }

  return (
    <div className="space-y-2">
      <Button onClick={apply} disabled={sending} className="min-w-32">
        {sending ? "Sending…" : "Apply"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
