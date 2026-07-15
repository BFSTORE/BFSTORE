# Panduan Deploy BFSTORE ke Vercel (Gratis)

> Git repo lokal sudah disiapkan dan di-commit. Ikuti langkah di bawah secara berurutan.

## Tahap 1 — Upload ke GitHub

1. Buat akun di **github.com** (kalau belum punya).
2. Klik tombol **+** (kanan atas) → **New repository**:
   - Repository name: `bfstore`
   - Pilih **Private** (penting! jangan Public)
   - JANGAN centang "Add a README"
   - Klik **Create repository**
3. Buka terminal (PowerShell) di folder `bfstore`, jalankan
   (ganti `USERNAME` dengan username GitHub kamu):

   ```
   git remote add origin https://github.com/USERNAME/bfstore.git
   git branch -M main
   git push -u origin main
   ```

   Saat push pertama, browser akan terbuka minta login GitHub — login saja, lalu push berjalan otomatis.

## Tahap 2 — Deploy di Vercel

1. Buat akun di **vercel.com** → pilih **Continue with GitHub**.
2. Klik **Add New… → Project** → pilih repo **bfstore** → **Import**.
3. JANGAN klik Deploy dulu — buka bagian **Environment Variables**, isi:
   - `AUTH_SECRET` = teks acak panjang (minimal 32 karakter, bebas — contoh hasil generator password)
   - `DATABASE_URL` = (diisi di Tahap 3)
4. Lanjut ke Tahap 3 dulu untuk dapat `DATABASE_URL`.

## Tahap 3 — Buat Database (Postgres gratis)

Website ini butuh database cloud karena Vercel tidak menyimpan file SQLite.

1. Di dashboard Vercel → tab **Storage** → **Create Database** → pilih **Postgres (Neon)** → Create.
2. Hubungkan ke project `bfstore` saat ditanya.
3. Salin **connection string**-nya (mulai dengan `postgres://…`).
4. Pastikan variabel `DATABASE_URL` di project berisi connection string itu
   (biasanya otomatis terisi saat database dihubungkan).

**PENTING:** schema Prisma saat ini masih SQLite. Sebelum deploy final, ubah
`prisma/schema.prisma` bagian datasource menjadi:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Lalu commit & push (`git add -A && git commit -m "switch ke postgres" && git push`).
(Atau minta Claude yang mengubahkan — tinggal bilang.)

## Tahap 4 — Isi Data Awal

Dari komputer kamu (folder bfstore), arahkan sementara ke database cloud:

1. Ganti isi `DATABASE_URL` di file `.env` lokal dengan connection string Neon.
2. Jalankan:
   ```
   npx prisma db push
   npm run db:seed
   ```
   Ini membuat tabel + mengisi game, admin, banner, dll. ke database produksi.
3. Klik **Deploy** (atau **Redeploy**) di Vercel. Website online di `bfstore.vercel.app`.

## Tahap 5 — Sambungkan Domain Niagahoster

1. Vercel → project bfstore → **Settings → Domains** → masukkan domainmu (mis. `bfstore.id`).
2. Vercel menampilkan record DNS (A record `76.76.21.21` / CNAME `cname.vercel-dns.com`).
3. Login Niagahoster → kelola domain → **DNS Management** → tambahkan record sesuai petunjuk Vercel.
4. Tunggu 5–60 menit sampai status di Vercel jadi "Valid".

## Tahap 6 — Konfigurasi Produksi (WAJIB)

1. **Midtrans**: dashboard.midtrans.com → Settings → Configuration →
   **Payment Notification URL** isi: `https://DOMAINMU/api/midtrans/notify`
2. **Ganti password admin** lewat Dashboard → Akun Admin (jangan pakai admin123!).
3. **Regenerate Server Key Midtrans** (karena pernah terbagi di chat/screenshot),
   lalu perbarui di Dashboard → Pengaturan.
4. **Email Gmail**: buat App Password di myaccount.google.com/apppasswords
   (akun cs@bfstore.id harus aktif 2FA), isi di Pengaturan → Email.
5. Isi kredensial **Digiflazz** di Pengaturan, lalu whitelist IP? Tidak perlu —
   Digiflazz pakai signature, cukup username + API key production.

## Catatan Khusus Vercel

- **Upload gambar dashboard**: sudah didukung Vercel Blob. Supaya aktif, di
  dashboard Vercel → **Storage → Create Database → Blob** → hubungkan ke project
  `bfstore` → Redeploy. Token (`BLOB_READ_WRITE_TOKEN`) terpasang otomatis dan
  tombol Upload langsung berfungsi. (Gratis s.d. 1 GB.)
- Setiap kali kamu minta perubahan kode ke Claude: cukup `git push`, Vercel
  otomatis build & deploy ulang (±2 menit).
