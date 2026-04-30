"use client";

type LoadingOverlayProps = {
  show: boolean;
  title?: string;
  description?: string;
};

export function LoadingOverlay({ show, title = "Sedang memproses", description = "Mohon tunggu sebentar..." }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm transition-all duration-200">
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 text-center shadow-2xl transition-all duration-200">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}
