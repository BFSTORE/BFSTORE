import { getSettings } from "./settings";

/** Site key untuk widget di halaman — kosong berarti reCAPTCHA nonaktif. */
export async function getRecaptchaSiteKey(): Promise<string> {
  const s = await getSettings();
  return s.recaptchaEnabled === "1" ? (s.recaptchaSiteKey ?? "").trim() : "";
}

/** Verifikasi token reCAPTCHA di server. Selalu lolos bila fitur nonaktif. */
export async function verifyRecaptcha(token: string | null | undefined) {
  const s = await getSettings();
  const secret = s.recaptchaSecretKey?.trim();
  if (s.recaptchaEnabled !== "1" || !secret) return { ok: true as const };
  if (!token)
    return { ok: false as const, error: "Verifikasi keamanan gagal dimuat. Muat ulang halaman lalu coba lagi." };

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json();
    // v3 menyertakan skor 0–1; di bawah 0.3 dianggap bot
    if (data.success && (data.score === undefined || data.score >= 0.3)) return { ok: true as const };
    return { ok: false as const, error: "Verifikasi keamanan menolak permintaan ini. Coba lagi ya." };
  } catch {
    // Bila Google tidak bisa dihubungi, jangan blokir pengguna sah
    return { ok: true as const };
  }
}
