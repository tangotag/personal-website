import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactCta } from "@/components/sections/contact-cta";
import { FaqSection } from "@/components/sections/faq-section";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Numbers } from "@/components/sections/numbers";
import { Process } from "@/components/sections/process";
import { SelectedWork } from "@/components/sections/selected-work";
import { ServicesTeaser } from "@/components/sections/services-teaser";
import { SoundFamiliar } from "@/components/sections/sound-familiar";
import { Testimonials } from "@/components/sections/testimonials";
import { TwoPaths } from "@/components/sections/two-paths";
import { WorkedWith } from "@/components/sections/worked-with";
import { jsonLdString, siteGraph } from "@/lib/json-ld";

/** Home — section order per docs/03 §4 and docs/08 §2. */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations("nav");
  const tm = await getTranslations("meta");
  const t = await getTranslations("meta.home");

  // A one-item trail: the Breadcrumbs component renders nothing for it, but the BreadcrumbList
  // still declares the site root, which is what anchors every other trail to a known origin.
  const crumbs = [{ name: tn("home"), path: "/" }];
  const jsonLd = siteGraph({
    locale,
    path: "/",
    title: t("title"),
    description: t("description"),
    siteName: tm("siteName"),
    crumbs,
    image: "/images/og-default.jpg",
  });

  return (
    <main id="main" className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Marquee />
      <Hero />
      <TwoPaths />
      <SelectedWork locale={locale} />
      <Numbers />
      <SoundFamiliar />
      <ServicesTeaser locale={locale} />
      <WorkedWith />
      <Testimonials locale={locale} />
      <Process />
      <FaqSection locale={locale} />
      <ContactCta />
    </main>
  );
}
