import { db } from "@/lib/db";

/** Sajikan gambar dari database dengan cache panjang (id unik → aman immutable). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await db.imageAsset.findUnique({ where: { id } });
  if (!asset) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(asset.data), {
    headers: {
      "Content-Type": asset.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
