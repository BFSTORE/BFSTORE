"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Modal, Toggle } from "@/components/admin/ui";
import { formatIDR } from "@/lib/utils";

type Promo = {
  id: number;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxDiscount: number;
  minPurchase: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
};

const empty = {
  code: "",
  type: "PERCENT" as const,
  value: 10,
  maxDiscount: 0,
  minPurchase: 0,
  usageLimit: 0,
  expiresAt: "",
  isActive: true,
};

export default function PromosClient({ promos }: { promos: Promo[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<Promo> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError("");
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/admin/promos" : `/api/admin/promos/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error ?? "Gagal menyimpan");
    setEditing(null);
    router.refresh();
  }

  async function remove(p: Promo) {
    if (!confirm(`Hapus kode promo "${p.code}"?`)) return;
    await fetch(`/api/admin/promos/${p.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kode Promo</h1>
          <p className="mt-1 text-sm text-muted">Buat diskon persen atau potongan tetap untuk pelanggan.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary">
          <Plus size={16} aria-hidden /> Buat Promo
        </button>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Kode</th>
                <th className="px-5 py-3 font-medium">Diskon</th>
                <th className="px-5 py-3 font-medium">Min. Beli</th>
                <th className="px-5 py-3 font-medium">Terpakai</th>
                <th className="px-5 py-3 font-medium">Kedaluwarsa</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-b border-line/50 last:border-0">
                  <td className="px-5 py-3.5 font-mono font-semibold text-brand-soft">{p.code}</td>
                  <td className="px-5 py-3.5">
                    {p.type === "PERCENT"
                      ? `${p.value}%${p.maxDiscount ? ` (maks ${formatIDR(p.maxDiscount)})` : ""}`
                      : formatIDR(p.value)}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-muted">
                    {p.minPurchase ? formatIDR(p.minPurchase) : "—"}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-muted">
                    {p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}
                  </td>
                  <td className="px-5 py-3.5 text-muted">{p.expiresAt || "—"}</td>
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
                        aria-label={`Edit ${p.code}`}
                      >
                        <Pencil size={14} aria-hidden />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="cursor-pointer rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10"
                        aria-label={`Hapus ${p.code}`}
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    Belum ada kode promo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id ? "Edit Promo" : "Buat Promo"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="pr-code">Kode *</label>
                <input
                  id="pr-code"
                  className="input uppercase"
                  value={editing.code ?? ""}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                  placeholder="BFSTORE10"
                />
              </div>
              <div>
                <label className="label" htmlFor="pr-type">Tipe Diskon</label>
                <select
                  id="pr-type"
                  className="input"
                  value={editing.type ?? "PERCENT"}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value as "PERCENT" | "FIXED" })}
                >
                  <option value="PERCENT">Persen (%)</option>
                  <option value="FIXED">Potongan Tetap (Rp)</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="pr-value">
                  {editing.type === "FIXED" ? "Potongan (Rp) *" : "Persentase (%) *"}
                </label>
                <input
                  id="pr-value"
                  type="number"
                  className="input"
                  value={editing.value ?? 0}
                  onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })}
                />
              </div>
              {editing.type !== "FIXED" && (
                <div>
                  <label className="label" htmlFor="pr-max">Maks. Diskon (Rp, 0 = bebas)</label>
                  <input
                    id="pr-max"
                    type="number"
                    className="input"
                    value={editing.maxDiscount ?? 0}
                    onChange={(e) => setEditing({ ...editing, maxDiscount: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="pr-min">Min. Pembelian (Rp)</label>
                <input
                  id="pr-min"
                  type="number"
                  className="input"
                  value={editing.minPurchase ?? 0}
                  onChange={(e) => setEditing({ ...editing, minPurchase: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="label" htmlFor="pr-limit">Kuota Pemakaian (0 = bebas)</label>
                <input
                  id="pr-limit"
                  type="number"
                  className="input"
                  value={editing.usageLimit ?? 0}
                  onChange={(e) => setEditing({ ...editing, usageLimit: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="pr-exp">Tanggal Kedaluwarsa (opsional)</label>
              <input
                id="pr-exp"
                type="date"
                className="input"
                value={editing.expiresAt ?? ""}
                onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value })}
              />
            </div>
            <Toggle
              checked={editing.isActive ?? true}
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
                disabled={saving || !editing.code?.trim() || !editing.value}
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
