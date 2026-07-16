import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { withAdmin } from "@/lib/admin-route";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB

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

    const ext = path.extname(file.name) || ".png";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    // Di Vercel: simpan ke Vercel Blob (penyimpanan cloud)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${name}`, file, { access: "public" });
      return NextResponse.json({ ok: true, url: blob.url });
    }
    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Penyimpanan gambar belum diaktifkan. Buka dashboard Vercel → project bfstore → Storage → Create Database → Blob → Connect, lalu Redeploy. Sementara itu, tempel URL gambar saja di kolomnya.",
        },
        { status: 503 }
      );
    }

    // Di komputer lokal: simpan ke folder public/uploads
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ ok: true, url: `/uploads/${name}` });
  });
}
