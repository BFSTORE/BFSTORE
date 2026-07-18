"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import RecaptchaField, {
  getRecaptchaToken,
  resetRecaptcha,
  type RecaptchaConfig,
} from "@/components/Recaptcha";

export default function LoginForm({ rc }: { rc: RecaptchaConfig }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const recaptchaToken = await getRecaptchaToken(rc, "login");
    if (recaptchaToken === null) {
      return setError("Centang kotak “I'm not a robot” dulu ya.");
    }
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, recaptchaToken }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(data.role === "ADMIN" ? "/bfpanel" : "/");
      router.refresh();
    } else {
      setError(data.error ?? "Gagal masuk");
      resetRecaptcha();
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
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="!mb-0 label">Kata Sandi</label>
              <Link
                href="/lupa-password"
                className="text-xs font-medium text-brand-soft underline-offset-2 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
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

          <RecaptchaField rc={rc} />

          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button className="btn-primary w-full !py-3" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Masuk
          </button>

          <p className="text-center text-xs leading-relaxed text-muted">
            Dengan masuk, kamu menyetujui{" "}
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
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-brand-soft underline-offset-2 hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
