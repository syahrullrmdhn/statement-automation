"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud,
  Download,
  History,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";

type DashboardNavProps = {
  role?: string;
  compact?: boolean;
};

const menuGroups = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Statement Sync", href: "/statement/sync", icon: Cloud },
      { label: "Export Statement", href: "/statement/export", icon: Download },
      { label: "Export History", href: "/statement/history", icon: History },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "User Management", href: "/users", icon: Users, roles: ["ADMIN"] },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function DashboardNav({ role, compact = false }: DashboardNavProps) {
  const pathname = usePathname();

  const groups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || (role && item.roles.includes(role))),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav className={compact ? "space-y-4" : "mt-8 space-y-5"}>
      {groups.map((group) => (
        <div key={group.title} className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {group.title}
          </p>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
