import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText } from "lucide-react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan layanan top up game BFSTORE.",
};

const sections: { title: string; items: string[] }[] = [
  {
    title: "1. Ketentuan Umum",
    items: [
      "Dengan mendaftar akun dan/atau menggunakan layanan BFSTORE, kamu dianggap telah membaca, memahami, dan menyetujui seluruh isi Syarat & Ketentuan ini.",
      "Syarat & Ketentuan ini berlaku untuk seluruh pengguna dan pihak yang berinteraksi dengan sistem BFSTORE, baik melalui website maupun kanal resmi lainnya.",
      "Syarat & Ketentuan dapat berubah sewaktu-waktu mengikuti perkembangan layanan dan peraturan yang berlaku. Kami menyarankan kamu meninjau halaman ini secara berkala; penggunaan layanan setelah perubahan berarti kamu menyetujui ketentuan terbaru.",
    ],
  },
  {
    title: "2. Definisi",
    items: [
      "“Akun” adalah data pengguna terdaftar berupa nama, email, dan kata sandi yang dibuat saat pendaftaran.",
      "“Layanan” mencakup seluruh sistem BFSTORE beserta konten, fitur, dan fungsi di dalamnya, termasuk layanan hasil kerja sama dengan mitra resmi (antara lain distributor produk digital dan penyedia pembayaran).",
      "“Pengguna” adalah setiap orang yang mengakses sistem BFSTORE, baik terdaftar maupun tidak terdaftar.",
      "“Pembeli” adalah pengguna yang melakukan pembelian top up atau produk digital melalui BFSTORE.",
      "“Sistem BFSTORE” mencakup website resmi BFSTORE serta sistem lain yang dapat diakses melalui perangkat komputer maupun perangkat seluler.",
    ],
  },
  {
    title: "3. Akun & Tanggung Jawab Pengguna",
    items: [
      "Pengguna wajib menggunakan layanan BFSTORE dengan iktikad baik dan mematuhi peraturan perundang-undangan yang berlaku di Indonesia.",
      "Data yang diberikan saat mendaftar atau bertransaksi harus benar, jelas, akurat, dan terbaru.",
      "Kerahasiaan akun (email dan kata sandi) sepenuhnya menjadi tanggung jawab pengguna dan tidak boleh dibagikan kepada pihak ketiga. Segala aktivitas yang terjadi melalui akun dianggap dilakukan oleh pemilik akun.",
      "Pengguna dilarang menggunakan bot, script, atau metode otomatis lainnya untuk mengakses layanan BFSTORE.",
      "Layanan tidak boleh digunakan untuk tujuan melanggar hukum, merugikan pihak lain, atau merusak reputasi BFSTORE.",
      "Pengguna dilarang menggunakan logo, gambar, nama, dan elemen desain BFSTORE tanpa izin resmi.",
      "Pengguna wajib menghormati privasi dan hak cipta pihak lain, serta dilarang mengirimkan pesan spam melalui layanan BFSTORE.",
    ],
  },
  {
    title: "4. Transaksi",
    items: [
      "Setiap transaksi wajib mengikuti prosedur yang ditetapkan BFSTORE pada halaman pemesanan.",
      "Sebelum membeli, pengguna wajib membaca dan memahami informasi produk, harga, serta mengisi data tujuan (User ID / Zone ID / server) dengan benar. Kesalahan pengisian data tujuan oleh pengguna berada di luar tanggung jawab BFSTORE dan produk yang sudah terkirim tidak dapat ditarik kembali.",
      "Pembayaran diproses melalui mitra pembayaran resmi (Midtrans) dengan metode QRIS, virtual account, e-wallet, dan metode lain yang tersedia.",
      "Pesanan diproses otomatis setelah pembayaran terverifikasi. Apabila terjadi kendala, tim CS BFSTORE akan membantu penyelesaiannya.",
      "Transaksi yang dilakukan di luar sistem resmi BFSTORE (termasuk transfer pribadi ke pihak yang mengatasnamakan BFSTORE) bukan tanggung jawab BFSTORE.",
    ],
  },
  {
    title: "5. Pengembalian Dana (Refund)",
    items: [
      "Refund hanya berlaku apabila pesanan gagal diproses oleh sistem sedangkan pembayaran telah diterima.",
      "Refund tidak berlaku untuk kesalahan pengisian data tujuan oleh pengguna pada produk yang sudah berhasil terkirim.",
      "Untuk mengajukan refund, hubungi CS BFSTORE dengan menyertakan nomor invoice dan bukti pembayaran. Verifikasi tambahan dapat diminta demi keamanan.",
      "Dana yang disetujui untuk dikembalikan akan diproses ke rekening/metode pembayaran asal dalam jangka waktu yang wajar sesuai ketentuan mitra pembayaran.",
    ],
  },
  {
    title: "6. Pemrosesan Data Pengguna",
    items: [
      "Dengan menggunakan layanan BFSTORE, pengguna memberikan izin kepada BFSTORE untuk mengumpulkan, memproses, dan menggunakan data yang diberikan sebatas untuk keperluan layanan (pemrosesan pesanan, pengiriman bukti transaksi, dan dukungan pelanggan).",
      "BFSTORE menjaga kerahasiaan data pengguna sesuai standar yang berlaku dan tidak membagikannya kepada pihak ketiga, kecuali diwajibkan oleh hukum.",
      "BFSTORE berupaya maksimal menjaga keamanan sistem, namun tidak bertanggung jawab atas kebocoran data yang disebabkan oleh faktor teknis di luar kendali yang wajar.",
    ],
  },
  {
    title: "7. Penghentian Layanan",
    items: [
      "BFSTORE berhak membatasi, menangguhkan, atau menghentikan layanan kepada pengguna yang melanggar Syarat & Ketentuan ini.",
      "Pengguna berhak berhenti menggunakan layanan kapan saja dengan menghubungi CS BFSTORE.",
    ],
  },
  {
    title: "8. Kontak",
    items: [
      "Seluruh layanan pelanggan — pertanyaan, konfirmasi pembayaran, refund, hingga reset kata sandi — dilayani melalui email cs@bfstore.id sebagai kanal utama.",
      "WhatsApp CS hanya digunakan untuk kendala mendesak, misalnya pembayaran sudah terpotong namun pesanan gagal diproses.",
      "Info dan promo terbaru dapat diikuti melalui Instagram @bfstoredotid.",
    ],
  },
];

export default function SyaratKetentuanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <div className="text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10">
          <ScrollText size={22} className="text-brand" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-bold">Syarat & Ketentuan</h1>
        <p className="mt-2 text-sm text-muted">
          Berlaku untuk seluruh layanan BFSTORE. Terakhir diperbarui: 15 Juli 2026.
        </p>
      </div>

      <div className="mt-10 space-y-5">
        {sections.map((s) => (
          <section key={s.title} className="card p-6" aria-label={s.title}>
            <h2 className="font-semibold">{s.title}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {s.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Dengan menggunakan layanan BFSTORE, kamu menyetujui seluruh ketentuan di atas.{" "}
        <Link href="/" className="font-semibold text-brand-soft underline-offset-2 hover:underline">
          Kembali ke beranda
        </Link>
      </p>
    </div>
  );
}
