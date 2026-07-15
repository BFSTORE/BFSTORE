import { db } from "@/lib/db";
import BannersClient from "./BannersClient";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await db.banner.findMany({ orderBy: { sortOrder: "asc" } });
  return <BannersClient banners={banners} />;
}
