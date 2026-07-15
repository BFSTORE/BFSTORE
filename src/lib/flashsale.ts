import { db } from "./db";

/** Kondisi flash sale yang sedang berjalan. */
export function activeFlashWhere(now = new Date()) {
  return { isActive: true, startsAt: { lte: now }, endsAt: { gt: now } };
}

/** Semua flash sale aktif, untuk section beranda. */
export async function getActiveFlashSales() {
  return db.flashSale.findMany({
    where: {
      ...activeFlashWhere(),
      product: { isActive: true, game: { isActive: true } },
    },
    include: { product: { include: { game: true } } },
    orderBy: { endsAt: "asc" },
  });
}

/** Harga efektif sebuah produk (flash sale menang bila aktif). */
export function effectivePrice(
  product: { price: number },
  flash?: { flashPrice: number; startsAt: Date; endsAt: Date; isActive: boolean } | null,
  now = new Date()
) {
  if (flash && flash.isActive && flash.startsAt <= now && flash.endsAt > now) {
    return { price: flash.flashPrice, isFlash: true, original: product.price };
  }
  return { price: product.price, isFlash: false, original: product.price };
}
