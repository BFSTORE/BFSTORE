"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";

declare global {
  interface Window {
    snap?: { pay: (token: string, opts: Record<string, unknown>) => void };
  }
}

export default function PayButton({ invoice }: { invoice: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function pay() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payment/snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Muat snap.js sesuai mode bila belum ada
      if (!window.snap) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            data.mode === "sandbox"
              ? "https://app.sandbox.midtrans.com/snap/snap.js"
              : "https://app.midtrans.com/snap/snap.js";
          script.setAttribute("data-client-key", data.clientKey);
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap."));
          document.body.appendChild(script);
        });
      }

      window.snap!.pay(data.token, {
        onSuccess: () => router.refresh(),
        onPending: () => router.refresh(),
        onError: () => setError("Pembayaran gagal. Silakan coba lagi."),
        onClose: () => {},
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={pay} disabled={loading} className="btn-primary w-full !py-3">
        {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <CreditCard size={16} aria-hidden />}
        Bayar Sekarang (QRIS / VA / E-Wallet)
      </button>
      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
