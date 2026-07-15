import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const b = await req.json();
    const product = await db.product.update({
      where: { id: Number(id) },
      data: {
        ...(b.name !== undefined && { name: b.name }),
        ...(b.sku !== undefined && { sku: b.sku }),
        ...(b.basePrice !== undefined && { basePrice: Number(b.basePrice) }),
        ...(b.price !== undefined && { price: Number(b.price) }),
        ...(b.isActive !== undefined && { isActive: b.isActive }),
        ...(b.sortOrder !== undefined && { sortOrder: Number(b.sortOrder) }),
      },
    });
    return NextResponse.json(product);
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    await db.product.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  });
}
