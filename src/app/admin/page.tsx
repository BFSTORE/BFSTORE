import Link from "next/link";
import { Gamepad2, ReceiptText, TicketPercent, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { formatIDR, ORDER_STATUS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [gameCount, orderCount, promoCount, revenueAgg, recentOrders] = await Promise.all([
    db.game.count(),
    db.order.count(),
    db.promoCode.count({ where: { isActive: true } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: "SUCCESS" } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const stats = [
    { icon: Gamepad2, label: "Total Game", value: String(gameCount), href: "/admin/games" },
    { icon: ReceiptText, label: "Total Pesanan", value: String(orderCount), href: "/admin/orders" },
    { icon: TicketPercent, label: "Promo Aktif", value: String(promoCount), href: "/admin/promos" },
    { icon: Wallet, label: "Omzet (Sukses)", value: formatIDR(revenueAgg._sum.total ?? 0), href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Ringkasan</h1>
      <p className="mt-1 text-sm text-muted">Pantau performa toko BFSTORE kamu.</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link key={label} href={href} className="card p-5 transition hover:border-brand/40">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
              <Icon size={18} className="text-brand" aria-hidden />
            </span>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
            <p className="mt-1 truncate text-xl font-bold tabular-nums">{value}</p>
          </Link>
        ))}
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-semibold">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand-soft hover:underline">
            Lihat semua
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted">Belum ada pesanan masuk.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-6 py-3 font-medium">Invoice</th>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-line/50 last:border-0">
                    <td className="px-6 py-3.5 font-medium">{o.invoice}</td>
                    <td className="px-6 py-3.5 text-muted">{o.gameName} — {o.productName}</td>
                    <td className="px-6 py-3.5 tabular-nums">{formatIDR(o.total)}</td>
                    <td className="px-6 py-3.5">
                      <span className="badge border border-line bg-surface-2 text-muted">
                        {(ORDER_STATUS[o.status] ?? ORDER_STATUS.PENDING).label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
