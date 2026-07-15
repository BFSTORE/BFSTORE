import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin-route";
import { fetchPriceList } from "@/lib/digiflazz";

/** Uji koneksi Digiflazz & tampilkan daftar brand yang tersedia. */
export async function GET() {
  return withAdmin(async () => {
    const list = await fetchPriceList();
    const brands = [...new Set(list.map((i) => i.brand))].sort();
    return NextResponse.json({ ok: true, total: list.length, brands });
  });
}
