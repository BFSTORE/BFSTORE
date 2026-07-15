"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

export default function CekTransaksiPage() {
  const [invoice, setInvoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/orders/${encodeURIComponent(invoice.trim().toUpperCase())}`);
    if (res.ok) {
      router.push(`/invoice/${invoice.trim().toUpperCase()}`);
    } else {
      setError("Invoice tidak ditemukan. Periksa kembali nomor invoice kamu.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-16 text-center">
      <h1 className="text-3xl font-bold">Cek Transaksi</h1>
      <p className="mt-2 text-sm text-muted">
        Masukkan nomor invoice (contoh: BF20260714ABCDE) untuk melihat status pesananmu.
      </p>

      <form onSubmit={submit} className="mt-8 flex gap-2">
        <label htmlFor="invoice" className="sr-only">Nomor invoice</label>
        <input
          id="invoice"
          className="input flex-1 uppercase"
          value={invoice}
          onChange={(e) => setInvoice(e.target.value.toUpperCase())}
          placeholder="Nomor invoice"
        />
        <button className="btn-primary" disabled={loading || !invoice.trim()}>
          {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Search size={16} aria-hidden />}
          Lacak
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
