import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

export async function POST(req: Request) {
  return withAdmin(async () => {
    const b = await req.json();
    if (!b.title?.trim() || !b.image?.trim()) {
      return NextResponse.json({ error: "Judul dan gambar banner wajib diisi." }, { status: 400 });
    }
    const banner = await db.banner.create({
      data: {
        title: b.title.trim(),
        subtitle: b.subtitle ?? "",
        image: b.image.trim(),
        link: b.link ?? "",
        isActive: b.isActive ?? true,
        sortOrder: Number(b.sortOrder ?? 0),
      },
    });
    return NextResponse.json(banner);
  });
}
