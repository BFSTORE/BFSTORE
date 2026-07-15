# Panduan Deploy BFSTORE

## Penting: soal WordPress

Website ini **bukan** WordPress dan **tidak bisa di-migrate ke WordPress**. Keduanya teknologi
yang berbeda total:

| | BFSTORE (website ini) | WordPress |
|---|---|---|
| Teknologi | Next.js (Node.js + React) | PHP + MySQL |
| Dashboard | Custom (Digiflazz, flash sale, dll.) | Plugin pihak ketiga |
| Hosting | Hosting Node.js / Vercel | Hosting PHP biasa |

Kalau dipaksakan pindah ke WordPress, semua fitur (integrasi Digiflazz, Midtrans, flash sale,
dashboard) harus dibangun ulang dari nol pakai plugin — hasilnya lebih lambat, lebih rapuh, dan
fiturnya tidak akan sama. **Yang kamu butuhkan bukan WordPress, tapi hosting** — dan pilihan
terbaiknya:

## Opsi 1 (Direkomendasikan): Vercel — GRATIS

Vercel adalah hosting resmi Next.js. Gratis untuk memulai, dapat subdomain
`namatoko.vercel.app`, dan bisa pasang domain sendiri (mis. `bfstore.id`).

1. Buat akun di [vercel.com](https://vercel.com) (login pakai GitHub).
2. Upload folder proyek ini ke repository GitHub (private).
3. Di Vercel: **Add New → Project** → pilih repo → Deploy.
4. Karena SQLite tidak awet di Vercel, ganti database ke **Turso** (SQLite cloud, gratis) atau
   **Neon** (Postgres, gratis):
   - Ubah `datasource` di `prisma/schema.prisma`
   - Isi `DATABASE_URL` di Environment Variables Vercel
5. Tambahkan Environment Variables: `DATABASE_URL`, `AUTH_SECRET` (string acak yang panjang).
6. Selesai — otomatis dapat HTTPS.

## Opsi 2: VPS (Niagahoster / IDCloudHost / DomaiNesia)

Kalau kamu sudah punya VPS Node.js:

```bash
# di server
git clone <repo kamu> bfstore && cd bfstore
npm install
npx prisma db push && npx tsx prisma/seed.ts
npm run build
npm start          # atau pakai pm2: pm2 start npm --name bfstore -- start
```

Arahkan domain ke server + pasang Nginx sebagai reverse proxy ke port 3000.

> Catatan: shared hosting biasa (cPanel PHP) TIDAK bisa menjalankan situs ini.
> Pastikan paket hostingmu mendukung **Node.js**.

## Setelah online — checklist wajib

1. **Midtrans**: dashboard Midtrans → Settings → Configuration →
   **Payment Notification URL** = `https://domainkamu.com/api/midtrans/notify`
2. **Ganti password admin** lewat Dashboard → Akun Admin (default `admin123` — WAJIB diganti).
3. **Regenerate Server Key Midtrans** (karena sempat terfoto/terbagikan) lalu tempel yang baru
   di Dashboard → Pengaturan.
4. **Email Gmail**: buat App Password di https://myaccount.google.com/apppasswords
   (akun `cs@bfstore.id` harus punya verifikasi 2 langkah), tempel di Dashboard → Pengaturan →
   Email Invoice, lalu aktifkan.
5. **Digiflazz**: isi username & API key di Dashboard → Pengaturan, uji koneksi, lalu Sync produk.
6. Ganti `AUTH_SECRET` di `.env` dengan string acak panjang.

## Akun bawaan

| Peran | Email | Password |
|---|---|---|
| Admin | admin@bfstore.id | admin123 *(segera ganti!)* |
| Customer demo | demo@bfstore.id | customer123 |
