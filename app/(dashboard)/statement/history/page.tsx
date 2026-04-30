import { prisma } from "@/lib/db";
import { Download, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

type HistoryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExportHistoryPage({ searchParams }: HistoryPageProps) {
  const params = (await searchParams) || {};
  const status = typeof params.status === "string" ? params.status : "";
  const year = typeof params.year === "string" ? params.year : "";
  const month = typeof params.month === "string" ? params.month : "";
  const page =
    typeof params.page === "string" && Number(params.page) > 0
      ? Math.floor(Number(params.page))
      : 1;
  const pageSize = 20;

  const whereClause = {
    ...(status ? { status } : {}),
    ...(year ? { periodYear: year } : {}),
    ...(month ? { periodMonth: month.padStart(2, "0") } : {}),
  };

  const [exportJobs, totalJobs] = await Promise.all([
    prisma.exportJob.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.exportJob.count({ where: whereClause }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalJobs / pageSize));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const queryBase = new URLSearchParams();
  if (status) queryBase.set("status", status);
  if (year) queryBase.set("year", year);
  if (month) queryBase.set("month", month);

  function buildPageHref(targetPage: number) {
    const search = new URLSearchParams(queryBase);
    search.set("page", String(targetPage));
    return `/statement/history?${search.toString()}`;
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Export History</h2>
        <p className="mt-2 text-sm text-slate-500">
          Riwayat proses export statement yang telah dilakukan.
        </p>
      </div>

      <form className="card-surface grid gap-3 p-4 md:grid-cols-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Status</label>
          <select
            name="status"
            defaultValue={status}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
          >
            <option value="">Semua</option>
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tahun</label>
          <input
            name="year"
            defaultValue={year}
            placeholder="2026"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Bulan</label>
          <input
            name="month"
            defaultValue={month}
            placeholder="04"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
          />
        </div>
        <div className="flex items-end gap-2">
          <button className="btn-primary px-4 py-2 text-sm font-semibold">Terapkan Filter</button>
          <a href="/statement/history" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Reset</a>
        </div>
      </form>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <p>Total data: {totalJobs}</p>
        <p>Halaman {page} / {totalPages}</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Periode
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Found/Missing
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {exportJobs.map((job) => {
                const statusIcon =
                  job.status === "completed" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : job.status === "processing" ? (
                    <Clock className="h-4 w-4 text-blue-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  );

                const statusColor =
                  job.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : job.status === "processing"
                    ? "bg-blue-100 text-blue-700"
                    : job.status === "partial"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700";

                return (
                  <tr
                    key={job.id.toString()}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600">
                      #{job.id.toString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-950">
                        {job.title}
                      </p>
                      {job.serverFilter && (
                        <p className="text-xs text-slate-500">
                          Server: {job.serverFilter}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {job.periodYear}-{job.periodMonth}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}
                      >
                        {statusIcon}
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {job.foundAccounts} / {job.missingAccounts}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(job.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      {job.status === "completed" ||
                      job.status === "partial" ? (
                        <a
                          href={`/api/statement/export/${job.id}/download`}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {exportJobs.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500">
                Belum ada riwayat export.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {prevPage ? (
          <Link href={buildPageHref(prevPage)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Sebelumnya
          </Link>
        ) : null}
        {nextPage ? (
          <Link href={buildPageHref(nextPage)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Berikutnya
          </Link>
        ) : null}
      </div>
    </div>
  );
}
