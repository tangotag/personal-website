/**
 * Production serves from www; the apex 308-redirects to it. A canonical on the apex therefore
 * points at a redirect *and* sits in the hreflang set, which is exactly Lighthouse's "points to
 * another hreflang location" failure — it cost the site its SEO 100 on 2026-09-08. Normalising
 * here rather than relying on NEXT_PUBLIC_SITE_URL keeps the canonical right whatever the
 * environment says; preview and localhost URLs pass through untouched.
 */
function canonicalOrigin(raw: string) {
  try {
    const u = new URL(raw);
    if (u.hostname === "raheelqureshi.com") u.hostname = "www.raheelqureshi.com";
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
  url: canonicalOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.raheelqureshi.com"),
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
