"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = { id: number; title: string; subtitle: string; image: string; link: string };

export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex((next + banners.length) % banners.length),
    [banners.length]
  );

  useEffect(() => {
    if (banners.length <= 1) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [banners.length, index]);

  if (banners.length === 0) return null;

  return (
    <section aria-label="Promo unggulan" className="relative">
      <div className="relative aspect-[1400/520] w-full overflow-hidden rounded-2xl border border-line md:rounded-3xl">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
            aria-hidden={i !== index}
          >
            {b.link ? (
              <a href={b.link} className="block h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
              </a>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
            )}
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Banner sebelumnya"
              className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur transition hover:bg-black/60"
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Banner berikutnya"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur transition hover:bg-black/60"
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </>
        )}
      </div>

      {banners.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => go(i)}
              aria-label={`Ke banner ${i + 1}: ${b.title}`}
              className={`h-2 cursor-pointer rounded-full transition-all ${
                i === index ? "w-8 bg-brand" : "w-2 bg-line hover:bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
