import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Dashboard Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar adminName={session.name} />
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
