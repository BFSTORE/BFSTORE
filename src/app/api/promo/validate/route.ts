import { NextResponse } from "next/server";
import { computeDiscount } from "@/lib/promo";
import { formatIDR } from "@/lib/utils";

export async function POST(req: Request) {
  const { code, amount } = await req.json();
  if (!code || !amount) return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });

  const result = await computeDiscount(String(code), Number(amount));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({
    discount: result.discount,
    message: `Hemat ${formatIDR(result.discount)} dengan kode ini!`,
  });
}
