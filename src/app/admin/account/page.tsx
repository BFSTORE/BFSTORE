import { getSession } from "@/lib/auth";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await getSession();
  return <AccountClient name={session?.name ?? ""} email={session?.email ?? ""} />;
}
