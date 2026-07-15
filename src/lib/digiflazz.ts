import crypto from "crypto";
import { db } from "./db";
import { getSettings } from "./settings";

const BASE_URL = "https://api.digiflazz.com/v1";
const CACHE_KEY = "digiPriceListCache";
const CACHE_AT_KEY = "digiPriceListCacheAt";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit — hemat kuota pengecekan pricelist Digiflazz

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

async function readCache(): Promise<{ items: DigiPriceItem[]; ageMs: number } | null> {
  const rows = await db.setting.findMany({ where: { key: { in: [CACHE_KEY, CACHE_AT_KEY] } } });
  const cache = rows.find((r) => r.key === CACHE_KEY)?.value;
  const at = Number(rows.find((r) => r.key === CACHE_AT_KEY)?.value ?? 0);
  if (!cache || !at) return null;
  try {
    return { items: JSON.parse(cache) as DigiPriceItem[], ageMs: Date.now() - at };
  } catch {
    return null;
  }
}

async function writeCache(items: DigiPriceItem[]) {
  // Simpan hanya kolom yang dipakai supaya ukuran cache kecil
  const slim = items.map((i) => ({
    product_name: i.product_name,
    category: i.category,
    brand: i.brand,
    type: i.type,
    seller_name: "",
    price: i.price,
    buyer_sku_code: i.buyer_sku_code,
    buyer_product_status: i.buyer_product_status,
    seller_product_status: i.seller_product_status,
    desc: "",
  }));
  const value = JSON.stringify(slim);
  await db.setting.upsert({ where: { key: CACHE_KEY }, update: { value }, create: { key: CACHE_KEY, value } });
  const at = String(Date.now());
  await db.setting.upsert({ where: { key: CACHE_AT_KEY }, update: { value: at }, create: { key: CACHE_AT_KEY, value: at } });
}

/**
 * Ambil daftar harga prepaid dari Digiflazz — dengan cache 10 menit di database
 * agar tidak menabrak limitasi pengecekan pricelist Digiflazz. Bila Digiflazz
 * menolak (rate limit), cache lama tetap dipakai sebagai cadangan.
 */
export async function fetchPriceList(): Promise<DigiPriceItem[]> {
  const cached = await readCache();
  if (cached && cached.ageMs < CACHE_TTL_MS) return cached.items;

  const { username, apiKey } = await getCredentials();
  let items: DigiPriceItem[] | null = null;
  let failReason = "";
  try {
    const res = await fetch(`${BASE_URL}/price-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cmd: "prepaid",
        username,
        sign: md5(username + apiKey + "pricelist"),
      }),
    });
    if (!res.ok) {
      failReason = `Digiflazz merespons dengan status ${res.status}`;
    } else {
      const json = await res.json();
      if (Array.isArray(json.data)) items = json.data as DigiPriceItem[];
      else failReason = json.data?.message ?? "Respons Digiflazz tidak valid";
    }
  } catch {
    failReason = "Tidak bisa menghubungi Digiflazz.";
  }

  if (items) {
    await writeCache(items).catch(() => {});
    return items;
  }
  // Gagal (mis. kena rate limit) — pakai cache lama bila ada
  if (cached) return cached.items;
  throw new Error(failReason);
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
