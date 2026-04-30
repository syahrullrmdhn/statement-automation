import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Cloud,
  Download,
  History,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/logout-button";

const menuItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Statement Sync", href: "/statement/sync", icon: Cloud },
  { label: "Export Statement", href: "/statement/export", icon: Download },
  { label: "Export History", href: "/statement/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

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
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
            SA
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Statement</p>
            <p className="text-xs text-slate-500">Automation System</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{user.name}</p>
            <p className="mt-1 truncate text-xs text-slate-500">@{user.username}</p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
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
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 md:flex">
              <BarChart3 className="h-4 w-4" />
              System Online
            </div>
          </div>
        </header>

        <main className="px-6 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}