"use client";

import { useEffect, useRef } from "react";

type Grecaptcha = {
  render: (el: HTMLElement, opts: { sitekey: string; theme?: string }) => number;
  getResponse: (id?: number) => string;
  reset: (id?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    __onRecaptchaLoad?: () => void;
  }
}

/** Widget checkbox reCAPTCHA v2. Ambil token dengan getRecaptchaToken() saat submit. */
export default function Recaptcha({ siteKey }: { siteKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    const render = () => {
      if (ref.current && window.grecaptcha?.render && widgetId.current === null) {
        try {
          widgetId.current = window.grecaptcha.render(ref.current, {
            sitekey: siteKey,
            theme: "dark",
          });
        } catch {
          // sudah pernah dirender (mis. hot reload) — abaikan
        }
      }
    };

    if (window.grecaptcha?.render) {
      render();
    } else {
      window.__onRecaptchaLoad = render;
      if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js?render=explicit&onload=__onRecaptchaLoad";
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={ref} className="flex justify-center" />;
}

export function getRecaptchaToken(): string {
  return window.grecaptcha?.getResponse() ?? "";
}

export function resetRecaptcha() {
  window.grecaptcha?.reset();
}
