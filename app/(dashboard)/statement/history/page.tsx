import { prisma } from "@/lib/db";
import { Download, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function ExportHistoryPage() {
  const exportJobs = await prisma.exportJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Export History</h2>
        <p className="mt-2 text-sm text-slate-500">
          Riwayat proses export statement yang telah dilakukan.
        </p>
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
    </div>
  );
}