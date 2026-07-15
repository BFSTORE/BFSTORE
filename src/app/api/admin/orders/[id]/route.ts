import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";
import { createTopup } from "@/lib/digiflazz";
import { sendInvoiceEmail } from "@/lib/mailer";

/**
 * PATCH body:
 * - { status: "PAID" | "FAILED" | ... }  → ubah status manual
 * - { action: "process" }                → kirim top up ke Digiflazz
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const b = await req.json();
    const order = await db.order.findUnique({
      where: { id: Number(id) },
      include: { product: true },
    });
    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

    if (b.action === "process") {
      const sku = order.product?.sku;
      if (!sku) {
        return NextResponse.json(
          { error: "Produk ini belum punya SKU Digiflazz. Isi SKU produk atau proses manual." },
          { status: 400 }
        );
      }
      const result = await createTopup({
        refId: order.invoice,
        sku,
        customerNo: order.customerNo.replace(/[^\dA-Za-z()-]/g, ""),
      });
      const newStatus =
        result.status === "Sukses" ? "SUCCESS" : result.status === "Pending" ? "PROCESSING" : "FAILED";
      const updated = await db.order.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          digiRef: order.invoice,
          digiStatus: result.status,
          note: result.sn || result.message,
        },
      });
      if (newStatus === "SUCCESS") sendInvoiceEmail(updated, "success").catch(() => {});
      return NextResponse.json({ ok: true, order: updated, digiflazz: result });
    }

    if (b.status) {
      const updated = await db.order.update({
        where: { id: order.id },
        data: { status: String(b.status), ...(b.note !== undefined && { note: String(b.note) }) },
      });
      if (String(b.status) === "SUCCESS") sendInvoiceEmail(updated, "success").catch(() => {});
      return NextResponse.json({ ok: true, order: updated });
    }

    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  });
}
