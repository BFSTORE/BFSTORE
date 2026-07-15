import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

export async function POST(req: Request) {
  return withAdmin(async () => {
    const b = await req.json();
    if (!b.gameId || !b.name?.trim() || !b.price) {
      return NextResponse.json({ error: "Nama dan harga produk wajib diisi." }, { status: 400 });
    }
    const product = await db.product.create({
      data: {
        gameId: Number(b.gameId),
        name: b.name.trim(),
        sku: b.sku ?? "",
        basePrice: Number(b.basePrice ?? 0),
        price: Number(b.price),
        isActive: b.isActive ?? true,
        sortOrder: Number(b.sortOrder ?? 0),
      },
    });
    return NextResponse.json(product);
  });
}
