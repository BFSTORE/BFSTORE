import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Semua kolom wajib diisi." }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: "Kata sandi minimal 6 karakter." }, { status: 400 });
  }
  const cleanEmail = String(email).toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
  }
  const user = await db.user.create({
    data: {
      name: String(name).trim(),
      email: cleanEmail,
      password: await bcrypt.hash(password, 10),
    },
  });
  await createSession({ uid: user.id, name: user.name, email: user.email, role: "CUSTOMER" });
  return NextResponse.json({ ok: true });
}
