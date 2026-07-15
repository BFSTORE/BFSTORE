"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, Check, X } from "lucide-react";
import { formatIDR, ORDER_STATUS } from "@/lib/utils";

type Order = {
  id: number;
  invoice: string;
  gameName: string;
  productName: string;
  customerNo: string;
  contact: string;
  total: number;
  promoCode: string;
  status: string;
  note: string;
  hasSku: boolean;
  createdAt: string;
};

const FILTERS = ["SEMUA", "PENDING", "PAID", "PROCESSING", "SUCCESS", "FAILED"] as const;

const toneClass: Record<string, string> = {
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  emerald: "border-brand/30 bg-brand/10 text-brand-soft",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("SEMUA");
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const filtered = useMemo(
    () => (filter === "SEMUA" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  async function update(o: Order, body: Record<string, unknown>, okText: string) {
    setBusy(o.id);
    setMessage(null);
    const res = await fetch(`/api/admin/orders/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) return setMessage({ type: "err", text: data.error ?? "Gagal memproses" });
    setMessage({
      type: "ok",
      text: body.action === "process" ? `Digiflazz: ${data.digiflazz?.status} — ${data.digiflazz?.message}` : okText,
    });
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Pesanan</h1>
      <p className="mt-1 text-sm text-muted">
        Tandai pesanan yang sudah dibayar, lalu proses top up otomatis via Digiflazz.
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter status">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              filter === f
                ? "bg-brand text-[#052e16]"
                : "border border-line bg-surface-2 text-muted hover:text-ink"
            }`}
          >
            {f === "SEMUA" ? "Semua" : (ORDER_STATUS[f]?.label ?? f)}
          </button>
        ))}
      </div>

      {message && (
        <p
          role="status"
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            message.type === "ok"
              ? "border-brand/30 bg-brand/10 text-brand-soft"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="card mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-5 py-3 font-medium">ID Tujuan</th>
                <th className="px-5 py-3 font-medium">Kontak</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.PENDING;
                return (
                  <tr key={o.id} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{o.invoice}</p>
                      <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString("id-ID")}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {o.gameName} — {o.productName}
                      {o.promoCode && <p className="text-xs text-brand-soft">Promo: {o.promoCode}</p>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">{o.customerNo}</td>
                    <td className="px-5 py-3.5 text-muted">{o.contact}</td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums">{formatIDR(o.total)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge border ${toneClass[st.tone]}`}>{st.label}</span>
                      {o.note && <p className="mt-1 max-w-40 truncate text-xs text-muted" title={o.note}>{o.note}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        {o.status === "PENDING" && (
                          <button
                            onClick={() => update(o, { status: "PAID" }, "Pesanan ditandai sudah dibayar.")}
                            disabled={busy === o.id}
                            className="btn-ghost !px-3 !py-1.5 !text-xs"
                            title="Tandai sudah dibayar"
                          >
                            <Check size={13} aria-hidden /> Dibayar
                          </button>
                        )}
                        {(o.status === "PAID" || o.status === "PROCESSING") && (
                          <button
                            onClick={() => update(o, { action: "process" }, "")}
                            disabled={busy === o.id || !o.hasSku}
                            className="btn-primary !px-3 !py-1.5 !text-xs"
                            title={o.hasSku ? "Kirim top up via Digiflazz" : "Produk belum punya SKU Digiflazz"}
                          >
                            {busy === o.id ? (
                              <Loader2 size={13} className="animate-spin" aria-hidden />
                            ) : (
                              <Zap size={13} aria-hidden />
                            )}
                            Proses
                          </button>
                        )}
                        {(o.status === "PAID" || o.status === "PROCESSING") && (
                          <button
                            onClick={() => update(o, { status: "SUCCESS" }, "Pesanan ditandai sukses (manual).")}
                            disabled={busy === o.id}
                            className="btn-ghost !px-3 !py-1.5 !text-xs"
                            title="Tandai sukses tanpa Digiflazz"
                          >
                            <Check size={13} aria-hidden /> Sukses
                          </button>
                        )}
                        {o.status !== "SUCCESS" && o.status !== "FAILED" && (
                          <button
                            onClick={() => update(o, { status: "FAILED" }, "Pesanan dibatalkan.")}
                            disabled={busy === o.id}
                            className="btn-danger !px-3 !py-1.5 !text-xs"
                            title="Batalkan pesanan"
                          >
                            <X size={13} aria-hidden />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    Tidak ada pesanan dengan status ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
