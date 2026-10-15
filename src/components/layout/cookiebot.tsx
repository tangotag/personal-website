import { site } from "@/data/site";

const SRC = "https://consent.cookiebot.com/uc.js";

/**
 * Cookiebot, the consent manager for the whole site. It draws the banner, records the visitor's
 * choice and, with `data-blockingmode="auto"`, holds back anything that would set a cookie until
 * they have chosen. This renders in the root layout, so it is on every page.
 *
 * It is injected by an inline script rather than written as a `<script src>` tag, and that is not
 * a style choice. Cookiebot's loader inserts its configuration script immediately *before* its own
 * tag. If React rendered that tag, the node React expects at that position is gone by the time it
 * hydrates, and React reports a mismatch it says it "won't patch up" — on every page. Moving the
 * tag, or marking it `suppressHydrationWarning`, does not help, because the displacement is
 * positional. `next/script` has the same problem one level down: Cookiebot displaces the inline
 * loader Next renders in its place.
 *
 * Appending to the end of `<head>` from an inline script puts the tag past everything React
 * rendered, so Cookiebot's insert lands outside the hydrated range and React never sees it. The
 * inline script itself is static, so it hydrates cleanly. `next/script`'s `afterInteractive` would
 * also avoid the mismatch, but it does not run until after hydration, and a consent banner that
 * arrives that late is the thing visitors complain about.
 *
 * `data-culture` is pinned to the page's own locale. Left off, Cookiebot guesses from the browser
 * and the domain, which would show a German visitor the Spanish banner on /es and the reverse.
 */
export function Cookiebot({ locale }: { locale: string }) {
  if (!site.cookiebotId) return null;

  const culture = locale === "es" ? "ES" : "DE";
  const js =
    `(function(){var s=document.createElement("script");s.id="Cookiebot";` +
    `s.src=${JSON.stringify(SRC)};` +
    `s.setAttribute("data-cbid",${JSON.stringify(site.cookiebotId)});` +
    `s.setAttribute("data-blockingmode","auto");` +
    `s.setAttribute("data-culture",${JSON.stringify(culture)});` +
    `document.head.appendChild(s)})()`;

  // Same escaping as the JSON-LD blocks: a "<" inside a script body can close the tag early.
  return <script dangerouslySetInnerHTML={{ __html: js.replace(/</g, "\\u003c") }} />;
}
