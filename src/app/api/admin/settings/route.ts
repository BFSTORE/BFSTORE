import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin-route";
import { saveSettings } from "@/lib/settings";

export async function POST(req: Request) {
  return withAdmin(async () => {
    const body = await req.json();
    const allowed = [
      "storeName",
      "storeTagline",
      "whatsapp",
      "markupPercent",
      "digiflazzUsername",
      "digiflazzApiKey",
      "digiflazzMode",
      "midtransServerKey",
      "midtransClientKey",
      "midtransMode",
      "midtransEnabled",
      "smtpUser",
      "smtpPass",
      "emailEnabled",
      "recaptchaSiteKey",
      "recaptchaSecretKey",
      "recaptchaEnabled",
    ];
    const values: Record<string, string> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) values[key] = String(body[key]);
    }
    await saveSettings(values);
    return NextResponse.json({ ok: true });
  });
}
