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
 * Cloudflare Turnstile, rendered explicitly and only once the visitor touches the form.
 *
 * Why explicit: the `.cf-turnstile` auto-scan never re-runs after a client-side navigation, and a
 * server-rendered `data-theme` hydration-mismatches because next-themes only resolves the theme in
 * the browser.
 *
 * Why deferred: api.js plus the challenge document add roughly 650 ms to the critical path, which
 * cost /services and /contact about 14 Lighthouse performance points. The token is only needed at
 * submit time, so the widget arms on the first focus or pointer press inside the form. By the time
 * anyone has typed a name the token is ready, and a page that is only read never pays for it.
 *
 * The container keeps its height either way, so arming causes no layout shift.
 * Renders nothing when no site key is configured.
 */
export function Turnstile() {
  const { resolvedTheme } = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );

  // Arm on the first interaction anywhere in the surrounding form.
  useEffect(() => {
    const form = container.current?.closest("form");
    if (!form || armed) return;
    const arm = () => setArmed(true);
    form.addEventListener("focusin", arm, { once: true });
    form.addEventListener("pointerdown", arm, { once: true });
    return () => {
      form.removeEventListener("focusin", arm);
      form.removeEventListener("pointerdown", arm);
    };
  }, [armed]);

  useEffect(() => {
    const el = container.current;
    const api = window.turnstile;
    if (!armed || !ready || !el || !api || !SITE_KEY) return;
    const id = api.render(el, {
      sitekey: SITE_KEY,
      theme: resolvedTheme === "dark" ? "dark" : "light",
      size: "flexible",
    });
    return () => api.remove(id);
  }, [armed, ready, resolvedTheme]);

  if (!SITE_KEY) return null;
  return (
    <>
      {armed ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="lazyOnload"
          onReady={() => setReady(true)}
        />
      ) : null}
      {/* 4.75rem clears the rendered flexible widget (72.4px measured), so arming shifts nothing. */}
      <div ref={container} data-turnstile="" className="min-h-[4.75rem]" />
    </>
  );
}
