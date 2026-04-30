"use client";

import { useState } from "react";
import { extractAccountsFromText } from "@/lib/statement/account-parser";

type ExportResult = {
  status: string;
  foundAccounts: number;
  missingAccounts: number;
  downloadUrl?: string;
};

export default function ExportStatementPage() {
  const [title, setTitle] = useState("Pantau");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [dealerEmailText, setDealerEmailText] = useState("");
  const [accountText, setAccountText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState("");

  async function handleExport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const accounts = extractAccountsFromText(accountText).map((item) => item.trim());

    try {
      const response = await fetch("/api/statement/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, year, month, accounts }),
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

  function handleExtractAccounts() {
    const accounts = extractAccountsFromText(dealerEmailText);
    setAccountText(accounts.join("\n"));
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
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Tahun</label>
            <input
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Bulan</label>
            <input
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Sumber Email Dealer (paste isi email)
            </label>
            <textarea
              value={dealerEmailText}
              onChange={(event) => setDealerEmailText(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              rows={8}
              placeholder="Paste isi email dealer di sini"
            />
            <button
              type="button"
              onClick={handleExtractAccounts}
              className="mt-3 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Ambil Account Otomatis
            </button>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Accounts (satu per baris atau dipisahkan koma)
            </label>
            <textarea
              value={accountText}
              onChange={(event) => setAccountText(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              rows={8}
              placeholder="1001&#10;1002&#10;1003"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            disabled={loading}
            className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-950">Export Result</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              ["Status", result.status],
              ["Found", result.foundAccounts],
              ["Missing", result.missingAccounts],
              ["Total", result.foundAccounts + result.missingAccounts],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          {result.downloadUrl && (
            <div className="mt-4">
              <a
                href={result.downloadUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
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
