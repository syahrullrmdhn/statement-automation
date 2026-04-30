"use client";

import { useState } from "react";

export default function StatementSyncPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [server, setServer] = useState("ALL");
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleSync(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/statement/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, server, force }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Sync gagal");
        return;
      }

      setResult(data);
    } catch {
      setError("Terjadi kesalahan saat sync");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Statement Sync</h2>
        <p className="mt-2 text-sm text-slate-500">
          Sinkronisasi file statement dari Amazon S3 ke storage aplikasi.
        </p>
      </div>

      <form
        onSubmit={handleSync}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Tahun</label>
            <input
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Bulan</label>
            <input
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Server</label>
            <select
              value={server}
              onChange={(event) => setServer(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            >
              <option value="ALL">ALL</option>
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
            <label className="flex h-[46px] w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={force}
                onChange={(event) => setForce(event.target.checked)}
              />
              Force Resync
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            disabled={loading}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Syncing..." : "Start Sync"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-950">Sync Result</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-5">
            {[
              ["Status", result.status],
              ["Found", result.totalFound],
              ["Downloaded", result.totalDownloaded],
              ["Skipped", result.totalSkipped],
              ["Failed", result.totalFailed],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
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