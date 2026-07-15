import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email dan kata sandi wajib diisi." }, { status: 400 });
  }
  const user = await db.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }
  await createSession({
    uid: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "ADMIN" | "CUSTOMER",
  });
  return NextResponse.json({ ok: true, role: user.role });
}
