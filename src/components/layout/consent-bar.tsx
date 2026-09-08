"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

export type Consent = "granted" | "denied" | "unset";

const KEY = "raq:consent";
const EVENT = "raq:consent-change";

function read(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Consent state shared by the bar and the analytics loader. Server snapshot is "unset". */
export function useConsent() {
  const value = useSyncExternalStore(subscribe, read, () => "unset" as Consent);
  const set = useCallback((next: Exclude<Consent, "unset">) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable — treat as session-only */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [value, set] as const;
}

/**
 * Waits for the page to finish loading and then for an idle moment. The bar is not part of the
 * first view, and painting it during load made it Lighthouse's LCP element on 2026-09-08 — 2.4s
 * of render delay on a metric that should belong to the headline. Nothing is set before the
 * visitor chooses, so arriving a beat later costs no compliance.
 */
function useSettled() {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const idle = () => {
      const schedule =
        window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      schedule(() => {
        if (!cancelled) setSettled(true);
      });
    };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", idle);
    };
  }, []);
  return settled;
}

/**
 * One-line consent bar. Cloudflare's cookieless beacon always loads; GA4 only after "Allow".
 * Renders nothing until hydration so the server HTML never flashes the bar for returning visitors.
 */
export function ConsentBar() {
  const t = useTranslations("consent");
  const [consent, setConsent] = useConsent();
  const settled = useSettled();

  if (!settled || consent !== "unset" || !process.env.NEXT_PUBLIC_GA_ID) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-md border border-border bg-surface p-4 shadow-soft-lg md:inset-x-6 md:bottom-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-fg-muted">{t("text")}</p>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => setConsent("denied")}>
            {t("decline")}
          </Button>
          <Button onClick={() => setConsent("granted")}>{t("accept")}</Button>
        </div>
      </div>
    </div>
  );
}
