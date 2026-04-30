export default function SettingsPage() {
  const dbUrl = process.env.DATABASE_URL || "";
  const dbHost = dbUrl ? new URL(dbUrl).host : "-";

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Settings</h2>
        <p className="mt-2 text-sm text-slate-500">
          Pengaturan aplikasi, koneksi, dan otomatisasi.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            App
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Informasi Aplikasi</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Nama</dt>
              <dd className="font-medium text-slate-800">Statement Automation</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Environment</dt>
              <dd className="font-medium text-slate-800">{process.env.NODE_ENV || "development"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Storage Path</dt>
              <dd className="font-medium text-slate-800">{process.env.APP_STORAGE_PATH || "./storage"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Database
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Koneksi Database</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Provider</dt>
              <dd className="font-medium text-slate-800">PostgreSQL</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Host</dt>
              <dd className="truncate font-medium text-slate-800">{dbHost || "-"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            S3
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Koneksi AWS S3</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Region</dt>
              <dd className="font-medium text-slate-800">{process.env.AWS_REGION || "-"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Bucket</dt>
              <dd className="truncate font-medium text-slate-800">{process.env.S3_BUCKET || "-"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Prefix</dt>
              <dd className="truncate font-medium text-slate-800">{process.env.S3_STATEMENT_PREFIX || "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Automation
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Auto Sync Harian</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Waktu</dt>
              <dd className="font-medium text-slate-800">07:00 Asia/Jakarta</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Endpoint</dt>
              <dd className="font-medium text-slate-800">/api/cron/sync-daily</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Cron Secret</dt>
              <dd className="font-medium text-slate-800">
                {process.env.CRON_SECRET ? "Configured" : "Not set"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Jalankan scheduler eksternal untuk memanggil endpoint cron secara otomatis.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">Catatan</h3>
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          <li>- Semua credential tetap di `.env.local` dan tidak di-commit.</li>
          <li>- Route dashboard utama: `/dashboard`.</li>
          <li>- Sync `empty` berarti file tidak cocok filter/prefix.</li>
        </ul>
      </section>
    </div>
  );
}
