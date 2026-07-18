"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailQuestion } from "lucide-react";
import RecaptchaNotice, { executeRecaptcha } from "@/components/Recaptcha";

export default function ForgotForm({ siteKey }: { siteKey: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const recaptchaToken = await executeRecaptcha(siteKey, "forgot_password");
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-16">
      <div className="card p-8">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
          <MailQuestion size={20} className="text-brand" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Lupa Kata Sandi?</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Masukkan email akunmu. Kami akan mengirim tautan untuk membuat kata sandi baru.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
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

          {message && (
            <p role="status" className="rounded-lg border border-brand/30 bg-brand/10 px-3 py-2.5 text-sm leading-relaxed text-brand-soft">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button className="btn-primary w-full !py-3" disabled={loading || !email.trim()}>
            {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Kirim Tautan Reset
          </button>

          <RecaptchaNotice siteKey={siteKey} />
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Ingat kata sandimu?{" "}
          <Link href="/login" className="font-semibold text-brand-soft underline-offset-2 hover:underline">
            Kembali masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
