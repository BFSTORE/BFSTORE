"use client";

import { useState } from "react";
import { Loader2, PlugZap, Save, MailCheck } from "lucide-react";
import { Toggle } from "@/components/admin/ui";

export default function SettingsClient({ initial }: { initial: Record<string, string> }) {
  const [form, setForm] = useState({
    storeName: initial.storeName ?? "BFSTORE",
    storeTagline: initial.storeTagline ?? "",
    whatsapp: initial.whatsapp ?? "",
    markupPercent: initial.markupPercent ?? "5",
    digiflazzUsername: initial.digiflazzUsername ?? "",
    digiflazzApiKey: initial.digiflazzApiKey ?? "",
    digiflazzMode: initial.digiflazzMode ?? "dev",
    midtransServerKey: initial.midtransServerKey ?? "",
    midtransClientKey: initial.midtransClientKey ?? "",
    midtransMode: initial.midtransMode ?? "production",
    midtransEnabled: initial.midtransEnabled ?? "0",
    smtpUser: initial.smtpUser ?? "cs@bfstore.id",
    smtpPass: initial.smtpPass ?? "",
    emailEnabled: initial.emailEnabled ?? "0",
    recaptchaSiteKey: initial.recaptchaSiteKey ?? "",
    recaptchaSecretKey: initial.recaptchaSecretKey ?? "",
    recaptchaEnabled: initial.recaptchaEnabled ?? "0",
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function testEmail() {
    setTestingEmail(true);
    setMessage(null);
    // Simpan dulu supaya kredensial terbaru yang diuji
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const res = await fetch("/api/admin/email/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setTestingEmail(false);
    setMessage(
      res.ok
        ? { type: "ok", text: data.message }
        : { type: "err", text: data.error ?? "Gagal mengirim email tes." }
    );
  }

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setMessage(
      res.ok
        ? { type: "ok", text: "Pengaturan tersimpan." }
        : { type: "err", text: "Gagal menyimpan pengaturan." }
    );
  }

  async function testConnection() {
    setTesting(true);
    setMessage(null);
    // Simpan dulu supaya kredensial terbaru yang diuji
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const res = await fetch("/api/admin/digiflazz/brands");
    const data = await res.json();
    setTesting(false);
    if (res.ok) {
      setMessage({
        type: "ok",
        text: `Terhubung! ${data.total} produk tersedia. Contoh brand: ${data.brands.slice(0, 8).join(", ")}…`,
      });
    } else {
      setMessage({ type: "err", text: data.error ?? "Gagal terhubung ke Digiflazz." });
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Pengaturan</h1>
      <p className="mt-1 text-sm text-muted">Identitas toko dan integrasi Digiflazz.</p>

      <section className="card mt-7 p-6" aria-labelledby="s-store">
        <h2 id="s-store" className="font-semibold">Identitas Toko</h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="st-name">Nama Toko</label>
              <input id="st-name" className="input" value={form.storeName} onChange={(e) => set("storeName", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-wa">No. WhatsApp CS</label>
              <input
                id="st-wa"
                className="input"
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="628123456789"
                inputMode="tel"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="st-tag">Tagline</label>
            <input id="st-tag" className="input" value={form.storeTagline} onChange={(e) => set("storeTagline", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="card mt-5 p-6" aria-labelledby="s-digi">
        <h2 id="s-digi" className="font-semibold">Integrasi Digiflazz</h2>
        <p className="mt-1 text-sm text-muted">
          Ambil kredensial di{" "}
          <a
            href="https://member.digiflazz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-soft underline-offset-2 hover:underline"
          >
            member.digiflazz.com
          </a>{" "}
          → Atur Koneksi → API.
        </p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="df-user">Username</label>
              <input id="df-user" className="input" value={form.digiflazzUsername} onChange={(e) => set("digiflazzUsername", e.target.value)} autoComplete="off" />
            </div>
            <div>
              <label className="label" htmlFor="df-key">API Key</label>
              <input
                id="df-key"
                type="password"
                className="input"
                value={form.digiflazzApiKey}
                onChange={(e) => set("digiflazzApiKey", e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="df-mode">Mode</label>
              <select id="df-mode" className="input" value={form.digiflazzMode} onChange={(e) => set("digiflazzMode", e.target.value)}>
                <option value="dev">Development (testing, tidak memotong saldo)</option>
                <option value="prod">Production (transaksi sungguhan)</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="df-markup">Markup Harga Jual (%)</label>
              <input
                id="df-markup"
                type="number"
                className="input"
                value={form.markupPercent}
                onChange={(e) => set("markupPercent", e.target.value)}
              />
              <p className="mt-1.5 text-xs text-muted">Dipakai saat Sync: harga jual = modal + markup.</p>
            </div>
          </div>
          <button onClick={testConnection} disabled={testing} className="btn-ghost">
            {testing ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <PlugZap size={15} aria-hidden />}
            Uji Koneksi Digiflazz
          </button>
        </div>
      </section>

      <section className="card mt-5 p-6" aria-labelledby="s-midtrans">
        <div className="flex items-center justify-between gap-3">
          <h2 id="s-midtrans" className="font-semibold">Pembayaran Midtrans</h2>
          <Toggle
            checked={form.midtransEnabled === "1"}
            onChange={(v) => set("midtransEnabled", v ? "1" : "0")}
            label="Aktif"
          />
        </div>
        <p className="mt-1 text-sm text-muted">
          Saat aktif, tombol &quot;Bayar Sekarang&quot; (QRIS/VA/e-wallet) muncul di halaman invoice.
        </p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="mt-server">Server Key</label>
              <input
                id="mt-server"
                type="password"
                className="input"
                value={form.midtransServerKey}
                onChange={(e) => set("midtransServerKey", e.target.value)}
                placeholder="Mid-server-…"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="label" htmlFor="mt-client">Client Key</label>
              <input
                id="mt-client"
                className="input"
                value={form.midtransClientKey}
                onChange={(e) => set("midtransClientKey", e.target.value)}
                placeholder="Mid-client-…"
                autoComplete="off"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="mt-mode">Mode</label>
            <select id="mt-mode" className="input" value={form.midtransMode} onChange={(e) => set("midtransMode", e.target.value)}>
              <option value="production">Production (kunci Mid-…, pembayaran sungguhan)</option>
              <option value="sandbox">Sandbox (kunci SB-Mid-…, untuk uji coba)</option>
            </select>
          </div>
          <p className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs leading-relaxed text-muted">
            Jangan lupa atur <b className="text-ink">Payment Notification URL</b> di dashboard Midtrans
            (Settings → Configuration) ke{" "}
            <code className="text-brand-soft">https://domainkamu.com/api/midtrans/notify</code> supaya
            status pesanan ter-update otomatis setelah dibayar.
          </p>
        </div>
      </section>

      <section className="card mt-5 p-6" aria-labelledby="s-email">
        <div className="flex items-center justify-between gap-3">
          <h2 id="s-email" className="font-semibold">Email Invoice (Gmail)</h2>
          <Toggle
            checked={form.emailEnabled === "1"}
            onChange={(v) => set("emailEnabled", v ? "1" : "0")}
            label="Aktif"
          />
        </div>
        <p className="mt-1 text-sm text-muted">
          Invoice dikirim otomatis ke email pelanggan saat pesanan dibuat dan saat top up berhasil.
        </p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="em-user">Alamat Gmail Pengirim</label>
              <input
                id="em-user"
                type="email"
                className="input"
                value={form.smtpUser}
                onChange={(e) => set("smtpUser", e.target.value)}
                placeholder="cs@bfstore.id"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="label" htmlFor="em-pass">App Password Google</label>
              <input
                id="em-pass"
                type="password"
                className="input"
                value={form.smtpPass}
                onChange={(e) => set("smtpPass", e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
                autoComplete="off"
              />
            </div>
          </div>
          <p className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs leading-relaxed text-muted">
            Ini <b className="text-ink">bukan</b> password Gmail biasa. Buat App Password di{" "}
            <a
              href="https://myaccount.google.com/apppasswords"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-soft underline-offset-2 hover:underline"
            >
              myaccount.google.com/apppasswords
            </a>{" "}
            (akun Gmail harus mengaktifkan verifikasi 2 langkah dulu).{" "}
            <b className="text-ink">Penting:</b> Alamat Gmail Pengirim harus akun Google yang{" "}
            <b className="text-ink">sama</b> dengan yang membuat App Password.
          </p>
          <button onClick={testEmail} disabled={testingEmail} className="btn-ghost">
            {testingEmail ? (
              <Loader2 size={15} className="animate-spin" aria-hidden />
            ) : (
              <MailCheck size={15} aria-hidden />
            )}
            Tes Kirim Email
          </button>
        </div>
      </section>

      <section className="card mt-5 p-6" aria-labelledby="s-recaptcha">
        <div className="flex items-center justify-between gap-3">
          <h2 id="s-recaptcha" className="font-semibold">reCAPTCHA (Anti-Bot)</h2>
          <Toggle
            checked={form.recaptchaEnabled === "1"}
            onChange={(v) => set("recaptchaEnabled", v ? "1" : "0")}
            label="Aktif"
          />
        </div>
        <p className="mt-1 text-sm text-muted">
          Melindungi halaman masuk, daftar, dan lupa kata sandi dari bot. Kelola kunci di{" "}
          <a
            href="https://www.google.com/recaptcha/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-soft underline-offset-2 hover:underline"
          >
            google.com/recaptcha/admin
          </a>{" "}
          (pilih tipe v2 &quot;I&apos;m not a robot&quot; Checkbox).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="rc-site">Site Key</label>
            <input
              id="rc-site"
              className="input"
              value={form.recaptchaSiteKey}
              onChange={(e) => set("recaptchaSiteKey", e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="label" htmlFor="rc-secret">Secret Key</label>
            <input
              id="rc-secret"
              type="password"
              className="input"
              value={form.recaptchaSecretKey}
              onChange={(e) => set("recaptchaSecretKey", e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </section>

      {message && (
        <p
          role="status"
          className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
            message.type === "ok"
              ? "border-brand/30 bg-brand/10 text-brand-soft"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-6">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}
