import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeDiscount } from "@/lib/promo";
import { effectivePrice } from "@/lib/flashsale";
import { sendInvoiceEmail } from "@/lib/mailer";
import { makeInvoice } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json();
  const { gameId, productId, customerNo, contact, promoCode } = body;

  if (!gameId || !productId || !customerNo?.trim() || !contact?.trim()) {
    return NextResponse.json({ error: "Data pesanan tidak lengkap." }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id: Number(productId) },
    include: { game: true, flashSale: true },
  });
  if (!product || !product.isActive || product.gameId !== Number(gameId) || !product.game.isActive) {
    return NextResponse.json({ error: "Produk tidak tersedia." }, { status: 400 });
  }

  // Harga flash sale dihitung ulang di server supaya tidak bisa dimanipulasi klien
  const { price: unitPrice } = effectivePrice(product, product.flashSale);

  let discount = 0;
  let appliedCode = "";
  if (promoCode?.trim()) {
    const result = await computeDiscount(String(promoCode), unitPrice);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    discount = result.discount;
    appliedCode = result.promo.code;
    await db.promoCode.update({
      where: { id: result.promo.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  const session = await getSession();
  const order = await db.order.create({
    data: {
      invoice: makeInvoice(),
      userId: session?.uid ?? null,
      gameId: product.gameId,
      productId: product.id,
      gameName: product.game.name,
      productName: product.name,
      customerNo: String(customerNo).trim(),
      contact: String(contact).trim(),
      amount: unitPrice,
      discount,
      total: Math.max(unitPrice - discount, 0),
      promoCode: appliedCode,
    },
  });

  // Email invoice dikirim di latar; kegagalan email tidak menggagalkan pesanan
  sendInvoiceEmail(order, "created").catch(() => {});

  return NextResponse.json({ ok: true, invoice: order.invoice });
}
