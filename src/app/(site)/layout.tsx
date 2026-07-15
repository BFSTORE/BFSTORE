import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar session={session} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
