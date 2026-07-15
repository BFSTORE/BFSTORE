import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const b = await req.json();
    const game = await db.game.update({
      where: { id: Number(id) },
      data: {
        ...(b.name !== undefined && { name: b.name }),
        ...(b.slug !== undefined && { slug: b.slug }),
        ...(b.publisher !== undefined && { publisher: b.publisher }),
        ...(b.image !== undefined && { image: b.image }),
        ...(b.digiBrand !== undefined && { digiBrand: b.digiBrand }),
        ...(b.fieldLabel !== undefined && { fieldLabel: b.fieldLabel }),
        ...(b.fieldLabel2 !== undefined && { fieldLabel2: b.fieldLabel2 }),
        ...(b.instructions !== undefined && { instructions: b.instructions }),
        ...(b.isActive !== undefined && { isActive: b.isActive }),
        ...(b.isPopular !== undefined && { isPopular: b.isPopular }),
        ...(b.sortOrder !== undefined && { sortOrder: b.sortOrder }),
      },
    });
    return NextResponse.json(game);
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    await db.game.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  });
}
