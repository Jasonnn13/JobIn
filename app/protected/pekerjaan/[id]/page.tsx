"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchJobById } from "@/lib/jobs";
import type { Job } from "@/lib/types";
import Header from "@/components/Header";
import { auth, database } from "@/lib/firebase";
import { ref, set, serverTimestamp, get, onValue } from "firebase/database";
import { ArrowLeft, MapPin } from "lucide-react";  // Import the icons


export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<"pending" | "accepted" | "rejected" | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadJob() {
      const data = await fetchJobById(id);
      setJob(data);
      setLoading(false);
    }
    loadJob();
  }, [id]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser || !id) return;
    const key = `${id}_${currentUser.uid}`;
    const lowRef = ref(database, `lowongan/${key}`);
    const unsubscribe = onValue(lowRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setApplied(true);
        const st = (data?.status as "pending" | "accepted" | "rejected") || "pending";
        setApplicationStatus(st);
      } else {
        setApplied(false);
        setApplicationStatus(null);
      }
    });
    return () => unsubscribe();
  }, [id]);

  async function handleApply() {
    setApplyError(null);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    try {
      setApplyLoading(true);
      const key = `${id}_${currentUser.uid}`;
      const lowRef = ref(database, `lowongan/${key}`);
      await set(lowRef, {
        job_id: id,
        pelamar_id: currentUser.uid,
        status: "pending",
        applied_at: serverTimestamp(),
      });
      setApplied(true);
      setApplicationStatus("pending");
    } catch (e) {
      setApplyError("Gagal mengirim lamaran. Coba lagi nanti.");
    } finally {
      setApplyLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 rounded-2xl w-full max-w-3xl space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </Card>
      </div>
    );
  }

  function formatDate(dateStr: string): string {
    // Memastikan bahwa input dateStr memiliki panjang yang tepat (8 karakter)
    if (dateStr.length !== 8) {
      throw new Error('Format tanggal tidak valid');
    }

    // Memisahkan string tanggal berdasarkan bagian tahun, bulan, dan hari
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    // Mengembalikan format yang diinginkan
    return `${day}/${month}/${year}`;
  }

  // Contoh penggunaan
  const formattedDate = formatDate('20251009');
  console.log(formattedDate); 

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-muted-foreground mb-4">Pekerjaan tidak ditemukan.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="relative flex flex-col md:flex-row items-start w-full max-w-5xl p-8 rounded-3xl shadow-lg bg-white gap-8">
          {/* Left: Image */}
          <Button
            variant="ghost"
            className="flex items-center gap-2 absolute top-5 left-5 mb-50  bg-transparent hover:bg-transparent font-semibold hover:text-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />     
          </Button>
          <div className="w-full md:w-1/2 flex justify-center mt-10">
            <img
              src={job.image || "/placeholder.svg"}
              alt={job.title} 
              className="w-full h-80 object-cover rounded-2xl shadow-md"
            />
          </div>

          {/* Right: Details */}
          <div className="flex-1 space-y-4 mt-10">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground font-semibold flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </p>
            <p className="text-primary  font-semibold text-lg flex items-center gap-1">
              {job.pay}
            </p>

            <div className="text-sm leading-relaxed space-y-1 ">
              <p><strong>Status:</strong> {job.status}</p>
              <p><strong>Kategori:</strong> {job.category}</p>
              <p><strong>Employer:</strong> {job.employer}</p>
              <p><strong>Tanggal Posting:</strong> {formatDate(job.postedDate)}</p>
            </div>

            <div className="pt-4">
              <div className="flex gap-3 flex-wrap">

                {job.status?.toLowerCase() === "open" ? (
                  applied ? (
                    <Button disabled variant="default">
                      Sudah melamar
                    </Button>
                  ) : (
                    <Button onClick={handleApply} disabled={applyLoading}>
                      {applyLoading ? "Mengirim…" : "Lamar Sekarang"}
                    </Button>
                  )
                ) : (
                  <Button disabled variant="secondary">
                    Lowongan Ditutup
                  </Button>
                )}

                {applyError && (
                  <p className="text-sm text-red-500 mt-2 w-full">{applyError}</p>
                )}

                {applied && !applyError && (
                  <p className="text-sm mt-2 w-full">
                    Status lamaran:{" "}
                    <span
                      className={
                        applicationStatus === "accepted"
                          ? "text-green-600"
                          : applicationStatus === "rejected"
                          ? "text-red-600"
                          : "text-amber-600"
                      }
                    >
                      {applicationStatus === "accepted"
                        ? "Diterima"
                        : applicationStatus === "rejected"
                        ? "Ditolak"
                        : "Menunggu"}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}