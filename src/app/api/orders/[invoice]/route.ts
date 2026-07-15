import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ invoice: string }> }
) {
  const { invoice } = await params;
  const order = await db.order.findUnique({ where: { invoice } });
  if (!order) return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });
  return NextResponse.json({
    invoice: order.invoice,
    status: order.status,
    gameName: order.gameName,
    productName: order.productName,
    total: order.total,
    createdAt: order.createdAt,
  });
}
