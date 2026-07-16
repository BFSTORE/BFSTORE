import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB

/** Simpan gambar ke database — tanpa penyimpanan file eksternal, bekerja di mana pun. */
export async function POST(req: Request) {
  return withAdmin(async () => {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Format harus PNG, JPG, WebP, SVG, atau GIF." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran maksimal 4 MB." }, { status: 400 });
    }

    const asset = await db.imageAsset.create({
      data: {
        name: file.name,
        mime: file.type,
        data: Buffer.from(await file.arrayBuffer()),
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, url: `/api/images/${asset.id}` });
  });
}
