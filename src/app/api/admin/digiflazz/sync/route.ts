import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-route";
import { fetchPriceList } from "@/lib/digiflazz";
import { getSettings } from "@/lib/settings";

/**
 * Sinkronisasi produk dari price list Digiflazz ke sebuah game.
 * Mencocokkan berdasarkan kolom `digiBrand` game (mis. "MOBILE LEGENDS"),
 * lalu upsert produk dengan harga jual = harga modal + markup%.
 */
export async function POST(req: Request) {
  return withAdmin(async () => {
    const { gameId } = await req.json();
    const game = await db.game.findUnique({ where: { id: Number(gameId) } });
    if (!game) return NextResponse.json({ error: "Game tidak ditemukan." }, { status: 404 });
    if (!game.digiBrand.trim()) {
      return NextResponse.json(
        { error: "Isi dulu kolom 'Brand Digiflazz' pada game ini (mis. MOBILE LEGENDS)." },
        { status: 400 }
      );
    }

    const [list, settings] = await Promise.all([fetchPriceList(), getSettings()]);
    const markup = Number(settings.markupPercent ?? "5") / 100;
    const brand = game.digiBrand.trim().toUpperCase();
    const items = list.filter(
      (i) => i.brand?.toUpperCase() === brand && i.buyer_product_status && i.seller_product_status
    );

    if (items.length === 0) {
      const brands = [...new Set(list.map((i) => i.brand))].sort();
      return NextResponse.json(
        {
          error: `Tidak ada produk aktif untuk brand "${brand}". Brand tersedia: ${brands.slice(0, 30).join(", ")}${brands.length > 30 ? ", …" : ""}`,
        },
        { status: 404 }
      );
    }

    let created = 0;
    let updated = 0;
    for (const item of items) {
      const sellPrice = Math.ceil((item.price * (1 + markup)) / 100) * 100; // bulatkan ke ratusan
      const existing = await db.product.findFirst({
        where: { gameId: game.id, sku: item.buyer_sku_code },
      });
      if (existing) {
        await db.product.update({
          where: { id: existing.id },
          data: { basePrice: item.price, price: sellPrice, name: item.product_name },
        });
        updated++;
      } else {
        await db.product.create({
          data: {
            gameId: game.id,
            name: item.product_name,
            sku: item.buyer_sku_code,
            basePrice: item.price,
            price: sellPrice,
            sortOrder: item.price,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Sinkronisasi selesai: ${created} produk baru, ${updated} diperbarui (markup ${settings.markupPercent}%).`,
    });
  });
}
