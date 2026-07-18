"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { Modal, Toggle } from "@/components/admin/ui";
import { formatIDR } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
  sku: string;
  basePrice: number;
  price: number;
  isActive: boolean;
  sortOrder: number;
};

const empty = { name: "", sku: "", basePrice: 0, price: 0, isActive: true, sortOrder: 0 };

export default function ProductsClient({
  game,
  products,
}: {
  game: { id: number; name: string };
  products: Product[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError("");
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/admin/products" : `/api/admin/products/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editing, gameId: game.id }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error ?? "Gagal menyimpan");
    setEditing(null);
    router.refresh();
  }

  async function remove(p: Product) {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <Link
        href="/bfpanel/games"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
      >
        <ArrowLeft size={15} aria-hidden /> Kembali ke daftar game
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Produk — {game.name}</h1>
          <p className="mt-1 text-sm text-muted">
            Atur nominal, harga jual, dan SKU Digiflazz untuk transaksi otomatis.
          </p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary">
          <Plus size={16} aria-hidden /> Tambah Produk
        </button>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Produk</th>
                <th className="px-5 py-3 font-medium">SKU Digiflazz</th>
                <th className="px-5 py-3 font-medium">Modal</th>
                <th className="px-5 py-3 font-medium">Harga Jual</th>
                <th className="px-5 py-3 font-medium">Margin</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line/50 last:border-0">
                  <td className="px-5 py-3.5 font-medium">{p.name}</td>
                  <td className="px-5 py-3.5 text-muted">{p.sku || "—"}</td>
                  <td className="px-5 py-3.5 tabular-nums text-muted">
                    {p.basePrice ? formatIDR(p.basePrice) : "—"}
                  </td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums">{formatIDR(p.price)}</td>
                  <td className="px-5 py-3.5 tabular-nums text-brand-soft">
                    {p.basePrice ? formatIDR(p.price - p.basePrice) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`badge border ${
                        p.isActive
                          ? "border-brand/30 bg-brand/10 text-brand-soft"
                          : "border-line bg-surface-2 text-muted"
                      }`}
                    >
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(p)}
                        className="cursor-pointer rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil size={14} aria-hidden />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="cursor-pointer rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10"
                        aria-label={`Hapus ${p.name}`}
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    Belum ada produk. Tambah manual atau pakai tombol <b>Sync</b> di halaman game
                    untuk menarik dari Digiflazz.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? "Edit Produk" : "Tambah Produk"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="p-name">Nama Produk *</label>
              <input
                id="p-name"
                className="input"
                value={editing.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="mis. 86 Diamonds"
              />
            </div>
            <div>
              <label className="label" htmlFor="p-sku">SKU Digiflazz</label>
              <input
                id="p-sku"
                className="input"
                value={editing.sku ?? ""}
                onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                placeholder="buyer_sku_code — untuk topup otomatis"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="p-base">Harga Modal (Rp)</label>
                <input
                  id="p-base"
                  type="number"
                  className="input"
                  value={editing.basePrice ?? 0}
                  onChange={(e) => setEditing({ ...editing, basePrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="label" htmlFor="p-price">Harga Jual (Rp) *</label>
                <input
                  id="p-price"
                  type="number"
                  className="input"
                  value={editing.price ?? 0}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </div>
            </div>
            <Toggle
              checked={editing.isActive ?? true}
              onChange={(v) => setEditing({ ...editing, isActive: v })}
              label="Aktif (tampil di toko)"
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
                disabled={saving || !editing.name?.trim() || !editing.price}
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
