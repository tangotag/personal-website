import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CaseHero } from "@/components/case-study/case-hero";
import { NextProject } from "@/components/case-study/next-project";
import { ReadingProgress } from "@/components/case-study/progress";
import { Toc } from "@/components/case-study/toc";
import { Container } from "@/components/layout/container";
import { ContactCta } from "@/components/sections/contact-cta";
import { routing } from "@/i18n/routing";
import { getAdjacentWork, getWork, getWorkSlugs } from "@/lib/content";
import { extractHeadings } from "@/lib/headings";
import { renderMdx } from "@/lib/mdx";
import { site } from "@/data/site";
import { jsonLdString } from "@/lib/json-ld";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getWorkSlugs().map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/work/[slug]">, "searchParams">): Promise<Metadata> {
  const { locale, slug } = await params;
  const entry = getWork(slug, locale);
  if (!entry) return {};
  const path = `/work/${slug}`;
  return {
    title: entry.title,
    description: entry.hook,
    alternates: {
      canonical: locale === "en" ? path : `/es${path}`,
      languages: { en: path, es: `/es${path}` },
    },
    openGraph: { type: "article", title: entry.title, description: entry.hook },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: entry.title,
    description: entry.hook,
    author: { "@type": "Person", name: site.name, url: site.url },
    inLanguage: entry.locale,
    keywords: entry.tags.join(", "),
    ...(entry.cover ? { image: `${site.url}${entry.cover}` } : {}),
  };

  return (
    <main id="main" className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <ReadingProgress />
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
