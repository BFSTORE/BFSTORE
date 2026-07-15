"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Percent, Sparkles, Calculator } from "lucide-react";
import { formatIDR } from "@/lib/utils";

const TABS = [
  { id: "winrate", label: "Win Rate", icon: Percent },
  { id: "magicwheel", label: "Magic Wheel", icon: Sparkles },
] as const;

export default function KalkulatorClient() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("winrate");

  return (
    <div className="mx-auto max-w-2xl px-4 pt-10">
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10">
          <Calculator size={22} className="text-brand" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold">Kalkulator</h1>
        <p className="mt-2 text-sm text-muted">
          Alat bantu gratis untuk para pemain Mobile Legends dari BFSTORE.
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Jenis kalkulator">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              tab === id
                ? "bg-brand text-[#052e16]"
                : "border border-line bg-surface-2 text-muted hover:text-ink"
            }`}
          >
            <Icon size={15} aria-hidden /> {label}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === "winrate" ? <WinRateCalc /> : <MagicWheelCalc />}</div>
    </div>
  );
}

function WinRateCalc() {
  const [matches, setMatches] = useState("");
  const [currentWr, setCurrentWr] = useState("");
  const [targetWr, setTargetWr] = useState("");

  const result = useMemo<{ error: string } | { needed: number } | null>(() => {
    const t = Number(matches);
    const w = Number(currentWr) / 100;
    const g = Number(targetWr) / 100;
    if (!t || t <= 0 || !currentWr || !targetWr) return null;
    if (g >= 1) return { error: "Target win rate harus di bawah 100%." };
    if (g <= w) return { error: "Target harus lebih tinggi dari win rate sekarang." };
    const wins = t * w;
    const needed = Math.ceil((g * t - wins) / (1 - g));
    return { needed };
  }, [matches, currentWr, targetWr]);

  return (
    <div className="card p-6">
      <h2 className="font-semibold">Kalkulator Win Rate</h2>
      <p className="mt-1 text-sm text-muted">
        Hitung berapa match yang harus kamu menangkan beruntun untuk mencapai target win rate.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="wr-total">Total Match</label>
          <input
            id="wr-total"
            type="number"
            inputMode="numeric"
            min={1}
            className="input"
            value={matches}
            onChange={(e) => setMatches(e.target.value)}
            placeholder="1000"
          />
        </div>
        <div>
          <label className="label" htmlFor="wr-now">Win Rate Sekarang (%)</label>
          <input
            id="wr-now"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            className="input"
            value={currentWr}
            onChange={(e) => setCurrentWr(e.target.value)}
            placeholder="50"
          />
        </div>
        <div>
          <label className="label" htmlFor="wr-target">Target Win Rate (%)</label>
          <input
            id="wr-target"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            className="input"
            value={targetWr}
            onChange={(e) => setTargetWr(e.target.value)}
            placeholder="60"
          />
        </div>
      </div>

      {result && "error" in result && (
        <p role="alert" className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {result.error}
        </p>
      )}
      {result && "needed" in result && (
        <div className="mt-5 rounded-xl border border-brand/30 bg-brand/10 px-5 py-4 text-center" role="status">
          <p className="text-sm text-muted">Kamu harus menang</p>
          <p className="mt-1 font-heading text-3xl font-bold text-brand-soft tabular-nums">
            {result.needed.toLocaleString("id-ID")} match
          </p>
          <p className="mt-1 text-sm text-muted">beruntun tanpa kalah untuk mencapai target win rate.</p>
        </div>
      )}
    </div>
  );
}

function MagicWheelCalc() {
  const [spins, setSpins] = useState("");
  const [pricePerSpin, setPricePerSpin] = useState("270");
  // Estimasi kasar harga diamond per unit (dari produk ML umum)
  const RP_PER_DIAMOND = 250;

  const result = useMemo(() => {
    const s = Number(spins);
    const p = Number(pricePerSpin);
    if (!s || s <= 0 || !p || p <= 0) return null;
    const diamonds = s * p;
    return { diamonds, rupiah: diamonds * RP_PER_DIAMOND };
  }, [spins, pricePerSpin]);

  return (
    <div className="card p-6">
      <h2 className="font-semibold">Kalkulator Magic Wheel</h2>
      <p className="mt-1 text-sm text-muted">
        Hitung total diamond yang dibutuhkan untuk memutar Magic Wheel sampai dapat skin Legend.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="mw-spin">Jumlah Putaran</label>
          <input
            id="mw-spin"
            type="number"
            inputMode="numeric"
            min={1}
            className="input"
            value={spins}
            onChange={(e) => setSpins(e.target.value)}
            placeholder="mis. 50 (jaminan skin)"
          />
        </div>
        <div>
          <label className="label" htmlFor="mw-price">Diamond per Putaran</label>
          <input
            id="mw-price"
            type="number"
            inputMode="numeric"
            min={1}
            className="input"
            value={pricePerSpin}
            onChange={(e) => setPricePerSpin(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-muted">Umumnya 270 diamond per 1x putaran.</p>
        </div>
      </div>

      {result && (
        <div className="mt-5 rounded-xl border border-brand/30 bg-brand/10 px-5 py-4 text-center" role="status">
          <p className="text-sm text-muted">Total kebutuhan</p>
          <p className="mt-1 font-heading text-3xl font-bold text-brand-soft tabular-nums">
            {result.diamonds.toLocaleString("id-ID")} diamond
          </p>
          <p className="mt-1 text-sm text-muted">
            Estimasi biaya sekitar <b className="text-ink">{formatIDR(result.rupiah)}</b>
          </p>
          <Link href="/game/mobile-legends" className="btn-primary mt-4">
            Top Up Diamond Sekarang
          </Link>
        </div>
      )}
    </div>
  );
}
