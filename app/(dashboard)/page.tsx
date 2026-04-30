import Link from "next/link";
import { Cloud, Download, FileArchive, History, UserPlus } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [statementCount, syncJobCount, exportJobCount, completedExportCount, lastSyncJob, lastExportJob] =
    await Promise.all([
      prisma.statementFile.count(),
      prisma.syncJob.count(),
      prisma.exportJob.count(),
      prisma.exportJob.count({ where: { status: "completed" } }),
      prisma.syncJob.findFirst({ orderBy: { createdAt: "desc" } }),
      prisma.exportJob.findFirst({ orderBy: { createdAt: "desc" } }),
    ]);

  const cards = [
    {
      label: "Statement Files",
      value: statementCount,
      icon: FileArchive,
      description: "Total file statement tersimpan",
    },
    {
      label: "Sync Jobs",
      value: syncJobCount,
      icon: Cloud,
      description: "Total proses sinkronisasi",
    },
    {
      label: "Export Jobs",
      value: exportJobCount,
      icon: Download,
      description: "Total proses export",
    },
    {
      label: "Completed Export",
      value: completedExportCount,
      icon: History,
      description: "Export selesai diproses",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900 p-8 text-white shadow-soft">
        <p className="text-sm font-medium text-slate-300">Overview</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight">
          Kelola sinkronisasi dan export statement dari satu dashboard sederhana.
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/statement/sync"
            className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Start Sync
          </Link>
          <Link
            href="/statement/export"
            className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Export Statement
          </Link>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Job Sync Terakhir</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {lastSyncJob ? `${lastSyncJob.periodYear}-${lastSyncJob.periodMonth} · ${lastSyncJob.status}` : "Belum ada data"}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {lastSyncJob ? new Date(lastSyncJob.createdAt).toLocaleString("id-ID") : "Jalankan sync pertama untuk mulai"}
            </p>
          </div>
          <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Job Export Terakhir</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {lastExportJob ? `${lastExportJob.periodYear}-${lastExportJob.periodMonth} · ${lastExportJob.status}` : "Belum ada data"}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {lastExportJob ? new Date(lastExportJob.createdAt).toLocaleString("id-ID") : "Jalankan export pertama untuk mulai"}
            </p>
          </div>
        </div>
      </section>

      <section className="card-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-slate-700">Quick Actions</p>
          <Link href="/statement/sync" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold">
            <Cloud className="h-3.5 w-3.5" />
            Sync Bulan Ini
          </Link>
          <Link href="/statement/export" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" />
            Export Cepat
          </Link>
          <Link href="/users" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
            <UserPlus className="h-3.5 w-3.5" />
            Tambah User
          </Link>
        </div>
      </section>

      <section className="card-surface p-5">
        <h3 className="text-base font-semibold text-slate-900">Cara Kerja Cepat</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Langkah 1</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Sync Statement</p>
            <p className="mt-1 text-xs text-slate-600">Ambil file ZIP statement dari S3 sesuai bulan.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Langkah 2</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Export Berdasarkan Account</p>
            <p className="mt-1 text-xs text-slate-600">Paste email dealer atau isi account manual, lalu export ZIP hasil.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Langkah 3</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Cek History dan Download</p>
            <p className="mt-1 text-xs text-slate-600">Lihat status proses dan unduh hasil kapan saja di Export History.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="card-surface p-6 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-6 text-sm font-medium text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {card.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{card.description}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
