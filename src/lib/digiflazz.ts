import crypto from "crypto";
import { getSettings } from "./settings";

const BASE_URL = "https://api.digiflazz.com/v1";

function md5(text: string) {
  return crypto.createHash("md5").update(text).digest("hex");
}

export type DigiPriceItem = {
  product_name: string;
  category: string;
  brand: string;
  type: string;
  seller_name: string;
  price: number;
  buyer_sku_code: string;
  buyer_product_status: boolean;
  seller_product_status: boolean;
  desc: string;
};

async function getCredentials() {
  const s = await getSettings();
  const username = s.digiflazzUsername?.trim();
  const apiKey = s.digiflazzApiKey?.trim();
  if (!username || !apiKey) {
    throw new Error(
      "Kredensial Digiflazz belum diisi. Buka Dashboard → Pengaturan lalu masukkan username & API key Digiflazz kamu."
    );
  }
  return { username, apiKey, mode: s.digiflazzMode || "dev" };
}

/** Ambil daftar harga prepaid dari Digiflazz. */
export async function fetchPriceList(): Promise<DigiPriceItem[]> {
  const { username, apiKey } = await getCredentials();
  const res = await fetch(`${BASE_URL}/price-list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "prepaid",
      username,
      sign: md5(username + apiKey + "pricelist"),
    }),
  });
  if (!res.ok) throw new Error(`Digiflazz merespons dengan status ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json.data)) {
    throw new Error(json.data?.message ?? "Respons Digiflazz tidak valid");
  }
  return json.data as DigiPriceItem[];
}

/** Kirim transaksi top up ke Digiflazz. */
export async function createTopup(params: { refId: string; sku: string; customerNo: string }) {
  const { username, apiKey, mode } = await getCredentials();
  const body: Record<string, unknown> = {
    username,
    buyer_sku_code: params.sku,
    customer_no: params.customerNo,
    ref_id: params.refId,
    sign: md5(username + apiKey + params.refId),
  };
  if (mode === "dev") body.testing = true;

  const res = await fetch(`${BASE_URL}/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  const data = json.data ?? {};
  return {
    status: (data.status as string) ?? "Gagal",
    message: (data.message as string) ?? "Tidak ada respons",
    sn: (data.sn as string) ?? "",
    raw: data,
  };
}
