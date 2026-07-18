import { Users } from "lucide-react";
import { db } from "@/lib/db";
import { formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { total: true, status: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Data Pelanggan</h1>
      <p className="mt-1 text-sm text-muted">
        Semua pelanggan yang mendaftar di website — total {customers.length} akun.
      </p>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Pelanggan</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Terdaftar</th>
                <th className="px-5 py-3 font-medium">Transaksi</th>
                <th className="px-5 py-3 font-medium">Total Belanja (Sukses)</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const success = c.orders.filter((o) => o.status === "SUCCESS");
                const spent = success.reduce((sum, o) => sum + o.total, 0);
                return (
                  <tr key={c.id} className="border-b border-line/50 last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand-soft">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{c.email}</td>
                    <td className="px-5 py-3.5 text-muted">
                      {new Date(c.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 tabular-nums">
                      {c.orders.length}
                      <span className="text-muted"> ({success.length} sukses)</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums">{formatIDR(spent)}</td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-muted">
                    <Users size={28} className="mx-auto mb-3 text-muted/50" aria-hidden />
                    Belum ada pelanggan yang mendaftar.
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
