import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  return withAdmin(async () => {
    const b = await req.json();
    if (!b.name?.trim()) return NextResponse.json({ error: "Nama game wajib diisi." }, { status: 400 });
    const game = await db.game.create({
      data: {
        name: b.name.trim(),
        slug: b.slug?.trim() || slugify(b.name),
        publisher: b.publisher ?? "",
        image: b.image ?? "",
        digiBrand: b.digiBrand ?? "",
        fieldLabel: b.fieldLabel || "User ID",
        fieldLabel2: b.fieldLabel2 ?? "",
        instructions: b.instructions ?? "",
        isActive: b.isActive ?? true,
        isPopular: b.isPopular ?? false,
        sortOrder: b.sortOrder ?? 0,
      },
    });
    return NextResponse.json(game);
  });
}
