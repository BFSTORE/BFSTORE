import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mailer";

/**
 * Minta tautan reset kata sandi.
 * Respons selalu generik (tidak membocorkan apakah email terdaftar).
 */
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  }

  const genericOk = {
    ok: true,
    message:
      "Jika email terdaftar, tautan reset kata sandi sudah dikirim. Periksa kotak masuk (dan folder spam) ya.",
  };

  const user = await db.user.findUnique({
    where: { email: String(email).toLowerCase().trim() },
  });
  if (!user) return NextResponse.json(genericOk);

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await db.user.update({
    where: { id: user.id },
    data: {
      resetToken: tokenHash,
      resetTokenExp: new Date(Date.now() + 60 * 60 * 1000), // 1 jam
    },
  });

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const resetLink = `${proto}://${host}/reset-password/${token}`;

  const result = await sendPasswordResetEmail(user.email, user.name, resetLink).catch(() => ({
    sent: false as const,
    reason: "Gagal mengirim email",
  }));

  if (!result.sent) {
    // Layanan email belum aktif — arahkan pelanggan ke CS, jangan biarkan buntu
    return NextResponse.json({
      ok: true,
      message:
        "Layanan email sedang tidak tersedia. Silakan hubungi CS BFSTORE via WhatsApp untuk bantuan reset kata sandi.",
    });
  }

  return NextResponse.json(genericOk);
}
