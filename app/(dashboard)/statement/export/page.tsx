"use client";

import { useState } from "react";

export default function ExportStatementPage() {
  const [title, setTitle] = useState("Pantau");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [server, setServer] = useState("ALL");
  const [accountText, setAccountText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleExport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const accounts = accountText
      .split(/\r?\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/statement/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, year, month, server, accounts }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Export gagal");
        return;
      }

      setResult(data);
    } catch {
      setError("Terjadi kesalahan saat export");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">
          Export Statement
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Generate ZIP statement berdasarkan periode dan daftar account.
        </p>
      </div>

      <form
        onSubmit={handleExport}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            />
          </div>

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

          <div className="md:col-span-2">
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

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Accounts (satu per baris atau dipisahkan koma)
            </label>
            <textarea
              value={accountText}
              onChange={(event) => setAccountText(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
              rows={8}
              placeholder="1001&#10;1002&#10;1003"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            disabled={loading}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Exporting..." : "Export"}
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
          <h3 className="font-semibold text-slate-950">Export Result</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              ["Status", result.status],
              ["Found", result.foundAccounts],
              ["Missing", result.missingAccounts],
              ["Total", result.foundAccounts + result.missingAccounts],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          {result.downloadUrl && (
            <div className="mt-4">
              <a
                href={result.downloadUrl}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Download ZIP
              </a>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}