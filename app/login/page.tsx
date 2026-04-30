"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("syahrul");
  const [password, setPassword] = useState("syahrul2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <main className="min-h-screen flex">
      {/* Left Panel - Gradient & Welcome */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 overflow-hidden">
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
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
              Hello, welcome!
            </h1>
            <p className="mt-6 text-lg text-blue-100 leading-relaxed max-w-md">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="w-32 h-32 flex items-center justify-center">
              <img
                src="/3S_Logogram.png"
                alt="3S Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 text-center">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-slate-500 text-center">
            Masukkan kredensial Anda untuk melanjutkan
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <div className="mt-2 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full border-b border-slate-200 bg-transparent py-3 pl-4 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  placeholder="Masukkan username"
                  type="text"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full border-b border-slate-200 bg-transparent py-3 pl-4 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                  placeholder="Masukkan password"
                  type="password"
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
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Login"}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 w-full"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}