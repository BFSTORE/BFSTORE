import { db } from "@/lib/db";
import GamesClient from "./GamesClient";

export const dynamic = "force-dynamic";

export default async function AdminGamesPage() {
  const games = await db.game.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <GamesClient
      games={games.map((g) => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        publisher: g.publisher,
        image: g.image,
        digiBrand: g.digiBrand,
        fieldLabel: g.fieldLabel,
        fieldLabel2: g.fieldLabel2,
        instructions: g.instructions,
        isActive: g.isActive,
        isPopular: g.isPopular,
        sortOrder: g.sortOrder,
        productCount: g._count.products,
      }))}
    />
  );
}
