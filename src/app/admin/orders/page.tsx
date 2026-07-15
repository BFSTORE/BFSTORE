import { db } from "@/lib/db";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { product: { select: { sku: true } } },
  });

  return (
    <OrdersClient
      orders={orders.map((o) => ({
        id: o.id,
        invoice: o.invoice,
        gameName: o.gameName,
        productName: o.productName,
        customerNo: o.customerNo,
        contact: o.contact,
        total: o.total,
        promoCode: o.promoCode,
        status: o.status,
        note: o.note,
        hasSku: Boolean(o.product?.sku),
        createdAt: o.createdAt.toISOString(),
      }))}
    />
  );
}
