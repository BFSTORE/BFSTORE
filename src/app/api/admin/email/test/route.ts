import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin-route";
import { getSession } from "@/lib/auth";
import { sendTestEmail } from "@/lib/mailer";

/** Kirim email tes ke alamat admin yang sedang login; kembalikan error asli bila gagal. */
export async function POST(req: Request) {
  return withAdmin(async () => {
    const body = await req.json().catch(() => ({}));
    const session = await getSession();
    const to = String(body.to ?? session?.email ?? "").trim();
    if (!to) return NextResponse.json({ error: "Alamat tujuan tidak ada." }, { status: 400 });

    const result = await sendTestEmail(to);
    if (!result.sent) {
      return NextResponse.json({ error: `Gagal kirim: ${result.error}` }, { status: 502 });
    }
    return NextResponse.json({ ok: true, message: `Email tes terkirim ke ${to}. Cek kotak masuk!` });
  });
}
