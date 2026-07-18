import { db } from "@/lib/db";
import PromosClient from "./PromosClient";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const promos = await db.promoCode.findMany({ orderBy: { id: "desc" } });
  return (
    <PromosClient
      promos={promos.map((p) => ({
        id: p.id,
        code: p.code,
        type: p.type as "PERCENT" | "FIXED",
        value: p.value,
        maxDiscount: p.maxDiscount,
        minPurchase: p.minPurchase,
        usageLimit: p.usageLimit,
        usedCount: p.usedCount,
        expiresAt: p.expiresAt ? p.expiresAt.toISOString().slice(0, 10) : "",
        isActive: p.isActive,
      }))}
    />
  );
}
