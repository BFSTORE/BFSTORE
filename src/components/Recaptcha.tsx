"use client";

import { useEffect, useRef } from "react";

/**
 * Dukungan ganda reCAPTCHA:
 * - v2 "I'm not a robot" Checkbox → widget terlihat, user mencentang
 * - v3 (invisible)                → token diambil diam-diam saat submit
 * Versi diatur dari Dashboard → Pengaturan → reCAPTCHA.
 */

export type RecaptchaConfig = { siteKey: string; version: "v2" | "v3" };

type GrecaptchaApi = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
  render: (el: HTMLElement, opts: { sitekey: string; theme?: string }) => number;
  getResponse: (id?: number) => string;
  reset: (id?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: GrecaptchaApi;
    __onRecaptchaLoad?: () => void;
  }
}

let loadingPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  if (window.grecaptcha) return Promise.resolve();
  if (loadingPromise) return loadingPromise;
  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat reCAPTCHA"));
    document.head.appendChild(script);
  });
  return loadingPromise;
}

/** Ambil token saat submit. Mengembalikan "" bila fitur nonaktif; null bila v2 belum dicentang. */
export async function getRecaptchaToken(rc: RecaptchaConfig, action: string): Promise<string | null> {
  if (!rc.siteKey) return "";
  try {
    if (rc.version === "v2") {
      const token = window.grecaptcha?.getResponse() ?? "";
      return token || null; // null = user belum mencentang
    }
    await loadScript(`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(rc.siteKey)}`);
    await new Promise<void>((r) => window.grecaptcha!.ready(r));
    return await window.grecaptcha!.execute(rc.siteKey, { action });
  } catch {
    return "";
  }
}

export function resetRecaptcha() {
  try {
    window.grecaptcha?.reset();
  } catch {
    /* belum dirender */
  }
}

/** Widget (v2) atau teks atribusi (v3). Taruh di dalam form. */
export default function RecaptchaField({ rc }: { rc: RecaptchaConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    if (!rc.siteKey || rc.version !== "v2") return;
    const render = () => {
      if (ref.current && window.grecaptcha?.render && widgetId.current === null) {
        try {
          widgetId.current = window.grecaptcha.render(ref.current, {
            sitekey: rc.siteKey,
            theme: "dark",
          });
        } catch {
          /* sudah dirender */
        }
      }
    };
    if (window.grecaptcha?.render) {
      render();
    } else {
      window.__onRecaptchaLoad = render;
      loadScript("https://www.google.com/recaptcha/api.js?render=explicit&onload=__onRecaptchaLoad").catch(() => {});
    }
  }, [rc.siteKey, rc.version]);

  if (!rc.siteKey) return null;

  if (rc.version === "v2") {
    return <div ref={ref} className="flex justify-center" />;
  }

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
