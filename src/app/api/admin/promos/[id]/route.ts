import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const b = await req.json();
    const promo = await db.promoCode.update({
      where: { id: Number(id) },
      data: {
        ...(b.code !== undefined && { code: String(b.code).trim().toUpperCase() }),
        ...(b.type !== undefined && { type: b.type }),
        ...(b.value !== undefined && { value: Number(b.value) }),
        ...(b.maxDiscount !== undefined && { maxDiscount: Number(b.maxDiscount) }),
        ...(b.minPurchase !== undefined && { minPurchase: Number(b.minPurchase) }),
        ...(b.usageLimit !== undefined && { usageLimit: Number(b.usageLimit) }),
        ...(b.expiresAt !== undefined && { expiresAt: b.expiresAt ? new Date(b.expiresAt) : null }),
        ...(b.isActive !== undefined && { isActive: b.isActive }),
      },
    });
    return NextResponse.json(promo);
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    await db.promoCode.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  });
}
