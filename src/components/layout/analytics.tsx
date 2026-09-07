"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import dynamic from "next/dynamic";
import Script from "next/script";
import { useConsent } from "@/components/layout/consent-bar";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CF_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
// Vercel injects this on every deployment. Off locally, so `next start` audits never request
// /_vercel/insights/script.js (a 404 that would surface as a console error in Lighthouse).
const ON_VERCEL = Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV);

// Loaded from their own chunks, so the two Vercel packages add nothing to the shared bundle on
// builds that are not deployed to Vercel.
const VercelAnalytics = dynamic(() => import("@vercel/analytics/react").then((m) => m.Analytics));
const SpeedInsights = dynamic(() =>
  import("@vercel/speed-insights/next").then((m) => m.SpeedInsights),
);

/**
 * Cloudflare Web Analytics, Vercel Analytics and Vercel Speed Insights are cookieless and load
 * unconditionally. GA4 loads only after explicit consent (see ConsentBar).
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
      {ON_VERCEL ? (
        <>
          <VercelAnalytics />
          <SpeedInsights />
        </>
      ) : null}
    </>
  );
}
