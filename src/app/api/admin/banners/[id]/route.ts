import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const b = await req.json();
    const banner = await db.banner.update({
      where: { id: Number(id) },
      data: {
        ...(b.title !== undefined && { title: b.title }),
        ...(b.subtitle !== undefined && { subtitle: b.subtitle }),
        ...(b.image !== undefined && { image: b.image }),
        ...(b.link !== undefined && { link: b.link }),
        ...(b.isActive !== undefined && { isActive: b.isActive }),
        ...(b.sortOrder !== undefined && { sortOrder: Number(b.sortOrder) }),
      },
    });
    return NextResponse.json(banner);
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    await db.banner.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  });
}
