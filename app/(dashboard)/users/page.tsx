"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { humanizeMessage } from "@/lib/ui/humanize-message";

type UserItem = {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "OPERATOR" | "VIEWER";
  isActive: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "OPERATOR" as UserItem["role"],
  });
  const [newPassword, setNewPassword] = useState("");

  async function loadUsers(startLoading = true) {
    if (startLoading) setLoading(true);
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setToast({ type: "error", message: humanizeMessage(data.message) });
        return;
      }
      setUsers(data.users || []);
    } catch {
      setToast({ type: "error", message: "Data user belum bisa dimuat. Coba lagi." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers(false);
  }, []);

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setToast({ type: "error", message: humanizeMessage(data.message) });
        return;
      }
      setForm({ name: "", username: "", password: "", role: "OPERATOR" });
      setShowAddModal(false);
      setToast({ type: "success", message: "User baru berhasil ditambahkan." });
      await loadUsers(false);
    } catch {
      setToast({ type: "error", message: "Gagal menambahkan user. Silakan coba lagi." });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(item: UserItem) {
    try {
      const response = await fetch(`/api/users/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!response.ok) {
        const data = await response.json();
        setToast({ type: "error", message: humanizeMessage(data.message) });
        return;
      }
      setToast({ type: "success", message: "Status user berhasil diperbarui." });
      await loadUsers(false);
    } catch {
      setToast({ type: "error", message: "Gagal mengubah status user." });
    }
  }

  async function handleRoleChange(item: UserItem, role: UserItem["role"]) {
    try {
      const response = await fetch(`/api/users/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        const data = await response.json();
        setToast({ type: "error", message: humanizeMessage(data.message) });
        return;
      }
      setToast({ type: "success", message: "Role user berhasil diperbarui." });
      await loadUsers(false);
    } catch {
      setToast({ type: "error", message: "Gagal mengubah role user." });
    }
  }

  async function handleResetPassword() {
    if (!selectedUser) return;
    if (newPassword.length < 8) {
      setToast({ type: "error", message: "Password minimal 8 karakter." });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setToast({ type: "error", message: humanizeMessage(data.message) });
        return;
      }
      setShowResetModal(false);
      setSelectedUser(null);
      setNewPassword("");
      setToast({ type: "success", message: "Password user berhasil diubah." });
    } catch {
      setToast({ type: "error", message: "Gagal mengubah password user." });
    } finally {
      setSaving(false);
    }
  }

  const activeCount = useMemo(() => users.filter((item) => item.isActive).length, [users]);

  return (
    <div className="space-y-6">
      <LoadingOverlay show={loading || saving} title="Memproses" description="Mohon tunggu sebentar..." />
      <Toast show={Boolean(toast)} type={toast?.type} message={toast?.message || ""} onClose={() => setToast(null)} />

      <Modal
        open={showAddModal}
        title="Tambah User"
        description="Isi data user baru di bawah ini"
        onClose={() => setShowAddModal(false)}
      >
        <form onSubmit={handleCreateUser} className="space-y-3">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            placeholder="Nama lengkap"
            required
          />
          <input
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            placeholder="Username"
            required
          />
          <input
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            placeholder="Password minimal 8 karakter"
            type="password"
            required
          />
          <select
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserItem["role"] }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="OPERATOR">OPERATOR</option>
            <option value="VIEWER">VIEWER</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
             <button type="button" onClick={() => setShowAddModal(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">Batal</button>
             <button className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800">Simpan User</button>
          </div>
        </form>
      </Modal>

      <Modal
        open={showResetModal}
        title="Reset Password User"
        description={selectedUser ? `Atur password baru untuk @${selectedUser.username}` : ""}
        onClose={() => setShowResetModal(false)}
      >
        <div className="space-y-3">
          <input
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
            placeholder="Password baru minimal 8 karakter"
            type="password"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowResetModal(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">Batal</button>
            <button onClick={handleResetPassword} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800">Reset Password</button>
          </div>
        </div>
      </Modal>

      <div>
        <h2 className="text-2xl font-semibold text-slate-950">User Management</h2>
        <p className="mt-2 text-sm text-slate-500">Kelola user, role, status aktif, dan password dengan lebih mudah.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50">
          <p className="text-xs text-slate-500">Total User</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{users.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50">
          <p className="text-xs text-slate-500">User Aktif</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50">
          <p className="text-xs text-slate-500">User Nonaktif</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{users.length - activeCount}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-950">Daftar User</h3>
          <button onClick={() => setShowAddModal(true)} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800">
            Tambah User
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-2 py-2">Username</th>
                <th className="px-2 py-2">Nama</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-2 py-2 font-medium text-slate-900">{item.username}</td>
                  <td className="px-2 py-2 text-slate-700">{item.name}</td>
                  <td className="px-2 py-2">
                    <select
                      value={item.role}
                      onChange={(event) => handleRoleChange(item, event.target.value as UserItem["role"])}
                       className="rounded-md border border-slate-200 px-2 py-1 text-xs transition focus:border-slate-900"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="OPERATOR">OPERATOR</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => handleToggleActive(item)}
                       className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                         item.isActive ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"
                       }`}
                    >
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => {
                        setSelectedUser(item);
                        setNewPassword("");
                        setShowResetModal(true);
                      }}
                       className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
