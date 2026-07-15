import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const b = await req.json();
    const flash = await db.flashSale.update({
      where: { id: Number(id) },
      data: {
        ...(b.flashPrice !== undefined && { flashPrice: Number(b.flashPrice) }),
        ...(b.startsAt !== undefined && { startsAt: new Date(b.startsAt) }),
        ...(b.endsAt !== undefined && { endsAt: new Date(b.endsAt) }),
        ...(b.isActive !== undefined && { isActive: b.isActive }),
      },
    });
    return NextResponse.json(flash);
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    await db.flashSale.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  });
}
