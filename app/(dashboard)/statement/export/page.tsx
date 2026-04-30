"use client";

import { useState } from "react";
import { extractAccountsFromText } from "@/lib/statement/account-parser";
import { Toast } from "@/components/ui/toast";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { humanizeMessage } from "@/lib/ui/humanize-message";
import { Modal } from "@/components/ui/modal";

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
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchAccount, setSearchAccount] = useState("");
  const [searchYear, setSearchYear] = useState(new Date().getFullYear().toString());
  const [searchMonth, setSearchMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{ found: boolean; message?: string; serverName?: string; fileName?: string; downloadUrl?: string } | null>(null);

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
        const message = humanizeMessage(data.message || "Export belum berhasil.");
        setError(message);
        setToast({ type: "error", message });
        return;
      }

      setResult(data);
      setToast({
        type: "success",
        message: "Export selesai. Silakan unduh file ZIP hasilnya.",
      });
    } catch {
      const message = "Export belum bisa diproses. Coba lagi beberapa saat.";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  function handleExtractAccounts() {
    const accounts = extractAccountsFromText(dealerEmailText);
    setAccountText(accounts.join("\n"));
  }

  async function handleSearchStatement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const response = await fetch(
        `/api/statement/search?account=${encodeURIComponent(searchAccount.trim())}&year=${searchYear}&month=${searchMonth}`
      );
      const data = await response.json();
      if (!response.ok) {
        setSearchResult({ found: false, message: humanizeMessage(data.message || "Statement tidak ditemukan.") });
        return;
      }
      setSearchResult(data);
    } catch {
      setSearchResult({ found: false, message: "Pencarian statement gagal diproses. Coba lagi." });
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <LoadingOverlay show={loading} title="Sedang menyiapkan export" description="Sistem sedang menyusun file statement Anda" />
      <Toast
        show={Boolean(toast)}
        type={toast?.type}
        message={toast?.message || ""}
        onClose={() => setToast(null)}
      />
      <Modal
        open={showSearchModal}
        title="Cari 1 Statement (.htm)"
        description="Cari file statement berdasarkan account dan periode"
        onClose={() => setShowSearchModal(false)}
      >
        <form onSubmit={handleSearchStatement} className="space-y-3">
          <input
            value={searchAccount}
            onChange={(event) => setSearchAccount(event.target.value)}
            placeholder="Nomor account"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={searchYear}
              onChange={(event) => setSearchYear(event.target.value)}
              placeholder="Tahun (YYYY)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            />
            <input
              value={searchMonth}
              onChange={(event) => setSearchMonth(event.target.value)}
              placeholder="Bulan (MM)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowSearchModal(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">Tutup</button>
            <button disabled={searchLoading} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 disabled:opacity-60">
              {searchLoading ? "Mencari..." : "Cari Statement"}
            </button>
          </div>
        </form>
        {searchResult ? (
          <div className={`mt-4 rounded-lg border px-3 py-3 text-sm ${searchResult.found ? "border-sky-200 bg-sky-50 text-sky-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
            {searchResult.found ? (
              <div className="space-y-2">
                <p>Statement ditemukan{searchResult.serverName ? ` di ${searchResult.serverName}` : ""}.</p>
                {searchResult.downloadUrl ? (
                  <a href={searchResult.downloadUrl} className="inline-flex rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">Unduh .htm</a>
                ) : null}
              </div>
            ) : (
              <p>{searchResult.message}</p>
            )}
          </div>
        ) : null}
      </Modal>
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">
          Export Statement
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Generate ZIP statement berdasarkan periode dan daftar account.
        </p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cari 1 Statement (.htm)
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Panduan Singkat</p>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
          <p className="rounded-lg bg-slate-50 px-3 py-2">1. Isi periode export.</p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">2. Ambil account dari email dealer atau isi manual.</p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">3. Klik Mulai Export lalu unduh ZIP hasil.</p>
        </div>
      </section>

      <form
        onSubmit={handleExport}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

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

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Sumber Email Dealer (paste isi email)
            </label>
            <textarea
              value={dealerEmailText}
              onChange={(event) => setDealerEmailText(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              rows={8}
              placeholder="Paste isi email dealer di sini"
            />
            <button
              type="button"
              onClick={handleExtractAccounts}
              className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50"
            >
              Ambil Account Otomatis dari Email
            </button>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Accounts (1 baris 1 account atau dipisahkan koma)
            </label>
            <textarea
              value={accountText}
              onChange={(event) => setAccountText(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              rows={8}
              placeholder="1001&#10;1002&#10;1003"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            disabled={loading}
            className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Mulai Export"}
          </button>
          <p className="text-xs text-slate-500">Hasil file akan bernama `ACCOUNT_YYYYMMDD_HHMMSS.htm` di dalam ZIP.</p>
        </div>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200">
          <h3 className="font-semibold text-slate-950">Hasil Export</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              ["Status", result.status],
              ["Ditemukan", result.foundAccounts],
              ["Tidak Ditemukan", result.missingAccounts],
              ["Total", result.foundAccounts + result.missingAccounts],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          {result.downloadUrl && (
            <div className="mt-4">
              <a
                href={result.downloadUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800"
              >
                Unduh ZIP
              </a>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
