import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, Mail, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getMidtransConfig } from "@/lib/midtrans";
import { formatIDR, ORDER_STATUS } from "@/lib/utils";
import PayButton from "./PayButton";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ invoice: string }> }) {
  const { invoice } = await params;
  const order = await db.order.findUnique({ where: { invoice } });
  if (!order) notFound();
  const [settings, midtrans] = await Promise.all([getSettings(), getMidtransConfig()]);
  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.PENDING;

  const csEmail = settings.smtpUser?.trim() || "cs@bfstore.id";
  const mailSubject = encodeURIComponent(`Konfirmasi Pembayaran — Invoice ${order.invoice}`);
  const mailBody = encodeURIComponent(
    `Halo BFSTORE,\n\nSaya mau konfirmasi pembayaran untuk pesanan berikut:\n\nInvoice: ${order.invoice}\nItem: ${order.gameName} — ${order.productName}\nTotal: ${formatIDR(order.total)}\n\nBukti pembayaran saya lampirkan di email ini.\nTerima kasih!`
  );
  const mailLink = `mailto:${csEmail}?subject=${mailSubject}&body=${mailBody}`;
  const waText = encodeURIComponent(
    `[MENDESAK] Halo BFSTORE, saya butuh bantuan untuk invoice ${order.invoice}.`
  );
  const waLink = `https://wa.me/${settings.whatsapp ?? ""}?text=${waText}`;

  const StatusIcon =
    order.status === "SUCCESS" ? CheckCircle2 : order.status === "FAILED" ? XCircle : Clock;
  const tone =
    order.status === "SUCCESS"
      ? "text-brand-soft border-brand/30 bg-brand/10"
      : order.status === "FAILED"
        ? "text-rose-300 border-rose-500/30 bg-rose-500/10"
        : "text-amber-300 border-amber-500/30 bg-amber-500/10";

  return (
    <div className="mx-auto max-w-2xl px-4 pt-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink">
        <ArrowLeft size={15} aria-hidden /> Kembali ke beranda
      </Link>

      <div className="card overflow-hidden">
        <div className="border-b border-line bg-surface-2 px-6 py-5">
          <p className="text-xs uppercase tracking-wider text-muted">Invoice</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-heading text-xl font-bold tracking-tight">{order.invoice}</h1>
            <span className={`badge border ${tone}`}>
              <StatusIcon size={13} aria-hidden /> {status.label}
            </span>
          </div>
        </div>

        <dl className="space-y-3 px-6 py-6 text-sm">
          {[
            ["Game", order.gameName],
            ["Item", order.productName],
            ["ID Tujuan", order.customerNo],
            ["Kontak", order.contact],
            ["Tanggal", new Date(order.createdAt).toLocaleString("id-ID")],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Harga</dt>
            <dd className="text-right font-medium tabular-nums">{formatIDR(order.amount)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between gap-4 text-brand-soft">
              <dt>Diskon ({order.promoCode})</dt>
              <dd className="text-right font-medium tabular-nums">−{formatIDR(order.discount)}</dd>
            </div>
          )}
          <div className="border-t border-line pt-3">
            <div className="flex justify-between gap-4">
              <dt className="font-semibold">Total Bayar</dt>
              <dd className="text-lg font-bold tabular-nums text-brand-soft">{formatIDR(order.total)}</dd>
            </div>
          </div>
        </dl>

        {order.status === "PENDING" && (
          <div className="border-t border-line bg-surface-2/50 px-6 py-5">
            <p className="text-sm font-semibold">Cara Pembayaran</p>
            {midtrans.enabled ? (
              <>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Bayar otomatis lewat QRIS, virtual account, atau e-wallet. Pesanan langsung
                  diproses begitu pembayaran diterima.
                </p>
                <div className="mt-4">
                  <PayButton invoice={order.invoice} />
                </div>
                <a href={mailLink} className="btn-ghost mt-3 w-full !py-3">
                  <Mail size={16} aria-hidden /> Bantuan via Email CS
                </a>
              </>
            ) : (
              <>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Pembayaran otomatis sedang disiapkan. Untuk saat ini, silakan konfirmasi
                  pembayaran melalui email CS — lampirkan bukti transfer, pesanan diproses begitu
                  pembayaran diterima.
                </p>
                <a href={mailLink} className="btn-primary mt-4 w-full !py-3">
                  <Mail size={16} aria-hidden /> Konfirmasi via Email
                </a>
              </>
            )}
            <p className="mt-3 text-center text-xs text-muted">
              Kendala mendesak (pembayaran terpotong tapi pesanan gagal)?{" "}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-soft underline-offset-2 hover:underline"
              >
                WhatsApp CS
              </a>
            </p>
          </div>
        )}

        {order.status === "SUCCESS" && order.note && (
          <div className="border-t border-line px-6 py-4 text-sm text-muted">SN/Ref: {order.note}</div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-muted">
        Simpan nomor invoice ini untuk melacak status pesananmu di menu{" "}
        <Link href="/cek-transaksi" className="text-brand-soft underline-offset-2 hover:underline">
          Cek Transaksi
        </Link>
        .
      </p>
    </div>
  );
}
