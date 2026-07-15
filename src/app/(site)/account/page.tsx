import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatIDR, ORDER_STATUS } from "@/lib/utils";

export const dynamic = "force-dynamic";

const toneClass: Record<string, string> = {
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  emerald: "border-brand/30 bg-brand/10 text-brand-soft",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await db.order.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10">
      <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
      <p className="mt-1 text-sm text-muted">Halo, {session.name}! Berikut transaksi terakhirmu.</p>

      {orders.length === 0 ? (
        <div className="card mt-8 px-6 py-16 text-center">
          <p className="font-semibold">Belum ada transaksi</p>
          <p className="mt-1 text-sm text-muted">Yuk mulai top up game favoritmu!</p>
          <Link href="/" className="btn-primary mt-5">Lihat Game</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((o) => {
            const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.PENDING;
            return (
              <Link
                key={o.id}
                href={`/invoice/${o.invoice}`}
                className="card flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:border-brand/40"
              >
                <div>
                  <p className="text-sm font-semibold">{o.gameName} — {o.productName}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {o.invoice} · {new Date(o.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tabular-nums">{formatIDR(o.total)}</span>
                  <span className={`badge border ${toneClass[st.tone]}`}>{st.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
