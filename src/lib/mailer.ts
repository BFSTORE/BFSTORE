import nodemailer from "nodemailer";
import { getSettings } from "./settings";
import { formatIDR } from "./utils";

type OrderForEmail = {
  invoice: string;
  gameName: string;
  productName: string;
  customerNo: string;
  contact: string;
  amount: number;
  discount: number;
  total: number;
  status: string;
  createdAt: Date;
};

function isEmail(text: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
}

/**
 * Kirim invoice ke email pelanggan lewat Gmail (cs@bfstore.id).
 * Diam-diam dilewati bila email belum dikonfigurasi atau kontak bukan email.
 */
export async function sendInvoiceEmail(order: OrderForEmail, kind: "created" | "success") {
  const s = await getSettings();
  const user = s.smtpUser?.trim();
  const pass = s.smtpPass?.trim();
  if (s.emailEnabled !== "1" || !user || !pass) return { sent: false, reason: "Email belum dikonfigurasi" };
  if (!isEmail(order.contact)) return { sent: false, reason: "Kontak pelanggan bukan email" };

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  const title =
    kind === "success" ? "Pesanan Berhasil — Terima kasih!" : "Invoice Pesanan Kamu";
  const intro =
    kind === "success"
      ? "Top up kamu sudah berhasil diproses. Berikut rincian transaksinya:"
      : "Terima kasih sudah berbelanja di BFSTORE! Berikut rincian pesananmu:";

  const rows = [
    ["Invoice", order.invoice],
    ["Game", order.gameName],
    ["Item", order.productName],
    ["ID Tujuan", order.customerNo],
    ["Tanggal", order.createdAt.toLocaleString("id-ID")],
    ["Harga", formatIDR(order.amount)],
    ...(order.discount > 0 ? [["Diskon", `−${formatIDR(order.discount)}`]] : []),
    ["Total", formatIDR(order.total)],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#64748b;font-size:14px">${k}</td><td style="padding:6px 12px;font-size:14px;font-weight:600;text-align:right">${v}</td></tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px">
    <h2 style="font-style:italic;margin:0 0 4px">BF<span style="color:#16a34a">STORE</span></h2>
    <h3 style="margin:16px 0 4px">${title}</h3>
    <p style="color:#475569;font-size:14px;line-height:1.6">${intro}</p>
    <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:12px;overflow:hidden;margin:16px 0">${rows}</table>
    <p style="color:#475569;font-size:13px;line-height:1.6">
      Cek status pesananmu kapan saja di halaman <b>Cek Transaksi</b> dengan nomor invoice di atas.
      Butuh bantuan? Cukup balas email ini — tim CS kami siap membantu.
    </p>
    <p style="color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} BFSTORE — Top up game cepat & terpercaya</p>
  </div>`;

  await transporter.sendMail({
    from: `"BFSTORE" <${user}>`,
    to: order.contact.trim(),
    subject: `${kind === "success" ? "✔ Berhasil" : "Invoice"} ${order.invoice} — ${order.gameName} ${order.productName}`,
    html,
  });
  return { sent: true };
}

/** Kirim tautan reset kata sandi. Mengembalikan sent:false bila email belum dikonfigurasi. */
export async function sendPasswordResetEmail(to: string, name: string, resetLink: string) {
  const s = await getSettings();
  const user = s.smtpUser?.trim();
  const pass = s.smtpPass?.trim();
  if (s.emailEnabled !== "1" || !user || !pass) {
    return { sent: false, reason: "Email belum dikonfigurasi" };
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px">
    <h2 style="font-style:italic;margin:0 0 4px">BF<span style="color:#16a34a">STORE</span></h2>
    <h3 style="margin:16px 0 4px">Reset Kata Sandi</h3>
    <p style="color:#475569;font-size:14px;line-height:1.6">
      Halo ${name}, kami menerima permintaan untuk mengganti kata sandi akun BFSTORE kamu.
      Klik tombol di bawah untuk membuat kata sandi baru. Tautan ini berlaku selama <b>1 jam</b>.
    </p>
    <p style="text-align:center;margin:24px 0">
      <a href="${resetLink}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px">
        Buat Kata Sandi Baru
      </a>
    </p>
    <p style="color:#475569;font-size:13px;line-height:1.6">
      Kalau tombol tidak berfungsi, salin tautan ini ke browser:<br>
      <a href="${resetLink}" style="color:#16a34a;word-break:break-all">${resetLink}</a>
    </p>
    <p style="color:#475569;font-size:13px;line-height:1.6">
      Tidak merasa meminta reset? Abaikan email ini — kata sandimu tetap aman.
    </p>
    <p style="color:#94a3b8;font-size:12px">© ${new Date().getFullYear()} BFSTORE — Top up game cepat & terpercaya</p>
  </div>`;

  await transporter.sendMail({
    from: `"BFSTORE" <${user}>`,
    to: to.trim(),
    subject: "Reset Kata Sandi BFSTORE",
    html,
  });
  return { sent: true };
}
