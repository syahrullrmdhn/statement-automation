"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SafeLogo } from "@/components/ui/safe-logo";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !loading;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login gagal");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* Left Panel - Gradient & Welcome */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-sky-800 to-sky-700 lg:flex lg:w-1/2">
        {/* Decorative geometric elements */}
        <div className="absolute -top-20 -right-20 w-96 h-96 border border-white/10 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-[32rem] h-[32rem] border border-white/10 rounded-full" />
        <div className="absolute top-1/4 -left-8 w-32 h-32 border border-white/10 rounded-full" />
        <div className="absolute bottom-1/4 right-12 w-20 h-20 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white/20 rounded-full" />
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-white/20 rounded-full" />
        <div className="absolute top-20 left-16">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white/10">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="absolute bottom-20 right-16">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white/10">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-20 h-full">
          <div className="max-w-lg">
            <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/20 p-2 backdrop-blur-sm">
              <SafeLogo size={52} className="h-full w-full object-contain" />
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
              Hello, welcome!
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-sky-100">
              Masuk untuk mengelola sinkronisasi dan ekspor statement dengan mudah dan cepat.
            </p>
            <div className="mt-12 flex items-center gap-3 text-white/60 text-sm">
              <div className="h-px w-8 bg-white/20" />
              <span>Statement Automation System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full items-center justify-center bg-gradient-to-b from-white to-slate-50 px-8 py-12 lg:w-1/2">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)]">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2">
              <SafeLogo size={112} className="h-full w-full object-contain" />
            </div>
          </div>

          <h2 className="text-center text-2xl font-semibold text-slate-900">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Masukkan kredensial Anda untuk melanjutkan
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <div className="mt-2 relative">
                <div className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-sky-700" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full border-b border-slate-200 bg-transparent py-3 pl-4 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-700"
                  placeholder="Masukkan username"
                  type="text"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute bottom-0 left-0 top-0 w-1 rounded-full bg-sky-700" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full border-b border-slate-200 bg-transparent py-3 pl-4 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-700"
                  placeholder="Masukkan password"
                  type="password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-lg bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Memproses..." : "Login"}
              </button>

            <p className="text-center text-xs text-slate-500">
              Gunakan username dan password yang terdaftar.
            </p>

          </form>
        </div>
      </div>
    </main>
  );
}
