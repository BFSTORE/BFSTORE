"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, User, LogOut, LayoutDashboard, ReceiptText } from "lucide-react";
import Logo from "./Logo";
import type { Session } from "@/lib/auth";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/cek-transaksi", label: "Cek Transaksi" },
  { href: "/kalkulator", label: "Kalkulator" },
];

export default function Navbar({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    setUserOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                pathname === l.href
                  ? "bg-brand/10 text-brand-soft"
                  : "text-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="/#games"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <Search size={15} aria-hidden /> Cari Game
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm font-medium transition hover:border-brand/40"
                aria-expanded={userOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand-soft">
                  {session.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:block">{session.name}</span>
              </button>
              {userOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-surface shadow-2xl shadow-black/40"
                >
                  {session.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-ink transition hover:bg-surface-2"
                    >
                      <LayoutDashboard size={16} className="text-brand" aria-hidden /> Dashboard Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    role="menuitem"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-ink transition hover:bg-surface-2"
                  >
                    <ReceiptText size={16} className="text-brand" aria-hidden /> Riwayat Transaksi
                  </Link>
                  <button
                    onClick={logout}
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left text-sm text-rose-300 transition hover:bg-surface-2"
                  >
                    <LogOut size={16} aria-hidden /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-ghost !px-4 !py-2">
              <User size={15} aria-hidden /> Masuk
            </Link>
          )}

          <button
            className="cursor-pointer rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line/60 px-4 py-3 md:hidden" aria-label="Navigasi mobile">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                pathname === l.href ? "bg-brand/10 text-brand-soft" : "text-muted"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
