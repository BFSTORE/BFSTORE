"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Modal, ImageInput, Toggle } from "@/components/admin/ui";

type Banner = {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  sortOrder: number;
};

const empty = { title: "", subtitle: "", image: "", link: "", isActive: true, sortOrder: 0 };

export default function BannersClient({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError("");
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/admin/banners" : `/api/admin/banners/${editing.id}`, {
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

  async function remove(b: Banner) {
    if (!confirm(`Hapus banner "${b.title}"?`)) return;
    await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function move(b: Banner, dir: -1 | 1) {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sortOrder: b.sortOrder + dir * 3 }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Slideshow Banner</h1>
          <p className="mt-1 text-sm text-muted">
            Banner promosi yang tampil di halaman utama toko. Ukuran ideal 1400×520 px.
          </p>
        </div>
        <button onClick={() => setEditing({ ...empty, sortOrder: banners.length * 3 })} className="btn-primary">
          <Plus size={16} aria-hidden /> Tambah Banner
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {banners.map((b, i) => (
          <div key={b.id} className="card flex flex-wrap items-center gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.image}
              alt={b.title}
              className="h-20 w-52 shrink-0 rounded-lg border border-line object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{b.title}</p>
              <p className="truncate text-sm text-muted">{b.subtitle || "—"}</p>
              <span
                className={`badge mt-1.5 border ${
                  b.isActive
                    ? "border-brand/30 bg-brand/10 text-brand-soft"
                    : "border-line bg-surface-2 text-muted"
                }`}
              >
                {b.isActive ? "Tayang" : "Disembunyikan"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => move(b, -1)}
                disabled={i === 0}
                className="cursor-pointer rounded-lg p-2 text-muted transition hover:bg-surface-2 disabled:opacity-30"
                aria-label="Naikkan urutan"
              >
                <ArrowUp size={15} aria-hidden />
              </button>
              <button
                onClick={() => move(b, 1)}
                disabled={i === banners.length - 1}
                className="cursor-pointer rounded-lg p-2 text-muted transition hover:bg-surface-2 disabled:opacity-30"
                aria-label="Turunkan urutan"
              >
                <ArrowDown size={15} aria-hidden />
              </button>
              <button
                onClick={() => setEditing(b)}
                className="cursor-pointer rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink"
                aria-label={`Edit ${b.title}`}
              >
                <Pencil size={15} aria-hidden />
              </button>
              <button
                onClick={() => remove(b)}
                className="cursor-pointer rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10"
                aria-label={`Hapus ${b.title}`}
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="card px-6 py-14 text-center text-sm text-muted">
            Belum ada banner. Tambahkan banner pertama untuk slideshow beranda.
          </div>
        )}
      </div>

      {editing && (
        <Modal title={editing.id ? "Edit Banner" : "Tambah Banner"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="b-title">Judul *</label>
              <input
                id="b-title"
                className="input"
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="b-sub">Subjudul</label>
              <input
                id="b-sub"
                className="input"
                value={editing.subtitle ?? ""}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              />
            </div>
            <ImageInput
              label="Gambar Banner *"
              value={editing.image ?? ""}
              onChange={(url) => setEditing({ ...editing, image: url })}
            />
            <div>
              <label className="label" htmlFor="b-link">Tautan saat diklik (opsional)</label>
              <input
                id="b-link"
                className="input"
                value={editing.link ?? ""}
                onChange={(e) => setEditing({ ...editing, link: e.target.value })}
                placeholder="/game/mobile-legends"
              />
            </div>
            <Toggle
              checked={editing.isActive ?? true}
              onChange={(v) => setEditing({ ...editing, isActive: v })}
              label="Tayangkan di beranda"
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
                disabled={saving || !editing.title?.trim() || !editing.image?.trim()}
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
