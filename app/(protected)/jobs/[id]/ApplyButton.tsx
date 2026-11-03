"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Status = "pending" | "accepted" | "rejected";

const STATUS_TEXT: Record<Status, { label: string; className: string }> = {
  pending: { label: "Waiting for the employer", className: "text-amber-700" },
  accepted: { label: "Accepted", className: "text-success" },
  rejected: { label: "Not selected", className: "text-destructive" },
};

export function ApplyButton({ jobId, open, initialStatus }: { jobId: string; open: boolean; initialStatus: Status | null }) {
  const [status, setStatus] = useState<Status | null>(initialStatus);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const apply = async () => {
    setSending(true);
    setError("");
    // Only job_id is sent: the database sets the applicant and a "pending" status itself.
    const { error: insertError } = await createClient().from("applications").insert({ job_id: jobId });
    setSending(false);
    if (!insertError || insertError.code === "23505") {
      setStatus("pending"); // 23505: already applied earlier
      return;
    }
    console.error("Application failed", insertError);
    setError(
      insertError.code === "42501"
        ? "This job is no longer accepting applications."
        : "Your application couldn’t be sent. Check your connection and try again."
    );
  };

  if (status) {
    return (
      <p className="text-base" aria-live="polite">
        Application status: <span className={`font-semibold ${STATUS_TEXT[status].className}`}>{STATUS_TEXT[status].label}</span>
      </p>
    );
  }

  if (!open) {
    return (
      <Button disabled variant="secondary" size="lg">
        No longer accepting applications
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button size="lg" onClick={apply} disabled={sending}>
        {sending ? "Sending…" : "Apply now"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
