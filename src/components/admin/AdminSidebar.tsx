"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Gamepad2,
  Images,
  TicketPercent,
  ReceiptText,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Zap,
  Users,
  UserCog,
} from "lucide-react";
import Logo from "../Logo";

const items = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/games", label: "Game & Produk", icon: Gamepad2 },
  { href: "/admin/banners", label: "Slideshow Banner", icon: Images },
  { href: "/admin/flashsale", label: "Flash Sale", icon: Zap },
  { href: "/admin/promos", label: "Kode Promo", icon: TicketPercent },
  { href: "/admin/orders", label: "Pesanan", icon: ReceiptText },
  { href: "/admin/customers", label: "Pelanggan", icon: Users },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
  { href: "/admin/account", label: "Akun Admin", icon: UserCog },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Menu admin">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              active ? "bg-brand/12 text-brand-soft" : "text-muted hover:bg-surface-2 hover:text-ink"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={17} aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );

  const bottom = (
    <div className="border-t border-line px-3 py-4">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
      >
        <ExternalLink size={17} aria-hidden /> Lihat Toko
      </Link>
      <button
        onClick={logout}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-surface-2"
      >
        <LogOut size={17} aria-hidden /> Keluar
      </button>
      <p className="mt-3 truncate px-4 text-xs text-muted">Masuk sebagai {adminName}</p>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface px-4 md:hidden">
        <Logo className="text-lg" />
        <button
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer rounded-lg p-2 text-muted"
          aria-label={open ? "Tutup menu" : "Buka menu"}
        >
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="mt-14 flex h-[calc(100dvh-3.5rem)] w-72 flex-col bg-surface pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            {nav}
            {bottom}
          </div>
        </div>
      )}
      <div className="h-14 md:hidden" aria-hidden />

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/60 md:flex">
        <div className="px-6 py-6">
          <Logo className="text-xl" />
          <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-muted">Panel Admin</p>
        </div>
        {nav}
        {bottom}
      </aside>
    </>
  );
}
