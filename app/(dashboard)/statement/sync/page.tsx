"use client";

import { useEffect, useMemo, useState } from "react";
import { Toast } from "@/components/ui/toast";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { humanizeMessage } from "@/lib/ui/humanize-message";

type SyncResult = {
  jobId?: string;
  status: string;
  totalFound: number;
  totalDownloaded: number;
  totalSkipped: number;
  totalFailed: number;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
};

const ACTIVE_SYNC_JOB_KEY = "active_sync_job_id";

export default function StatementSyncPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [server, setServer] = useState("ALL");
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACTIVE_SYNC_JOB_KEY);
  });
  const [jobProgress, setJobProgress] = useState<SyncResult | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  useEffect(() => {
    if (!activeJobId) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/statement/sync/${activeJobId}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          return;
        }

        const current: SyncResult = {
          jobId: data.jobId,
          status: data.status,
          totalFound: data.totalFound,
          totalDownloaded: data.totalDownloaded,
          totalSkipped: data.totalSkipped,
          totalFailed: data.totalFailed,
          message: data.errorMessage || undefined,
          startedAt: data.startedAt,
          finishedAt: data.finishedAt,
        };

        setJobProgress(current);

        if (["success", "partial", "failed", "empty"].includes(current.status)) {
          setResult(current);
          setActiveJobId(null);
          window.localStorage.removeItem(ACTIVE_SYNC_JOB_KEY);
          if (current.status === "success") {
            setToast({ type: "success", message: "Sinkronisasi selesai. Data sudah diperbarui." });
          } else if (current.status === "empty") {
            setToast({ type: "info", message: "Sinkronisasi selesai, tetapi tidak ada file yang cocok." });
          } else {
            setToast({ type: "error", message: "Sinkronisasi selesai dengan catatan. Silakan cek hasilnya." });
          }
        }
      } catch {
        return;
      }
    };

    void fetchProgress();
    timer = setInterval(() => {
      void fetchProgress();
    }, 2500);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeJobId]);

  useEffect(() => {
    if (!activeJobId) return;
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeJobId]);

  async function handleSync(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/statement/sync/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, server, force }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = humanizeMessage(data.message || "Sinkronisasi belum berhasil.");
        setError(message);
        setToast({ type: "error", message });
        return;
      }

      if (data.jobId) {
        setActiveJobId(data.jobId);
        window.localStorage.setItem(ACTIVE_SYNC_JOB_KEY, data.jobId);
      }
      setToast({ type: "info", message: data.message || "Sinkronisasi dimulai. Anda bisa pindah ke halaman lain." });
    } catch {
      const message = "Sinkronisasi gagal diproses. Silakan coba lagi.";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  const processedCount = useMemo(() => {
    if (!jobProgress) return 0;
    return jobProgress.totalDownloaded + jobProgress.totalSkipped + jobProgress.totalFailed;
  }, [jobProgress]);

  const progressPercent = useMemo(() => {
    if (!jobProgress || jobProgress.totalFound <= 0) return 0;
    return Math.min(100, Math.round((processedCount / jobProgress.totalFound) * 100));
  }, [jobProgress, processedCount]);

  const etaText = useMemo(() => {
    if (!jobProgress?.startedAt || jobProgress.totalFound <= 0 || processedCount <= 0) {
      return "Menghitung estimasi...";
    }

    const elapsedSec = Math.max(
      1,
      Math.floor((nowMs - new Date(jobProgress.startedAt).getTime()) / 1000)
    );
    const ratePerSec = processedCount / elapsedSec;
    if (ratePerSec <= 0) return "Menghitung estimasi...";

    const remaining = Math.max(0, jobProgress.totalFound - processedCount);
    const etaSec = Math.ceil(remaining / ratePerSec);
    const minutes = Math.floor(etaSec / 60);
    const seconds = etaSec % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s lagi` : `${seconds}s lagi`;
  }, [jobProgress, processedCount, nowMs]);

  return (
    <div className="max-w-5xl space-y-6">
      <LoadingOverlay show={loading} title="Memulai sinkronisasi" description="Sistem sedang menyiapkan job sinkronisasi" />
      <Toast
        show={Boolean(toast)}
        type={toast?.type}
        message={toast?.message || ""}
        onClose={() => setToast(null)}
      />
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Statement Sync</h2>
        <p className="mt-2 text-sm text-slate-500">
          Sinkronisasi file statement dari Amazon S3 ke storage aplikasi.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Panduan Singkat</p>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
          <p className="rounded-lg bg-slate-50 px-3 py-2">1. Pilih tahun, bulan, dan server.</p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">2. Klik Mulai Sinkronisasi.</p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">3. Pantau progress, lalu lanjut ke Export.</p>
        </div>
      </section>

      {activeJobId && jobProgress ? (
        <section className="rounded-xl border border-sky-200 bg-sky-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-sky-900">Sync sedang berjalan</p>
              <p className="text-xs text-sky-800">
                Job #{jobProgress.jobId} • ETA {etaText} • Anda bisa pindah halaman lain
              </p>
            </div>
            <p className="text-sm font-semibold text-sky-900">{progressPercent}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sky-100">
            <div className="h-full rounded-full bg-sky-700 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="mt-3 grid gap-3 text-xs text-sky-900 md:grid-cols-4">
            <p>Total cocok: {jobProgress.totalFound}</p>
            <p>Diproses: {processedCount}</p>
            <p>Diunduh: {jobProgress.totalDownloaded}</p>
            <p>Gagal: {jobProgress.totalFailed}</p>
          </div>
        </section>
      ) : null}

      <form
        onSubmit={handleSync}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Tahun</label>
            <input
              value={year}
              onChange={(event) => setYear(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Bulan</label>
            <input
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Server</label>
            <select
              value={server}
              onChange={(event) => setServer(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            >
              <option value="ALL">ALL (Semua Server)</option>
              <option value="MT4IN1">MT4IN1</option>
              <option value="MT4IN2">MT4IN2</option>
              <option value="MT4IN3">MT4IN3</option>
              <option value="MT4IN4">MT4IN4</option>
              <option value="MT4IN5">MT4IN5</option>
              <option value="MT4HK">MT4HK</option>
              <option value="MT4NY">MT4NY</option>
              <option value="MT5IN1">MT5IN1</option>
              <option value="MT5IN2">MT5IN2</option>
              <option value="MT5NY">MT5NY</option>
            </select>
          </div>

          <div className="flex items-end">
             <label className="flex h-[46px] w-full items-center gap-3 rounded-lg border border-slate-200 px-4 text-sm text-slate-700 transition hover:bg-slate-50">
              <input
                type="checkbox"
                checked={force}
                onChange={(event) => setForce(event.target.checked)}
              />
               Sinkron ulang paksa
            </label>
          </div>
        </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            disabled={loading || Boolean(activeJobId)}
            className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Memproses..." : activeJobId ? "Sync Sedang Berjalan" : "Mulai Sinkronisasi"}
          </button>
          <p className="text-xs text-slate-500">Tips: sinkronisasi tetap berjalan walau Anda pindah menu.</p>
        </div>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200">
          <h3 className="font-semibold text-slate-950">Hasil Sinkronisasi</h3>
          {result.status === "empty" ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {result.message ||
                "Tidak ada file statement yang cocok. Cek periode, server, dan S3 prefix."}
            </div>
          ) : null}
          <div className="mt-4 grid gap-4 md:grid-cols-5">
            {[
              ["Status", result.status],
              ["Ditemukan", result.totalFound],
              ["Diunduh", result.totalDownloaded],
              ["Dilewati", result.totalSkipped],
              ["Gagal", result.totalFailed],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
