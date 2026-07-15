import { db } from "./db";
import { formatIDR } from "./utils";

/** Hitung diskon promo terhadap nominal; dipakai validasi & checkout. */
export async function computeDiscount(code: string, amount: number) {
  const promo = await db.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!promo || !promo.isActive) return { error: "Kode promo tidak ditemukan." } as const;
  if (promo.expiresAt && promo.expiresAt < new Date())
    return { error: "Kode promo sudah kedaluwarsa." } as const;
  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit)
    return { error: "Kuota kode promo sudah habis." } as const;
  if (amount < promo.minPurchase)
    return { error: `Minimal pembelian ${formatIDR(promo.minPurchase)} untuk kode ini.` } as const;

  let discount = promo.type === "PERCENT" ? Math.floor((amount * promo.value) / 100) : promo.value;
  if (promo.type === "PERCENT" && promo.maxDiscount > 0)
    discount = Math.min(discount, promo.maxDiscount);
  discount = Math.min(discount, amount);
  return { discount, promo };
}
