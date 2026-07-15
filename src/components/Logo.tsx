import Link from "next/link";

export default function Logo({ className = "text-xl" }: { className?: string }) {
  return (
    <Link href="/" aria-label="BFSTORE — Beranda" className="inline-flex items-center">
      <span className={`font-heading font-extrabold italic tracking-tight ${className}`}>
        BF<span className="text-brand">STORE</span>
      </span>
    </Link>
  );
}
