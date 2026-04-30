"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "OPERATOR" as UserItem["role"],
  });
  const [saving, setSaving] = useState(false);

  async function loadUsers(startLoading = true) {
    if (startLoading) {
      setLoading(true);
    }
    setError("");
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Gagal memuat user");
        return;
      }
      setUsers(data.users || []);
    } catch {
      setError("Terjadi kesalahan saat memuat data user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers(false);
  }, []);

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Gagal membuat user");
        return;
      }
      setForm({ name: "", username: "", password: "", role: "OPERATOR" });
      await loadUsers();
    } catch {
      setError("Terjadi kesalahan saat membuat user");
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
        setError(data.message || "Gagal update status user");
        return;
      }
      await loadUsers();
    } catch {
      setError("Terjadi kesalahan saat update status user");
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
        setError(data.message || "Gagal update role user");
        return;
      }
      await loadUsers();
    } catch {
      setError("Terjadi kesalahan saat update role user");
    }
  }

  async function handleResetPassword(item: UserItem) {
    const password = window.prompt(`Password baru untuk ${item.username}:`);
    if (!password) {
      return;
    }
    try {
      const response = await fetch(`/api/users/${item.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Gagal reset password");
        return;
      }
      alert("Password berhasil diupdate");
    } catch {
      setError("Terjadi kesalahan saat reset password");
    }
  }

  const activeCount = useMemo(
    () => users.filter((item) => item.isActive).length,
    [users]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">User Management</h2>
        <p className="mt-2 text-sm text-slate-500">Kelola user, role, status aktif, dan reset password.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total User</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{users.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">User Aktif</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">User Nonaktif</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{users.length - activeCount}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">Tambah User</h3>
        <form onSubmit={handleCreateUser} className="mt-4 grid gap-4 md:grid-cols-4">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            placeholder="Nama"
            required
          />
          <input
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            placeholder="Username"
            required
          />
          <input
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            placeholder="Password (min 8)"
            type="password"
            required
          />
          <select
            value={form.role}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, role: event.target.value as UserItem["role"] }))
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="OPERATOR">OPERATOR</option>
            <option value="VIEWER">VIEWER</option>
          </select>
          <button
            disabled={saving}
            className="md:col-span-4 w-fit rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Tambah User"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">Daftar User</h3>
        {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Memuat data user...</p>
        ) : (
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
                        onChange={(event) =>
                          handleRoleChange(item, event.target.value as UserItem["role"])
                        }
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="OPERATOR">OPERATOR</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => handleResetPassword(item)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
