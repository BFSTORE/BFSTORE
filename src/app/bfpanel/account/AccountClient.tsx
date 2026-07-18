"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ShieldCheck } from "lucide-react";

export default function AccountClient({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name,
    email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function save() {
    setMessage(null);
    if (!form.currentPassword) {
      return setMessage({ type: "err", text: "Masukkan password saat ini untuk konfirmasi." });
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return setMessage({ type: "err", text: "Konfirmasi password baru tidak sama." });
    }
    setSaving(true);
    const res = await fetch("/api/admin/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword || undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMessage({ type: "err", text: data.error ?? "Gagal menyimpan." });
    setForm({ ...form, currentPassword: "", newPassword: "", confirmPassword: "" });
    setMessage({ type: "ok", text: "Akun berhasil diperbarui." });
    router.refresh();
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Akun Admin</h1>
      <p className="mt-1 text-sm text-muted">Ubah nama, email login, dan password akun admin kamu.</p>

      <div className="card mt-7 p-6">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="ac-name">Nama</label>
              <input
                id="ac-name"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
            </div>
            <div>
              <label className="label" htmlFor="ac-email">Email Login</label>
              <input
                id="ac-email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={15} className="text-brand" aria-hidden /> Ganti Password
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="ac-new">Password Baru</label>
                <input
                  id="ac-new"
                  type="password"
                  className="input"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="Kosongkan jika tidak diganti"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="label" htmlFor="ac-confirm">Ulangi Password Baru</label>
                <input
                  id="ac-confirm"
                  type="password"
                  className="input"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <label className="label" htmlFor="ac-current">
              Password Saat Ini <span className="text-rose-400">*</span>
            </label>
            <input
              id="ac-current"
              type="password"
              className="input"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="Wajib diisi untuk menyimpan perubahan"
              autoComplete="current-password"
            />
          </div>

          {message && (
            <p
              role={message.type === "err" ? "alert" : "status"}
              className={`rounded-lg border px-4 py-3 text-sm ${
                message.type === "ok"
                  ? "border-brand/30 bg-brand/10 text-brand-soft"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
              }`}
            >
              {message.text}
            </p>
          )}

          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
