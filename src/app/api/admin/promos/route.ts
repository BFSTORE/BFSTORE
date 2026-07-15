import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

export async function POST(req: Request) {
  return withAdmin(async () => {
    const b = await req.json();
    if (!b.code?.trim() || !b.value) {
      return NextResponse.json({ error: "Kode dan nilai promo wajib diisi." }, { status: 400 });
    }
    const existing = await db.promoCode.findUnique({ where: { code: b.code.trim().toUpperCase() } });
    if (existing) return NextResponse.json({ error: "Kode promo sudah ada." }, { status: 409 });
    const promo = await db.promoCode.create({
      data: {
        code: b.code.trim().toUpperCase(),
        type: b.type === "FIXED" ? "FIXED" : "PERCENT",
        value: Number(b.value),
        maxDiscount: Number(b.maxDiscount ?? 0),
        minPurchase: Number(b.minPurchase ?? 0),
        usageLimit: Number(b.usageLimit ?? 0),
        expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
        isActive: b.isActive ?? true,
      },
    });
    return NextResponse.json(promo);
  });
}
