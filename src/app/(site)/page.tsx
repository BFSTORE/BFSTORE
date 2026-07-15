import { Flame, Gamepad2, Zap, ShieldCheck, BadgePercent } from "lucide-react";
import { db } from "@/lib/db";
import { getActiveFlashSales } from "@/lib/flashsale";
import HeroSlider from "@/components/HeroSlider";
import GameCard from "@/components/GameCard";
import GameGrid from "@/components/GameGrid";
import FlashSaleSection from "@/components/FlashSaleSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [banners, games, flashSales] = await Promise.all([
    db.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.game.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getActiveFlashSales(),
  ]);
  const popular = games.filter((g) => g.isPopular);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="pt-6 md:pt-8">
        <HeroSlider
          banners={banners.map((b) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            image: b.image,
            link: b.link,
          }))}
        />
      </div>

      {/* Trust bar */}
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Zap, title: "Proses Instan", desc: "Otomatis 24 jam nonstop" },
          { icon: ShieldCheck, title: "Aman & Resmi", desc: "Distributor resmi Digiflazz" },
          { icon: BadgePercent, title: "Harga Terbaik", desc: "Promo & diskon tiap minggu" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card flex items-center gap-4 px-5 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
              <Icon size={20} className="text-brand" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Flash Sale */}
      <FlashSaleSection
        items={flashSales.map((f) => ({
          id: f.id,
          productName: f.product.name,
          flashPrice: f.flashPrice,
          originalPrice: f.product.price,
          endsAt: f.endsAt.toISOString(),
          gameName: f.product.game.name,
          gameSlug: f.product.game.slug,
          gameImage: f.product.game.image,
        }))}
      />

      {/* Populer */}
      {popular.length > 0 && (
        <section className="mt-14" aria-labelledby="populer-heading">
          <div className="mb-5 flex items-center gap-2.5">
            <Flame size={20} className="text-brand" aria-hidden />
            <h2 id="populer-heading" className="text-xl font-bold">
              Paling Banyak Dibeli
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {popular.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
      )}

      {/* Semua game */}
      <section id="games" className="mt-14 scroll-mt-24" aria-labelledby="games-heading">
        <div className="mb-5 flex items-center gap-2.5">
          <Gamepad2 size={20} className="text-brand" aria-hidden />
          <h2 id="games-heading" className="text-xl font-bold">
            Semua Game
          </h2>
        </div>
        <GameGrid
          games={games.map((g) => ({
            id: g.id,
            slug: g.slug,
            name: g.name,
            publisher: g.publisher,
            image: g.image,
          }))}
        />
      </section>
    </div>
  );
}
