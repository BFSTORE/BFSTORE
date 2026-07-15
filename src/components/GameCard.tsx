import Link from "next/link";

type Game = { slug: string; name: string; publisher: string; image: string };

/** Kartu game dengan watermark logo BFSTORE di pojok gambar. */
export default function GameCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/game/${game.slug}`}
      className="group card overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.image}
          alt={game.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {/* Watermark BFSTORE */}
        <span className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-heading text-[10px] font-extrabold italic tracking-wide text-white backdrop-blur-sm">
          BF<span className="text-brand-soft">STORE</span>
        </span>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="p-3.5">
        <h3 className="truncate text-sm font-semibold">{game.name}</h3>
        <p className="mt-0.5 truncate text-xs text-muted">{game.publisher}</p>
      </div>
    </Link>
  );
}
