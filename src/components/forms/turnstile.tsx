"use client";

import Script from "next/script";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Cloudflare Turnstile widget, rendered explicitly on the client. Explicit rendering (instead of the
 * `.cf-turnstile` auto-scan) is what makes it work after client-side navigation, when api.js is
 * already on the page, and it keeps the theme out of the server HTML — next-themes only knows the
 * resolved theme in the browser, so a themed server render would hydrate with a mismatch.
 * The widget injects the hidden `cf-turnstile-response` input the action verifies.
 * Renders nothing when no site key is configured.
 */
export function Turnstile() {
  const { resolvedTheme } = useTheme();
  const container = useRef<HTMLDivElement>(null);
  // Already loaded when the visitor arrives via client-side navigation; otherwise set by onReady.
  const [ready, setReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );

  useEffect(() => {
    const el = container.current;
    const api = window.turnstile;
    if (!ready || !el || !api || !SITE_KEY) return;
    const id = api.render(el, {
      sitekey: SITE_KEY,
      theme: resolvedTheme === "dark" ? "dark" : "light",
      size: "flexible",
    });
    return () => api.remove(id);
  }, [ready, resolvedTheme]);

  if (!SITE_KEY) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onReady={() => setReady(true)}
      />
      <div ref={container} data-turnstile="" className="min-h-16" />
    </>
  );
}
