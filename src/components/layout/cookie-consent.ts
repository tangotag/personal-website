"use client";

import { useSyncExternalStore } from "react";

/** The slice of the Cookiebot API this site reads. */
type CookiebotApi = { consent?: { statistics?: boolean } };

declare global {
  interface Window {
    Cookiebot?: CookiebotApi;
  }
}

/**
 * Cookiebot fires these on `window` once the visitor has a decision — on first choice, on a
 * change, and on every later page load from the stored consent.
 */
const EVENTS = ["CookiebotOnConsentReady", "CookiebotOnAccept", "CookiebotOnDecline"] as const;

function subscribe(cb: () => void) {
  for (const e of EVENTS) window.addEventListener(e, cb);
  return () => {
    for (const e of EVENTS) window.removeEventListener(e, cb);
  };
}

function read() {
  return window.Cookiebot?.consent?.statistics === true;
}

/**
 * Whether the visitor has allowed statistics cookies.
 *
 * Cookiebot's auto-blocking rewrites `<script src>` tags it finds in the HTML, but GA4 arrives
 * through `@next/third-parties`, which injects its tag from React after hydration — too late to be
 * rewritten. So the gate stays in React and reads Cookiebot's answer instead of keeping a second
 * record of it. Everything else the site loads is cookieless and needs no gate.
 *
 * The server snapshot is `false`: nothing is granted until Cookiebot says so, and a visitor who
 * blocks consent.cookiebot.com simply never gets GA4, which is the right way to fail.
 */
export function useStatisticsConsent() {
  return useSyncExternalStore(subscribe, read, () => false);
}
