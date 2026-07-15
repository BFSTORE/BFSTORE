import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSnapToken, getMidtransConfig } from "@/lib/midtrans";

/** Ambil / buat token Snap untuk sebuah invoice. */
export async function POST(req: Request) {
  try {
    const { invoice } = await req.json();
    const order = await db.order.findUnique({ where: { invoice: String(invoice ?? "") } });
    if (!order) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });
    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "Pesanan ini tidak menunggu pembayaran." }, { status: 400 });
    }

    const cfg = await getMidtransConfig();
    if (!cfg.enabled) {
      return NextResponse.json({ error: "Pembayaran otomatis belum diaktifkan." }, { status: 400 });
    }

    let token = order.snapToken;
    if (!token) {
      token = await createSnapToken({
        invoice: order.invoice,
        total: order.total,
        gameName: order.gameName,
        productName: order.productName,
        contact: order.contact,
      });
      await db.order.update({ where: { id: order.id }, data: { snapToken: token } });
    }

    return NextResponse.json({ token, clientKey: cfg.clientKey, mode: cfg.mode });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
