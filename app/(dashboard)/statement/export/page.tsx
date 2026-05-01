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
  const [batchSpecificDate, setBatchSpecificDate] = useState("");
  const [batchRangeStart, setBatchRangeStart] = useState("");
  const [batchRangeEnd, setBatchRangeEnd] = useState("");
  const [batchUseLookback20, setBatchUseLookback20] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchAccount, setSearchAccount] = useState("");
  const [searchYear, setSearchYear] = useState(new Date().getFullYear().toString());
  const [searchMonth, setSearchMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [searchDate, setSearchDate] = useState("");
  const [searchRangeStart, setSearchRangeStart] = useState("");
  const [searchRangeEnd, setSearchRangeEnd] = useState("");
  const [useLookback20, setUseLookback20] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{ found: boolean; message?: string; serverName?: string; fileName?: string; downloadUrl?: string } | null>(null);

  function formatDateInput(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  function applyPreset(type: "today" | "last7" | "last20" | "thisMonth") {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    setSearchYear(yyyy);
    setSearchMonth(mm);

    if (type === "today") {
      setSearchDate(formatDateInput(now));
      setUseLookback20(false);
      setSearchRangeStart("");
      setSearchRangeEnd("");
      return;
    }

    if (type === "last7") {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      setSearchDate("");
      setUseLookback20(false);
      setSearchRangeStart(formatDateInput(start));
      setSearchRangeEnd(formatDateInput(now));
      return;
    }

    if (type === "last20") {
      setSearchDate(formatDateInput(now));
      setUseLookback20(true);
      setSearchRangeStart("");
      setSearchRangeEnd("");
      return;
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setSearchDate("");
    setUseLookback20(false);
    setSearchRangeStart(formatDateInput(startOfMonth));
    setSearchRangeEnd(formatDateInput(now));
  }

  function applyBatchPreset(type: "today" | "last7" | "last20" | "thisMonth") {
    const now = new Date();

    if (type === "today") {
      setBatchSpecificDate(formatDateInput(now));
      setBatchUseLookback20(false);
      setBatchRangeStart("");
      setBatchRangeEnd("");
      return;
    }

    if (type === "last7") {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      setBatchSpecificDate("");
      setBatchUseLookback20(false);
      setBatchRangeStart(formatDateInput(start));
      setBatchRangeEnd(formatDateInput(now));
      return;
    }

    if (type === "last20") {
      setBatchSpecificDate(formatDateInput(now));
      setBatchUseLookback20(true);
      setBatchRangeStart("");
      setBatchRangeEnd("");
      return;
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setBatchSpecificDate("");
    setBatchUseLookback20(false);
    setBatchRangeStart(formatDateInput(startOfMonth));
    setBatchRangeEnd(formatDateInput(now));
  }

  async function handleExport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("🚀 Starting export process...");
    setLoading(true);
    setError("");
    setResult(null);

    const accounts = extractAccountsFromText(accountText).map((item) => item.trim());
    console.log("📋 Accounts to export:", accounts.length, accounts);

    if (accounts.length === 0) {
      const message = "Tidak ada account yang diexport. Mohon isi minimal satu nomor account.";
      setError(message);
      setToast({ type: "error", message });
      setLoading(false);
      return;
    }

    try {
      console.log("📤 Sending request to API...");
      const response = await fetch("/api/statement/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          year,
          month,
          accounts,
          specificDate: batchSpecificDate || undefined,
          rangeStart: batchRangeStart || undefined,
          rangeEnd: batchRangeEnd || undefined,
          lookbackDays:
            batchRangeStart && batchRangeEnd
              ? undefined
              : batchSpecificDate && batchUseLookback20
              ? 20
              : undefined,
        }),
      });

      console.log("📥 Response received:", response.status, response.statusText);
      const data = await response.json();
      console.log("📦 Response data:", data);

      if (!response.ok) {
        const message = humanizeMessage(data.message || "Export belum berhasil.");
        console.error("❌ Export failed:", message);
        setError(message);
        setToast({ type: "error", message });
        return;
      }

      console.log("✅ Export successful, setting result...");
      setResult(data);
      setToast({
        type: "success",
        message: `Export selesai! ${data.foundAccounts}/${data.totalAccounts} statement berhasil diexport.`,
      });
    } catch (err) {
      console.error("❌ Export error:", err);
      const message = "Export belum bisa diproses. Coba lagi beberapa saat.";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      console.log("🏁 Export process finished");
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
      const params = new URLSearchParams({
        account: searchAccount.trim(),
        year: searchYear,
        month: searchMonth,
      });
      if (searchDate) params.set("date", searchDate);
      if (searchRangeStart && searchRangeEnd) {
        params.set("rangeStart", searchRangeStart);
        params.set("rangeEnd", searchRangeEnd);
      } else if (searchDate && useLookback20) {
        params.set("lookbackDays", "20");
      }

      const response = await fetch(`/api/statement/search?${params.toString()}`);
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
        description="Pencarian exact account + tanggal spesifik, range tanggal, atau 20 hari ke belakang"
        onClose={() => setShowSearchModal(false)}
      >
        <form onSubmit={handleSearchStatement} className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Preset Cepat</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <button type="button" onClick={() => applyPreset("today")} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Hari Ini</button>
              <button type="button" onClick={() => applyPreset("last7")} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">7 Hari</button>
              <button type="button" onClick={() => applyPreset("last20")} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">20 Hari</button>
              <button type="button" onClick={() => applyPreset("thisMonth")} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Bulan Ini</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Account Exact</label>
            <input
              value={searchAccount}
              onChange={(event) => setSearchAccount(event.target.value)}
              placeholder="Nomor account (exact)"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tahun</label>
              <input
                value={searchYear}
                onChange={(event) => setSearchYear(event.target.value)}
                placeholder="YYYY"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Bulan</label>
              <input
                value={searchMonth}
                onChange={(event) => setSearchMonth(event.target.value)}
                placeholder="MM"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tanggal Spesifik</label>
              <input
                type="date"
                value={searchDate}
                onChange={(event) => setSearchDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={useLookback20}
                onChange={(event) => setUseLookback20(event.target.checked)}
              />
              Cari sampai 20 hari ke belakang dari tanggal spesifik
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Range Date</p>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <input
                type="date"
                value={searchRangeStart}
                onChange={(event) => setSearchRangeStart(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              />
              <input
                type="date"
                value={searchRangeEnd}
                onChange={(event) => setSearchRangeEnd(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">Jika range diisi, sistem pakai range. Jika tidak, sistem pakai tanggal spesifik (exact atau 20 hari ke belakang).</p>
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

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-slate-700">Filter Tanggal Batch (Opsional)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => applyBatchPreset("today")} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Hari Ini</button>
              <button type="button" onClick={() => applyBatchPreset("last7")} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">7 Hari</button>
              <button type="button" onClick={() => applyBatchPreset("last20")} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">20 Hari</button>
              <button type="button" onClick={() => applyBatchPreset("thisMonth")} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Bulan Ini</button>
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">Tanggal spesifik</label>
                <input
                  type="date"
                  value={batchSpecificDate}
                  onChange={(event) => setBatchSpecificDate(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={batchUseLookback20}
                    onChange={(event) => setBatchUseLookback20(event.target.checked)}
                  />
                  Cari 20 hari ke belakang dari tanggal spesifik
                </label>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">Range start</label>
                <input
                  type="date"
                  value={batchRangeStart}
                  onChange={(event) => setBatchRangeStart(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Range end</label>
                <input
                  type="date"
                  value={batchRangeEnd}
                  onChange={(event) => setBatchRangeEnd(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">Prioritas filter: range date &gt; tanggal spesifik + 20 hari &gt; tanggal spesifik exact.</p>
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
