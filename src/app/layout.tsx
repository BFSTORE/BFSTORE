import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "BFSTORE — Top Up Game Cepat & Terpercaya",
    template: "%s · BFSTORE",
  },
  description:
    "BFSTORE: top up Mobile Legends, Free Fire, PUBG, Genshin Impact, dan game favoritmu. Proses instan 24 jam, harga terbaik, pembayaran aman.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
