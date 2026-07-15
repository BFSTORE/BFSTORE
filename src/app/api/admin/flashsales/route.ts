import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";

export async function POST(req: Request) {
  return withAdmin(async () => {
    const b = await req.json();
    if (!b.productId || !b.flashPrice || !b.startsAt || !b.endsAt) {
      return NextResponse.json(
        { error: "Produk, harga flash, dan periode wajib diisi." },
        { status: 400 }
      );
    }
    const product = await db.product.findUnique({ where: { id: Number(b.productId) } });
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    if (Number(b.flashPrice) >= product.price) {
      return NextResponse.json(
        { error: "Harga flash sale harus lebih murah dari harga normal." },
        { status: 400 }
      );
    }
    const existing = await db.flashSale.findUnique({ where: { productId: product.id } });
    if (existing) {
      return NextResponse.json(
        { error: "Produk ini sudah punya flash sale. Edit atau hapus dulu yang lama." },
        { status: 409 }
      );
    }
    const flash = await db.flashSale.create({
      data: {
        productId: product.id,
        flashPrice: Number(b.flashPrice),
        startsAt: new Date(b.startsAt),
        endsAt: new Date(b.endsAt),
        isActive: b.isActive ?? true,
      },
    });
    return NextResponse.json(flash);
  });
}
