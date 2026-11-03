/**
 * Production serves from the APEX, raheelqureshi.com, and www 308-redirects to it (Cloudflare).
 * A canonical pointing at the host that redirects is both a redirect *and* a member of the
 * hreflang set, which is Lighthouse's "points to another hreflang location" failure — it cost the
 * site its SEO 100 on 2026-09-08, and it was live again from 2026-11-03 until this was corrected,
 * because the rule had been written for the opposite redirect direction.
 *
 * Normalising here rather than trusting NEXT_PUBLIC_SITE_URL keeps the canonical, the hreflang set
 * and the sitemap on one host whatever the environment says. Preview and localhost URLs pass
 * through untouched. If the redirect is ever flipped back to apex→www, this is the one place to
 * change, and tests/unit/seo.test.ts is the one place that will tell you.
 */
export function canonicalOrigin(raw: string) {
  try {
    const u = new URL(raw);
    if (u.hostname === "www.raheelqureshi.com") u.hostname = "raheelqureshi.com";
    return u.origin;
  } catch {
    return raw;
  }
}

/** Site-wide constants. Locale-specific copy lives in messages/*.json. */
export const site = {
  name: "Raheel Ahmad Qureshi",
  shortName: "RAQ",
  role: "Senior Product Designer",
  url: canonicalOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? "https://raheelqureshi.com"),
  email: "connect@raheelqureshi.com",
  // No location is shown anywhere on the site (user decision 2026-09-04); the zone is used only for formatting.
  timeZone: "Asia/Karachi",
  availability: {
    fullTime: true,
    freelance: true,
  },
  calendarUrl: process.env.NEXT_PUBLIC_CAL_LINK ?? "",
  /**
   * Cookiebot is the consent manager for the whole site. The CBID is public — it ships in the
   * HTML of every page — so it lives here rather than in .env, and NEXT_PUBLIC_COOKIEBOT_ID
   * overrides it. An empty string switches Cookiebot off, which is what the Lighthouse build
   * does so the audit never reaches a third party.
   */
  cookiebotId: process.env.NEXT_PUBLIC_COOKIEBOT_ID ?? "0a52951b-cf4e-4ef9-b5ca-74cb474cc686",
  resumePath: "/Raheel-Ahmad-Qureshi-Senior-Product-Designer.pdf",
  social: {
    linkedin: "https://www.linkedin.com/in/theraheel10/",
    behance: "https://www.behance.net/theraheel10",
    upwork: "", // [NEEDED] Upwork profile URL
  },
} as const;
