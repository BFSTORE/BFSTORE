"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Zap } from "lucide-react";
import { Modal, Toggle } from "@/components/admin/ui";
import { formatIDR } from "@/lib/utils";

type Flash = {
  id: number;
  productId: number;
  productName: string;
  gameName: string;
  normalPrice: number;
  flashPrice: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isRunning: boolean;
};

type Game = { id: number; name: string; products: { id: number; name: string; price: number }[] };

type Draft = {
  id?: number;
  gameId: number | "";
  productId: number | "";
  flashPrice: number | "";
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

function nowLocal(offsetHours = 0) {
  const d = new Date(Date.now() + offsetHours * 3_600_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function FlashSaleClient({ flashSales, games }: { flashSales: Flash[]; games: Game[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedGame = useMemo(
    () => games.find((g) => g.id === editing?.gameId) ?? null,
    [games, editing?.gameId]
  );
  const selectedProduct = useMemo(
    () => selectedGame?.products.find((p) => p.id === editing?.productId) ?? null,
    [selectedGame, editing?.productId]
  );

  function openNew() {
    setError("");
    setEditing({
      gameId: "",
      productId: "",
      flashPrice: "",
      startsAt: nowLocal(),
      endsAt: nowLocal(24),
      isActive: true,
    });
  }

  function openEdit(f: Flash) {
    setError("");
    const game = games.find((g) => g.products.some((p) => p.id === f.productId));
    setEditing({
      id: f.id,
      gameId: game?.id ?? "",
      productId: f.productId,
      flashPrice: f.flashPrice,
      startsAt: f.startsAt,
      endsAt: f.endsAt,
      isActive: f.isActive,
    });
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError("");
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/admin/flashsales" : `/api/admin/flashsales/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: editing.productId,
        flashPrice: editing.flashPrice,
        startsAt: editing.startsAt,
        endsAt: editing.endsAt,
        isActive: editing.isActive,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error ?? "Gagal menyimpan");
    setEditing(null);
    router.refresh();
  }

  async function remove(f: Flash) {
    if (!confirm(`Hapus flash sale untuk "${f.productName}"?`)) return;
    await fetch(`/api/admin/flashsales/${f.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Flash Sale</h1>
          <p className="mt-1 text-sm text-muted">
            Pasang harga spesial berbatas waktu — tampil otomatis di beranda dengan hitung mundur.
          </p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} aria-hidden /> Buat Flash Sale
        </button>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Produk</th>
                <th className="px-5 py-3 font-medium">Harga Normal</th>
                <th className="px-5 py-3 font-medium">Harga Flash</th>
                <th className="px-5 py-3 font-medium">Mulai</th>
                <th className="px-5 py-3 font-medium">Berakhir</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {flashSales.map((f) => (
                <tr key={f.id} className="border-b border-line/50 last:border-0">
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{f.productName}</p>
                    <p className="text-xs text-muted">{f.gameName}</p>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-muted line-through">
                    {formatIDR(f.normalPrice)}
                  </td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums text-amber-300">
                    {formatIDR(f.flashPrice)}
                  </td>
                  <td className="px-5 py-3.5 text-muted">{f.startsAt.replace("T", " ")}</td>
                  <td className="px-5 py-3.5 text-muted">{f.endsAt.replace("T", " ")}</td>
                  <td className="px-5 py-3.5">
                    {f.isRunning ? (
                      <span className="badge border border-amber-500/30 bg-amber-500/10 text-amber-300">
                        <Zap size={11} aria-hidden /> Berjalan
                      </span>
                    ) : f.isActive ? (
                      <span className="badge border border-line bg-surface-2 text-muted">Terjadwal / Selesai</span>
                    ) : (
                      <span className="badge border border-line bg-surface-2 text-muted">Nonaktif</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(f)}
                        className="cursor-pointer rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink"
                        aria-label={`Edit flash sale ${f.productName}`}
                      >
                        <Pencil size={14} aria-hidden />
                      </button>
                      <button
                        onClick={() => remove(f)}
                        className="cursor-pointer rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10"
                        aria-label={`Hapus flash sale ${f.productName}`}
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {flashSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    Belum ada flash sale. Buat yang pertama untuk menaikkan penjualan!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? "Edit Flash Sale" : "Buat Flash Sale"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="fs-game">Game *</label>
                <select
                  id="fs-game"
                  className="input"
                  value={editing.gameId}
                  disabled={Boolean(editing.id)}
                  onChange={(e) =>
                    setEditing({ ...editing, gameId: Number(e.target.value) || "", productId: "" })
                  }
                >
                  <option value="">Pilih game…</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="fs-product">Produk *</label>
                <select
                  id="fs-product"
                  className="input"
                  value={editing.productId}
                  disabled={!selectedGame || Boolean(editing.id)}
                  onChange={(e) => setEditing({ ...editing, productId: Number(e.target.value) || "" })}
                >
                  <option value="">Pilih produk…</option>
                  {selectedGame?.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatIDR(p.price)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="fs-price">Harga Flash Sale (Rp) *</label>
              <input
                id="fs-price"
                type="number"
                className="input"
                value={editing.flashPrice}
                onChange={(e) => setEditing({ ...editing, flashPrice: Number(e.target.value) || "" })}
              />
              {selectedProduct && (
                <p className="mt-1.5 text-xs text-muted">
                  Harga normal {formatIDR(selectedProduct.price)}
                  {typeof editing.flashPrice === "number" && editing.flashPrice > 0 && editing.flashPrice < selectedProduct.price && (
                    <span className="text-brand-soft">
                      {" "}→ hemat {Math.round(((selectedProduct.price - editing.flashPrice) / selectedProduct.price) * 100)}%
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="fs-start">Mulai *</label>
                <input
                  id="fs-start"
                  type="datetime-local"
                  className="input"
                  value={editing.startsAt}
                  onChange={(e) => setEditing({ ...editing, startsAt: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="fs-end">Berakhir *</label>
                <input
                  id="fs-end"
                  type="datetime-local"
                  className="input"
                  value={editing.endsAt}
                  onChange={(e) => setEditing({ ...editing, endsAt: e.target.value })}
                />
              </div>
            </div>

            <Toggle
              checked={editing.isActive}
              onChange={(v) => setEditing({ ...editing, isActive: v })}
              label="Aktif"
            />

            {error && (
              <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="btn-ghost">Batal</button>
              <button
                onClick={save}
                disabled={saving || !editing.productId || !editing.flashPrice || !editing.startsAt || !editing.endsAt}
                className="btn-primary"
              >
                {saving && <Loader2 size={15} className="animate-spin" aria-hidden />}
                Simpan
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
