"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) return setError("Kata sandi minimal 6 karakter.");
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError(data.error ?? "Gagal mendaftar");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Daftar Akun</h1>
        <p className="mt-1.5 text-sm text-muted">
          Simpan riwayat transaksi dan dapatkan promo khusus member.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="name" className="label">Nama</label>
            <input
              id="name"
              autoComplete="name"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Kata Sandi</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <p className="mt-1.5 text-xs text-muted">Minimal 6 karakter.</p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button className="btn-primary w-full !py-3" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Daftar
          </button>

          <p className="text-center text-xs leading-relaxed text-muted">
            Dengan mendaftar, kamu menyetujui{" "}
            <Link
              href="/syarat-ketentuan"
              className="font-semibold text-brand-soft underline-offset-2 hover:underline"
            >
              Syarat & Ketentuan
            </Link>{" "}
            BFSTORE.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-brand-soft underline-offset-2 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
