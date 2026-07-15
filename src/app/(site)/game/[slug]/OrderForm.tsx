"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TicketPercent, CheckCircle2, XCircle, Zap } from "lucide-react";
import { formatIDR } from "@/lib/utils";

type Game = { id: number; name: string; fieldLabel: string; fieldLabel2: string };
type Product = { id: number; name: string; price: number; original: number; isFlash: boolean };

export default function OrderForm({ game, products }: { game: Game; products: Product[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState<number | null>(null);
  const [customerNo, setCustomerNo] = useState("");
  const [customerNo2, setCustomerNo2] = useState("");
  const [contact, setContact] = useState("");
  const [promo, setPromo] = useState("");
  const [promoState, setPromoState] = useState<{
    status: "idle" | "checking" | "valid" | "invalid";
    discount: number;
    message: string;
  }>({ status: "idle", discount: 0, message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const product = useMemo(() => products.find((p) => p.id === productId) ?? null, [productId, products]);
  const discount = promoState.status === "valid" ? promoState.discount : 0;
  const total = product ? Math.max(product.price - discount, 0) : 0;

  async function checkPromo() {
    if (!promo.trim() || !product) return;
    setPromoState({ status: "checking", discount: 0, message: "" });
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promo.trim(), amount: product.price }),
      });
      const data = await res.json();
      if (res.ok) {
        setPromoState({ status: "valid", discount: data.discount, message: data.message });
      } else {
        setPromoState({ status: "invalid", discount: 0, message: data.error });
      }
    } catch {
      setPromoState({ status: "invalid", discount: 0, message: "Gagal memeriksa kode promo" });
    }
  }

  async function submit() {
    setError("");
    if (!product) return setError("Pilih nominal top up dulu ya.");
    if (!customerNo.trim()) return setError(`${game.fieldLabel} wajib diisi.`);
    if (game.fieldLabel2 && !customerNo2.trim()) return setError(`${game.fieldLabel2} wajib diisi.`);
    if (!contact.trim()) return setError("Nomor WhatsApp / email wajib diisi untuk konfirmasi.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          productId: product.id,
          customerNo: game.fieldLabel2
            ? `${customerNo.trim()} (${customerNo2.trim()})`
            : customerNo.trim(),
          contact: contact.trim(),
          promoCode: promoState.status === "valid" ? promo.trim() : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat pesanan");
      router.push(`/invoice/${data.invoice}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setSubmitting(false);
    }
  }

  const steps = [
    { n: 1, title: `Masukkan ${game.fieldLabel}` },
    { n: 2, title: "Pilih Nominal" },
    { n: 3, title: "Kode Promo & Kontak" },
  ];

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {/* Step 1: ID */}
        <section className="card p-6" aria-labelledby="step-1">
          <h2 id="step-1" className="mb-4 flex items-center gap-3 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand-soft">1</span>
            {steps[0].title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="customer-no" className="label">{game.fieldLabel} <span className="text-rose-400">*</span></label>
              <input
                id="customer-no"
                className="input"
                value={customerNo}
                onChange={(e) => setCustomerNo(e.target.value)}
                placeholder={`Masukkan ${game.fieldLabel}`}
                inputMode="text"
              />
            </div>
            {game.fieldLabel2 && (
              <div>
                <label htmlFor="customer-no2" className="label">{game.fieldLabel2} <span className="text-rose-400">*</span></label>
                <input
                  id="customer-no2"
                  className="input"
                  value={customerNo2}
                  onChange={(e) => setCustomerNo2(e.target.value)}
                  placeholder={`Masukkan ${game.fieldLabel2}`}
                />
              </div>
            )}
          </div>
        </section>

        {/* Step 2: Nominal */}
        <section className="card p-6" aria-labelledby="step-2">
          <h2 id="step-2" className="mb-4 flex items-center gap-3 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand-soft">2</span>
            {steps[1].title}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Pilihan nominal">
            {products.map((p) => (
              <button
                key={p.id}
                role="radio"
                aria-checked={productId === p.id}
                onClick={() => setProductId(p.id)}
                className={`relative cursor-pointer rounded-xl border p-4 text-left transition ${
                  productId === p.id
                    ? "border-brand bg-brand/10 ring-2 ring-brand/30"
                    : "border-line bg-surface-2 hover:border-brand/40"
                }`}
              >
                {p.isFlash && (
                  <span className="absolute -top-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                    <Zap size={10} aria-hidden /> FLASH SALE
                  </span>
                )}
                <p className="text-sm font-semibold leading-snug">{p.name}</p>
                {p.isFlash && (
                  <p className="mt-1 text-xs tabular-nums text-muted line-through">{formatIDR(p.original)}</p>
                )}
                <p className={`mt-1 text-sm font-bold tabular-nums ${p.isFlash ? "text-amber-300" : productId === p.id ? "text-brand-soft" : "text-muted"}`}>
                  {formatIDR(p.price)}
                </p>
              </button>
            ))}
          </div>
          {products.length === 0 && (
            <p className="text-sm text-muted">Belum ada produk untuk game ini.</p>
          )}
        </section>

        {/* Step 3: Promo & kontak */}
        <section className="card p-6" aria-labelledby="step-3">
          <h2 id="step-3" className="mb-4 flex items-center gap-3 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand-soft">3</span>
            {steps[2].title}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="promo" className="label">Kode Promo (opsional)</label>
              <div className="flex gap-2">
                <input
                  id="promo"
                  className="input flex-1 uppercase"
                  value={promo}
                  onChange={(e) => {
                    setPromo(e.target.value.toUpperCase());
                    setPromoState({ status: "idle", discount: 0, message: "" });
                  }}
                  placeholder="Contoh: BFSTORE10"
                />
                <button
                  onClick={checkPromo}
                  disabled={!promo.trim() || !product || promoState.status === "checking"}
                  className="btn-ghost whitespace-nowrap"
                >
                  {promoState.status === "checking" ? (
                    <Loader2 size={15} className="animate-spin" aria-hidden />
                  ) : (
                    <TicketPercent size={15} aria-hidden />
                  )}
                  Pakai
                </button>
              </div>
              {!product && promo.trim() && (
                <p className="mt-1.5 text-xs text-muted">Pilih nominal dulu sebelum memakai kode promo.</p>
              )}
              {promoState.status === "valid" && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-soft" role="status">
                  <CheckCircle2 size={13} aria-hidden /> {promoState.message}
                </p>
              )}
              {promoState.status === "invalid" && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-400" role="alert">
                  <XCircle size={13} aria-hidden /> {promoState.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="contact" className="label">No. WhatsApp / Email <span className="text-rose-400">*</span></label>
              <input
                id="contact"
                className="input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Untuk konfirmasi pesanan"
                inputMode="email"
              />
              <p className="mt-1.5 text-xs text-muted">Bukti transaksi akan dikirim ke kontak ini.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Ringkasan */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <h2 className="font-semibold">Ringkasan Pesanan</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Game</dt>
              <dd className="text-right font-medium">{game.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Item</dt>
              <dd className="text-right font-medium">{product ? product.name : "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Harga</dt>
              <dd className="text-right font-medium tabular-nums">{product ? formatIDR(product.price) : "—"}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between gap-4 text-brand-soft">
                <dt>Diskon promo</dt>
                <dd className="text-right font-medium tabular-nums">−{formatIDR(discount)}</dd>
              </div>
            )}
            <div className="border-t border-line pt-3">
              <div className="flex justify-between gap-4">
                <dt className="font-semibold">Total Bayar</dt>
                <dd className="text-right text-lg font-bold tabular-nums text-brand-soft">
                  {product ? formatIDR(total) : "—"}
                </dd>
              </div>
            </div>
          </dl>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-medium text-rose-300">
              {error}
            </p>
          )}

          <button onClick={submit} disabled={submitting} className="btn-primary mt-5 w-full !py-3">
            {submitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
            {submitting ? "Memproses…" : "Pesan Sekarang"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Dengan memesan kamu menyetujui syarat & ketentuan BFSTORE.
          </p>
        </div>
      </aside>
    </div>
  );
}
