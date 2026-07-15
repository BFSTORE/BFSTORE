import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { db } from "@/lib/db";
import { effectivePrice } from "@/lib/flashsale";
import OrderForm from "./OrderForm";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await db.game.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { flashSale: true },
      },
    },
  });
  if (!game || !game.isActive) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:pt-8">
      {/* Header game */}
      <div className="card relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.image} alt="" className="h-full w-full object-cover blur-2xl" aria-hidden />
        </div>
        <div className="relative flex items-center gap-5 p-6 md:p-8">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-line md:h-28 md:w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={game.image} alt={game.name} className="h-full w-full object-cover" />
            <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 font-heading text-[9px] font-extrabold italic text-white backdrop-blur-sm">
              BF<span className="text-brand-soft">STORE</span>
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{game.name}</h1>
            <p className="mt-1 text-sm text-muted">{game.publisher}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge border border-brand/30 bg-brand/10 text-brand-soft">Proses Instan</span>
              <span className="badge border border-line bg-surface-2 text-muted">Resmi & Aman</span>
            </div>
          </div>
        </div>
      </div>

      {game.instructions && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3.5 text-sm text-muted">
          <Info size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          <p>{game.instructions}</p>
        </div>
      )}

      <OrderForm
        game={{
          id: game.id,
          name: game.name,
          fieldLabel: game.fieldLabel,
          fieldLabel2: game.fieldLabel2,
        }}
        products={game.products.map((p) => {
          const eff = effectivePrice(p, p.flashSale);
          return { id: p.id, name: p.name, price: eff.price, original: eff.original, isFlash: eff.isFlash };
        })}
      />
    </div>
  );
}
