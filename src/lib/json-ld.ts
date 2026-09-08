import { site } from "@/data/site";
import { absoluteUrl, breadcrumbLd, hrefFor, type Crumb } from "@/lib/seo";

/**
 * Serialises structured data for a <script type="application/ld+json"> tag.
 * `<` is escaped so user-influenced strings can never close the script tag (XSS).
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Stable node identifiers, so every page references one Person and one WebSite by @id. */
export const PERSON_ID = `${site.url}/#person`;
export const WEBSITE_ID = `${site.url}/#website`;

type GraphInput = {
  locale: string;
  /** Route without a locale prefix, e.g. "/work/compass-pos". */
  path: string;
  title: string;
  description: string;
  siteName: string;
  crumbs: Crumb[];
  /** Absolute or site-relative image representing this page. */
  image?: string;
  /** Extra fields merged into the canonical Person node — the About page's awards, for instance. */
  person?: Record<string, unknown>;
  /** More specific than WebPage where schema.org has a subtype: ProfilePage, ContactPage… */
  pageType?: string;
  /** Extra fields merged into the page node itself. */
  pageProps?: Record<string, unknown>;
  /** Page-specific entities: CreativeWork, FAQPage, ProfessionalService… */
  extra?: Record<string, unknown>[];
};

/**
 * One @graph per page rather than a pile of disconnected blocks. The Person and the WebSite are
 * declared once with stable @ids and referenced everywhere else, which is what lets a consumer
 * tell that the author of a case study, the subject of the About page and the owner of the site
 * are the same entity instead of three lookalikes.
 */
export function siteGraph({
  locale,
  path,
  title,
  description,
  siteName,
  crumbs,
  image,
  person,
  pageType = "WebPage",
  pageProps,
  extra = [],
}: GraphInput) {
  const url = absoluteUrl(hrefFor(path, locale));
  const lang = locale === "es" ? "es-ES" : "en-US";
  const img = image?.startsWith("http") ? image : image ? absoluteUrl(image) : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${site.url}/`,
        name: siteName,
        inLanguage: lang,
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: site.name,
        alternateName: site.shortName,
        jobTitle: site.role,
        url: `${site.url}/`,
        email: `mailto:${site.email}`,
        image: absoluteUrl("/images/portrait.webp"),
        sameAs: [site.social.linkedin, site.social.behance, site.social.upwork].filter(Boolean),
        ...person,
      },
      {
        "@type": pageType,
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: lang,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": PERSON_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        ...(img ? { primaryImageOfPage: { "@type": "ImageObject", url: img } } : {}),
        ...pageProps,
      },
      breadcrumbLd(crumbs, locale),
      ...extra,
    ],
  };
}
