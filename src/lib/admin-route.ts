import { NextResponse } from "next/server";
import { getSession } from "./auth";

/** Bungkus handler API admin dengan pemeriksaan sesi ADMIN. */
export async function withAdmin<T>(handler: () => Promise<T>) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  try {
    return await handler();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Terjadi kesalahan server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
