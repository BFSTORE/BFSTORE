export function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function makeInvoice() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BF${ymd}${rand}`;
}

export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Menunggu Pembayaran", tone: "amber" },
  PAID: { label: "Dibayar", tone: "sky" },
  PROCESSING: { label: "Sedang Diproses", tone: "sky" },
  SUCCESS: { label: "Berhasil", tone: "emerald" },
  FAILED: { label: "Gagal", tone: "rose" },
};
