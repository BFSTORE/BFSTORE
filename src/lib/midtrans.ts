import crypto from "crypto";
import { getSettings } from "./settings";

type OrderForSnap = {
  invoice: string;
  total: number;
  gameName: string;
  productName: string;
  contact: string;
};

export async function getMidtransConfig() {
  const s = await getSettings();
  const serverKey = s.midtransServerKey?.trim() ?? "";
  const clientKey = s.midtransClientKey?.trim() ?? "";
  const mode = s.midtransMode === "sandbox" ? "sandbox" : "production";
  const enabled = s.midtransEnabled === "1" && Boolean(serverKey && clientKey);
  return {
    serverKey,
    clientKey,
    mode,
    enabled,
    snapBase:
      mode === "sandbox" ? "https://app.sandbox.midtrans.com" : "https://app.midtrans.com",
  };
}

/** Buat transaksi Snap; mengembalikan token untuk popup pembayaran. */
export async function createSnapToken(order: OrderForSnap): Promise<string> {
  const cfg = await getMidtransConfig();
  if (!cfg.enabled) throw new Error("Pembayaran otomatis belum diaktifkan.");

  const isEmail = order.contact.includes("@");
  const res = await fetch(`${cfg.snapBase}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(cfg.serverKey + ":").toString("base64")}`,
    },
    body: JSON.stringify({
      transaction_details: { order_id: order.invoice, gross_amount: order.total },
      item_details: [
        {
          id: order.invoice,
          price: order.total,
          quantity: 1,
          name: `${order.gameName} — ${order.productName}`.slice(0, 50),
        },
      ],
      customer_details: isEmail
        ? { email: order.contact, first_name: "Pelanggan BFSTORE" }
        : { phone: order.contact, first_name: "Pelanggan BFSTORE" },
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(
      Array.isArray(data.error_messages) ? data.error_messages.join(", ") : "Gagal membuat transaksi Midtrans."
    );
  }
  return data.token as string;
}

/** Verifikasi signature notifikasi webhook Midtrans. */
export function verifySignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  serverKey: string;
  signatureKey: string;
}) {
  const expected = crypto
    .createHash("sha512")
    .update(params.orderId + params.statusCode + params.grossAmount + params.serverKey)
    .digest("hex");
  return expected === params.signatureKey;
}
