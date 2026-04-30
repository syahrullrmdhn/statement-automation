"use client";

type ToastProps = {
  show: boolean;
  type?: "success" | "error" | "info";
  message: string;
  onClose: () => void;
};

export function Toast({ show, type = "info", message, onClose }: ToastProps) {
  if (!show) return null;

  const color =
    type === "success"
      ? "border-sky-200 bg-sky-50 text-sky-900"
      : type === "error"
      ? "border-sky-300 bg-sky-100 text-sky-900"
      : "border-slate-200 bg-white text-slate-800";

  return (
    <div className={`fixed right-6 top-20 z-50 w-full max-w-sm rounded-lg border px-4 py-3 text-sm shadow-xl backdrop-blur-sm transition-all duration-200 ${color}`}>
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        <button onClick={onClose} className="rounded px-1.5 py-0.5 text-xs transition hover:bg-white/70">
          tutup
        </button>
      </div>
    </div>
  );
}
