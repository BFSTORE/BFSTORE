"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Timer } from "lucide-react";
import { formatIDR } from "@/lib/utils";

type FlashItem = {
  id: number;
  productName: string;
  flashPrice: number;
  originalPrice: number;
  endsAt: string;
  gameName: string;
  gameSlug: string;
  gameImage: string;
};

function useCountdown(target: string) {
  const [left, setLeft] = useState(() => new Date(target).getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(new Date(target).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  if (left <= 0) return null;
  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Countdown({ endsAt }: { endsAt: string }) {
  const text = useCountdown(endsAt);
  if (!text) return <span className="text-xs text-muted">Berakhir</span>;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums text-amber-300">
      <Timer size={12} aria-hidden /> {text}
    </span>
  );
}

export default function FlashSaleSection({ items }: { items: FlashItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-14" aria-labelledby="flash-heading">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15">
            <Zap size={17} className="text-amber-400" aria-hidden />
          </span>
          <h2 id="flash-heading" className="text-xl font-bold">
            Flash Sale
          </h2>
        </div>
        <Countdown endsAt={items[0].endsAt} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f) => {
          const pct = Math.round(((f.originalPrice - f.flashPrice) / f.originalPrice) * 100);
          return (
            <Link
              key={f.id}
              href={`/game/${f.gameSlug}`}
              className="card group flex items-center gap-4 border-amber-500/20 p-4 transition hover:-translate-y-0.5 hover:border-amber-400/50"
            >
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.gameImage} alt="" className="h-full w-full object-cover" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted">{f.gameName}</p>
                <p className="truncate text-sm font-semibold">{f.productName}</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-bold tabular-nums text-amber-300">
                    {formatIDR(f.flashPrice)}
                  </span>
                  <span className="text-xs tabular-nums text-muted line-through">
                    {formatIDR(f.originalPrice)}
                  </span>
                </div>
              </div>
              <span className="badge shrink-0 bg-amber-400 text-amber-950">−{pct}%</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
