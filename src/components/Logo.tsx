import Link from "next/link";

/** Wordmark BFSTORE (gambar logo resmi). Atur ukuran lewat className tinggi, mis. "h-7". */
export default function Logo({ className = "h-6" }: { className?: string }) {
  return (
    <Link href="/" aria-label="BFSTORE — Beranda" className="inline-flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-wide.svg" alt="BFSTORE" className={`w-auto ${className}`} />
    </Link>
  );
}
