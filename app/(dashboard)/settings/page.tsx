export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Settings</h2>
        <p className="mt-2 text-sm text-slate-500">
          Pengaturan aplikasi dan konfigurasi sistem.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">
          Informasi Aplikasi
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Nama Aplikasi
            </label>
            <p className="mt-2 text-sm text-slate-600">
              Statement Automation System
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Versi</label>
            <p className="mt-2 text-sm text-slate-600">1.0.0</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Environment
            </label>
            <p className="mt-2 text-sm text-slate-600">
              {process.env.NODE_ENV || "development"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">
          Koneksi Database
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Database Host
            </label>
            <p className="mt-2 text-sm text-slate-600">
              195.88.211.210:5432
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Database Name
            </label>
            <p className="mt-2 text-sm text-slate-600">
              syahrul1_statement
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">
          Koneksi AWS S3
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Region</label>
            <p className="mt-2 text-sm text-slate-600">
              {process.env.AWS_REGION}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Bucket</label>
            <p className="mt-2 text-sm text-slate-600">
              {process.env.S3_BUCKET}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Statement Prefix
            </label>
            <p className="mt-2 text-sm text-slate-600">
              {process.env.S3_STATEMENT_PREFIX}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}