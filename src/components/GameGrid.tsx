"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import GameCard from "./GameCard";

type Game = { id: number; slug: string; name: string; publisher: string; image: string };

export default function GameGrid({ games }: { games: Game[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter(
      (g) => g.name.toLowerCase().includes(q) || g.publisher.toLowerCase().includes(q)
    );
  }, [games, query]);

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari game favoritmu…"
          aria-label="Cari game"
          className="input !pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
          <p className="font-semibold">Game tidak ditemukan</p>
          <p className="text-sm text-muted">
            Coba kata kunci lain, atau hubungi admin untuk request game baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}
