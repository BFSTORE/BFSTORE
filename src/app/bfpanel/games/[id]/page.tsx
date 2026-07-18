import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminGameProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await db.game.findUnique({
    where: { id: Number(id) },
    include: { products: { orderBy: { sortOrder: "asc" } } },
  });
  if (!game) notFound();

  return (
    <ProductsClient
      game={{ id: game.id, name: game.name }}
      products={game.products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        basePrice: p.basePrice,
        price: p.price,
        isActive: p.isActive,
        sortOrder: p.sortOrder,
      }))}
    />
  );
}
