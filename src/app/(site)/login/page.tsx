"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(data.role === "ADMIN" ? "/admin" : "/");
      router.refresh();
    } else {
      setError(data.error ?? "Gagal masuk");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Masuk</h1>
        <p className="mt-1.5 text-sm text-muted">Selamat datang kembali di BFSTORE.</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Kata Sandi</label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                className="input !pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted transition hover:text-ink"
              >
                {showPass ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button className="btn-primary w-full !py-3" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Masuk
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-brand-soft underline-offset-2 hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
