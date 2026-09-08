import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CaseHero } from "@/components/case-study/case-hero";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { NextProject } from "@/components/case-study/next-project";
import { ReadingProgress } from "@/components/case-study/progress";
import { Toc } from "@/components/case-study/toc";
import { Container } from "@/components/layout/container";
import { ContactCta } from "@/components/sections/contact-cta";
import { routing } from "@/i18n/routing";
import { getAdjacentWork, getWork, getWorkSlugs } from "@/lib/content";
import { extractHeadings } from "@/lib/headings";
import { renderMdx } from "@/lib/mdx";
import { jsonLdString, siteGraph, PERSON_ID, WEBSITE_ID } from "@/lib/json-ld";
import { absoluteUrl, addressFor, hrefFor } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getWorkSlugs().map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/work/[slug]">, "searchParams">): Promise<Metadata> {
  const { locale, slug } = await params;
  const entry = getWork(slug, locale);
  if (!entry) return {};
  const { alternates, canonicalUrl } = addressFor(`/work/${slug}`, locale);
  return {
    title: entry.title,
    description: entry.hook,
    alternates,
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: entry.title,
      description: entry.hook,
    },
  };
}

export default async function WorkEntryPage({ params }: PageProps<"/[locale]/work/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const entry = getWork(slug, locale);
  if (!entry) notFound();

  const t = await getTranslations("caseStudy");
  const headings = extractHeadings(entry.body);
  const [content, adjacent] = await Promise.all([
    renderMdx(entry.body),
    Promise.resolve(getAdjacentWork(slug, locale)),
  ]);

  const tn = await getTranslations("nav");
  const tm = await getTranslations("meta");
  const path = `/work/${slug}`;
  // Case-study titles are full sentences ("Compass POS: the terminal a restaurant runs its whole
  // day on"). A trail wants the name, not the argument, so it ends at the colon.
  const shortTitle = entry.title.split(":")[0]!.trim();
  const crumbs = [
    { name: tn("home"), path: "/" },
    { name: tn("work"), path: "/work" },
    { name: shortTitle, path },
  ];

  // The frontmatter carries a human timeline ("2025", "2024 — 2025"), not a date field; the last
  // four-digit year in it is the year the work shipped. Omitted when there is no year to read.
  const year = entry.timeline.match(/\b(19|20)\d{2}\b(?!.*\b(19|20)\d{2}\b)/)?.[0];

  const jsonLd = siteGraph({
    locale,
    path,
    title: entry.title,
    description: entry.hook,
    siteName: tm("siteName"),
    crumbs,
    image: entry.cover,
    extra: [
      {
        "@type": "CreativeWork",
        "@id": `${absoluteUrl(hrefFor(path, locale))}#work`,
        name: entry.title,
        headline: entry.title,
        description: entry.hook,
        author: { "@id": PERSON_ID },
        creator: { "@id": PERSON_ID },
        inLanguage: entry.locale === "es" ? "es-ES" : "en-US",
        keywords: entry.tags.join(", "),
        genre: entry.industry.join(", "),
        about: entry.platforms.join(", "),
        isPartOf: { "@id": WEBSITE_ID },
        mainEntityOfPage: { "@id": `${absoluteUrl(hrefFor(path, locale))}#webpage` },
        ...(year ? { datePublished: year } : {}),
        ...(entry.cover ? { image: absoluteUrl(entry.cover) } : {}),
      },
    ],
  });

  return (
    <main id="main" className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <ReadingProgress />
      <Container className="pt-6 md:pt-10">
        <Breadcrumbs crumbs={crumbs} />
      </Container>
      <CaseHero entry={entry} />

      <Container className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
        <div className="order-2 min-w-0 lg:order-1 lg:col-span-8">
          <article className="case-body max-w-[68ch]">{content}</article>
        </div>
        <aside className="order-1 lg:order-2 lg:col-span-3 lg:col-start-10">
          <Toc headings={headings} label={t("toc")} />
        </aside>
      </Container>

      <NextProject prev={adjacent.prev} next={adjacent.next} />
      <ContactCta />
    </main>
  );
}
