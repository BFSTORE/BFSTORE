"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, RefreshCw, Loader2, Package } from "lucide-react";
import { Modal, ImageInput, Toggle } from "@/components/admin/ui";

type Game = {
  id: number;
  name: string;
  slug: string;
  publisher: string;
  image: string;
  digiBrand: string;
  fieldLabel: string;
  fieldLabel2: string;
  instructions: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  productCount: number;
};

const empty = {
  name: "",
  slug: "",
  publisher: "",
  image: "",
  digiBrand: "",
  fieldLabel: "User ID",
  fieldLabel2: "",
  instructions: "",
  isActive: true,
  isPopular: false,
  sortOrder: 0,
};

export default function GamesClient({ games }: { games: Game[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<Game> | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function save() {
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/admin/games" : `/api/admin/games/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMessage({ type: "err", text: data.error ?? "Gagal menyimpan" });
    setEditing(null);
    setMessage({ type: "ok", text: isNew ? "Game berhasil ditambahkan." : "Game diperbarui." });
    router.refresh();
  }

  async function remove(g: Game) {
    if (!confirm(`Hapus game "${g.name}" beserta ${g.productCount} produknya? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await fetch(`/api/admin/games/${g.id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage({ type: "ok", text: `Game "${g.name}" dihapus.` });
      router.refresh();
    }
  }

  async function sync(g: Game) {
    setSyncing(g.id);
    setMessage(null);
    const res = await fetch("/api/admin/digiflazz/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: g.id }),
    });
    const data = await res.json();
    setSyncing(null);
    setMessage(
      res.ok ? { type: "ok", text: data.message } : { type: "err", text: data.error ?? "Gagal sinkron" }
    );
    if (res.ok) router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Game & Produk</h1>
          <p className="mt-1 text-sm text-muted">
            Kelola daftar game, harga, dan sinkronisasi produk dari Digiflazz.
          </p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary">
          <Plus size={16} aria-hidden /> Tambah Game
        </button>
      </div>

      {message && (
        <p
          role="status"
          className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            message.type === "ok"
              ? "border-brand/30 bg-brand/10 text-brand-soft"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {games.map((g) => (
          <div key={g.id} className="card overflow-hidden">
            <div className="flex gap-4 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.image || "/logo.svg"}
                alt=""
                className="h-20 w-16 shrink-0 rounded-lg border border-line object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="truncate font-semibold">{g.name}</h2>
                  <span
                    className={`badge shrink-0 border ${
                      g.isActive
                        ? "border-brand/30 bg-brand/10 text-brand-soft"
                        : "border-line bg-surface-2 text-muted"
                    }`}
                  >
                    {g.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">{g.publisher || "—"}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                  <Package size={12} aria-hidden /> {g.productCount} produk
                  {g.isPopular && <span className="text-brand-soft">· Populer</span>}
                </p>
              </div>
            </div>
            <div className="flex border-t border-line">
              <Link
                href={`/admin/games/${g.id}`}
                className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                <Package size={13} aria-hidden /> Produk
              </Link>
              <button
                onClick={() => setEditing(g)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-l border-line px-3 py-2.5 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                <Pencil size={13} aria-hidden /> Edit
              </button>
              <button
                onClick={() => sync(g)}
                disabled={syncing === g.id}
                title="Tarik produk & harga dari Digiflazz"
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-l border-line px-3 py-2.5 text-xs font-semibold text-muted transition hover:bg-surface-2 hover:text-brand-soft disabled:opacity-50"
              >
                {syncing === g.id ? (
                  <Loader2 size={13} className="animate-spin" aria-hidden />
                ) : (
                  <RefreshCw size={13} aria-hidden />
                )}
                Sync
              </button>
              <button
                onClick={() => remove(g)}
                className="flex cursor-pointer items-center justify-center border-l border-line px-4 py-2.5 text-rose-300 transition hover:bg-rose-500/10"
                aria-label={`Hapus ${g.name}`}
              >
                <Trash2 size={13} aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing.id ? "Edit Game" : "Tambah Game"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="g-name">Nama Game *</label>
                <input
                  id="g-name"
                  className="input"
                  value={editing.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="g-pub">Publisher</label>
                <input
                  id="g-pub"
                  className="input"
                  value={editing.publisher ?? ""}
                  onChange={(e) => setEditing({ ...editing, publisher: e.target.value })}
                />
              </div>
            </div>

            <ImageInput
              label="Gambar Game"
              value={editing.image ?? ""}
              onChange={(url) => setEditing({ ...editing, image: url })}
            />

            <div>
              <label className="label" htmlFor="g-brand">Brand Digiflazz</label>
              <input
                id="g-brand"
                className="input uppercase"
                value={editing.digiBrand ?? ""}
                onChange={(e) => setEditing({ ...editing, digiBrand: e.target.value.toUpperCase() })}
                placeholder="mis. MOBILE LEGENDS"
              />
              <p className="mt-1.5 text-xs text-muted">
                Nama brand persis seperti di price list Digiflazz — dipakai tombol Sync.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="g-f1">Label Input 1</label>
                <input
                  id="g-f1"
                  className="input"
                  value={editing.fieldLabel ?? ""}
                  onChange={(e) => setEditing({ ...editing, fieldLabel: e.target.value })}
                  placeholder="User ID"
                />
              </div>
              <div>
                <label className="label" htmlFor="g-f2">Label Input 2 (opsional)</label>
                <input
                  id="g-f2"
                  className="input"
                  value={editing.fieldLabel2 ?? ""}
                  onChange={(e) => setEditing({ ...editing, fieldLabel2: e.target.value })}
                  placeholder="Zone ID — kosongkan jika tak perlu"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="g-inst">Instruksi untuk pembeli</label>
              <textarea
                id="g-inst"
                className="input min-h-20"
                value={editing.instructions ?? ""}
                onChange={(e) => setEditing({ ...editing, instructions: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <Toggle
                checked={editing.isActive ?? true}
                onChange={(v) => setEditing({ ...editing, isActive: v })}
                label="Aktif"
              />
              <Toggle
                checked={editing.isPopular ?? false}
                onChange={(v) => setEditing({ ...editing, isPopular: v })}
                label="Tampil di Populer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="btn-ghost">Batal</button>
              <button onClick={save} disabled={saving || !editing.name?.trim()} className="btn-primary">
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
