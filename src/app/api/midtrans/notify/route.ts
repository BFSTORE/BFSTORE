import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMidtransConfig, verifySignature } from "@/lib/midtrans";
import { createTopup } from "@/lib/digiflazz";
import { sendInvoiceEmail } from "@/lib/mailer";

/**
 * Webhook notifikasi pembayaran Midtrans.
 * Atur URL-nya di dashboard Midtrans: Settings → Configuration →
 * Payment Notification URL = https://domainkamu.com/api/midtrans/notify
 */
export async function POST(req: Request) {
  const body = await req.json();
  const cfg = await getMidtransConfig();

  const ok = verifySignature({
    orderId: String(body.order_id ?? ""),
    statusCode: String(body.status_code ?? ""),
    grossAmount: String(body.gross_amount ?? ""),
    serverKey: cfg.serverKey,
    signatureKey: String(body.signature_key ?? ""),
  });
  if (!ok) return NextResponse.json({ error: "Signature tidak valid." }, { status: 403 });

  const order = await db.order.findUnique({
    where: { invoice: String(body.order_id) },
    include: { product: true },
  });
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });

  const tx = String(body.transaction_status ?? "");
  const fraud = String(body.fraud_status ?? "accept");

  if ((tx === "settlement" || tx === "capture") && fraud === "accept") {
    if (order.status === "PENDING") {
      let newStatus = "PAID";
      let note = order.note;
      let digiStatus = order.digiStatus;

      // Otomatis proses top up via Digiflazz bila produk punya SKU
      if (order.product?.sku) {
        try {
          const result = await createTopup({
            refId: order.invoice,
            sku: order.product.sku,
            customerNo: order.customerNo.replace(/[^\dA-Za-z()-]/g, ""),
          });
          digiStatus = result.status;
          note = result.sn || result.message;
          newStatus =
            result.status === "Sukses" ? "SUCCESS" : result.status === "Pending" ? "PROCESSING" : "PAID";
        } catch {
          // Biarkan status PAID; admin bisa proses manual dari dashboard
        }
      }

      const updated = await db.order.update({
        where: { id: order.id },
        data: { status: newStatus, digiStatus, note, digiRef: order.invoice },
      });

      // Kirim email tanpa memblokir respons webhook
      sendInvoiceEmail(updated, newStatus === "SUCCESS" ? "success" : "created").catch(() => {});
    }
  } else if (tx === "expire" || tx === "cancel" || tx === "deny") {
    if (order.status === "PENDING") {
      await db.order.update({
        where: { id: order.id },
        data: { status: "FAILED", note: `Pembayaran ${tx}` },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
