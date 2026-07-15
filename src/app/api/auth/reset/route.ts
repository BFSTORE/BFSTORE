import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/** Setel kata sandi baru memakai token dari email. */
export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: "Kata sandi minimal 6 karakter." }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");
  const user = await db.user.findFirst({
    where: { resetToken: tokenHash, resetTokenExp: { gt: new Date() } },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Tautan reset tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru." },
      { status: 400 }
    );
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(String(password), 10),
      resetToken: "",
      resetTokenExp: null,
    },
  });

  return NextResponse.json({ ok: true });
}
