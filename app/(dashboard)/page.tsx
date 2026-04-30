import Link from "next/link";
import { Cloud, Download, FileArchive, History } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [statementCount, syncJobCount, exportJobCount, completedExportCount] =
    await Promise.all([
      prisma.statementFile.count(),
      prisma.syncJob.count(),
      prisma.exportJob.count(),
      prisma.exportJob.count({ where: { status: "completed" } }),
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
      <section className="rounded-xl bg-slate-950 p-8 text-white shadow-soft">
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
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
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
