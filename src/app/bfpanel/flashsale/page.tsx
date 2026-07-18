import { db } from "@/lib/db";
import FlashSaleClient from "./FlashSaleClient";

export const dynamic = "force-dynamic";

export default async function AdminFlashSalePage() {
  const [flashSales, games] = await Promise.all([
    db.flashSale.findMany({
      include: { product: { include: { game: true } } },
      orderBy: { endsAt: "asc" },
    }),
    db.game.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        products: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);

  const toLocal = (d: Date) => {
    // Format untuk input datetime-local (waktu lokal server)
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <FlashSaleClient
      flashSales={flashSales.map((f) => ({
        id: f.id,
        productId: f.productId,
        productName: f.product.name,
        gameName: f.product.game.name,
        normalPrice: f.product.price,
        flashPrice: f.flashPrice,
        startsAt: toLocal(f.startsAt),
        endsAt: toLocal(f.endsAt),
        isActive: f.isActive,
        isRunning: f.isActive && f.startsAt <= new Date() && f.endsAt > new Date(),
      }))}
      games={games.map((g) => ({
        id: g.id,
        name: g.name,
        products: g.products.map((p) => ({ id: p.id, name: p.name, price: p.price })),
      }))}
    />
  );
}
