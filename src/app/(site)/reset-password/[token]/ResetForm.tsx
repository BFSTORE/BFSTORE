"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";

export default function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return setError("Kata sandi minimal 6 karakter.");
    if (password !== confirm) return setError("Konfirmasi kata sandi tidak cocok.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi ya.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 pt-16">
        <div className="card p-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
            <CheckCircle2 size={24} className="text-brand-soft" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Kata Sandi Diperbarui!</h1>
          <p className="mt-2 text-sm text-muted">
            Kamu akan diarahkan ke halaman masuk… atau{" "}
            <Link href="/login" className="font-semibold text-brand-soft underline-offset-2 hover:underline">
              klik di sini
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-16">
      <div className="card p-8">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
          <KeyRound size={20} className="text-brand" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Buat Kata Sandi Baru</h1>
        <p className="mt-1.5 text-sm text-muted">
          Masukkan kata sandi baru untuk akun BFSTORE kamu.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="label">Kata Sandi Baru</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="mt-1.5 text-xs text-muted">Minimal 6 karakter.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="label">Ulangi Kata Sandi</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button className="btn-primary w-full !py-3" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Simpan Kata Sandi Baru
          </button>
        </form>
      </div>
    </div>
  );
}
