"use client";

/**
 * reCAPTCHA v3 (invisible) — tanpa checkbox. Panggil executeRecaptcha(siteKey, action)
 * saat submit untuk mendapatkan token; server memverifikasi skor di belakang layar.
 */

type GrecaptchaV3 = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: GrecaptchaV3;
  }
}

let loadingPromise: Promise<void> | null = null;

function loadScript(siteKey: string): Promise<void> {
  if (window.grecaptcha) return Promise.resolve();
  if (loadingPromise) return loadingPromise;
  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat reCAPTCHA"));
    document.head.appendChild(script);
  });
  return loadingPromise;
}

/** Ambil token reCAPTCHA v3. Mengembalikan "" bila siteKey kosong (fitur nonaktif). */
export async function executeRecaptcha(siteKey: string, action: string): Promise<string> {
  if (!siteKey) return "";
  try {
    await loadScript(siteKey);
    await new Promise<void>((r) => window.grecaptcha!.ready(r));
    return await window.grecaptcha!.execute(siteKey, { action });
  } catch {
    return "";
  }
}

/** Teks atribusi yang diwajibkan Google saat badge disembunyikan/tidak menonjol. */
export default function RecaptchaNotice({ siteKey }: { siteKey: string }) {
  if (!siteKey) return null;
  return (
    <p className="text-center text-[11px] leading-relaxed text-muted/70">
      Dilindungi reCAPTCHA —{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:underline"
      >
        Privasi
      </a>{" "}
      &{" "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:underline"
      >
        Ketentuan
      </a>{" "}
      Google berlaku.
    </p>
  );
}
