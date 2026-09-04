"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { useConsent } from "@/components/layout/consent-bar";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CF_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

/**
 * Cloudflare Web Analytics is cookieless and loads unconditionally.
 * GA4 loads only after explicit consent (see ConsentBar).
 */
export function Analytics() {
  const [consent] = useConsent();
  return (
    <>
      {CF_TOKEN ? (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: CF_TOKEN })}
          strategy="afterInteractive"
        />
      ) : null}
      {GA_ID && consent === "granted" ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </>
  );
}
