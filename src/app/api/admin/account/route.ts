import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession, createSession } from "@/lib/auth";

/** Ubah profil admin (nama, email, password). Wajib konfirmasi password saat ini. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const b = await req.json();
  const user = await db.user.findUnique({ where: { id: session.uid } });
  if (!user) return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });

  if (!b.currentPassword || !(await bcrypt.compare(String(b.currentPassword), user.password))) {
    return NextResponse.json({ error: "Password saat ini salah." }, { status: 401 });
  }

  const data: { name?: string; email?: string; password?: string } = {};
  if (b.name?.trim()) data.name = String(b.name).trim();
  if (b.email?.trim()) {
    const email = String(b.email).toLowerCase().trim();
    const taken = await db.user.findUnique({ where: { email } });
    if (taken && taken.id !== user.id) {
      return NextResponse.json({ error: "Email sudah dipakai akun lain." }, { status: 409 });
    }
    data.email = email;
  }
  if (b.newPassword) {
    if (String(b.newPassword).length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
    }
    data.password = await bcrypt.hash(String(b.newPassword), 10);
  }

  const updated = await db.user.update({ where: { id: user.id }, data });
  await createSession({
    uid: updated.id,
    name: updated.name,
    email: updated.email,
    role: "ADMIN",
  });

  return NextResponse.json({ ok: true });
}
