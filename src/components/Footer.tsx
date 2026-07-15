import Link from "next/link";
import { ShieldCheck, Zap, HeadphonesIcon } from "lucide-react";
import Logo from "./Logo";

function InstagramIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line/60 bg-surface/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo className="text-2xl" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            BFSTORE adalah platform top up game tercepat dan terpercaya di Indonesia. Proses
            otomatis 24 jam dengan harga terbaik langsung dari distributor resmi.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { icon: Zap, text: "Proses Instan" },
              { icon: ShieldCheck, text: "100% Aman" },
              { icon: HeadphonesIcon, text: "CS 24 Jam" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2 text-xs font-medium text-muted">
                <Icon size={14} className="text-brand" aria-hidden /> {text}
              </span>
            ))}
          </div>
          <a
            href="https://instagram.com/bfstoredotid"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2.5 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm font-semibold transition hover:border-brand/40 hover:text-brand-soft"
          >
            <InstagramIcon size={16} className="text-brand" />
            Follow @bfstoredotid
            <span className="hidden font-normal text-muted sm:inline">— info & promo terbaru</span>
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Menu</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/" className="transition hover:text-brand-soft">Beranda</Link></li>
            <li><a href="/#games" className="transition hover:text-brand-soft">Semua Game</a></li>
            <li><Link href="/cek-transaksi" className="transition hover:text-brand-soft">Cek Transaksi</Link></li>
            <li><Link href="/kalkulator" className="transition hover:text-brand-soft">Kalkulator</Link></li>
            <li><Link href="/syarat-ketentuan" className="transition hover:text-brand-soft">Syarat & Ketentuan</Link></li>
            <li><Link href="/login" className="transition hover:text-brand-soft">Masuk / Daftar</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Bantuan</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>WhatsApp: 0812-3456-7890</li>
            <li>Email: cs@bfstore.id</li>
            <li>Jam operasional: 24 jam</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/60 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} BFSTORE. Semua hak dilindungi.
      </div>
    </footer>
  );
}
