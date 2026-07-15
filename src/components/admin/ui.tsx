"use client";

import { useRef, useState } from "react";
import { X, UploadCloud, Loader2 } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="card my-8 w-full max-w-lg bg-surface shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/** Input gambar: bisa tempel URL atau upload file ke server. */
export function ImageInput({
  value,
  onChange,
  label = "Gambar",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/… atau https://…"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-ghost whitespace-nowrap !px-4"
        >
          {uploading ? (
            <Loader2 size={15} className="animate-spin" aria-hidden />
          ) : (
            <UploadCloud size={15} aria-hidden />
          )}
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Pratinjau"
          className="mt-3 h-24 rounded-lg border border-line object-cover"
        />
      )}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 cursor-pointer rounded-full transition ${
          checked ? "bg-brand" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
