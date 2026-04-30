import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/logout-button";
import { DashboardNav } from "@/components/dashboard-nav";
import { SafeLogo } from "@/components/ui/safe-logo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="h-11 w-11 overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
            <SafeLogo size={36} className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Statement</p>
            <p className="text-xs text-slate-500">Automation System</p>
          </div>
        </div>

        <DashboardNav role={user.role} />

        <div className="absolute bottom-6 left-5 right-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{user.name}</p>
            <p className="mt-1 truncate text-xs text-slate-500">@{user.username}</p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-6 lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Web Dashboard
              </p>
              <h1 className="text-base font-semibold text-slate-950">
                Statement Automation
              </h1>
            </div>
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 md:flex">
              <BarChart3 className="h-4 w-4" />
              System Online
            </div>
          </div>
          <div className="flex gap-2 border-t border-slate-100 px-6 pb-3 pt-2 lg:hidden">
            <Link href="/statement/sync" className="btn-primary px-3 py-2 text-xs font-semibold">
              Sync
            </Link>
            <Link href="/statement/export" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
              Export
            </Link>
            {user.role === "ADMIN" ? (
              <Link href="/users" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                Users
              </Link>
            ) : null}
          </div>
        </header>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:hidden">
            <DashboardNav role={user.role} compact />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
