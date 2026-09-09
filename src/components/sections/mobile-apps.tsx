import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Tag } from "@/components/ui/tag";
import { getMobileApps } from "@/lib/data";
import { pick } from "@/types/content";

/**
 * A screen in a device shell. The shell is drawn rather than baked into the image so the bezel
 * takes the theme's surface and border instead of shipping a grey frame that only suits one of
 * the two backgrounds.
 */
function Phone({
  src,
  alt,
  label,
  priority,
}: {
  src: string;
  alt: string;
  label: string;
  priority?: boolean;
}) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="rounded-[1.75rem] border border-border-strong bg-surface-2 p-1.5 shadow-soft">
        {/* 430x932 is the source size of every screen, so the shell never crops one. */}
        <div className="relative aspect-[430/932] overflow-hidden rounded-[1.4rem] bg-surface">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 30vw, 44vw"
            className="object-cover"
          />
        </div>
      </div>
      <figcaption className="text-center font-mono text-xs text-fg-muted">{label}</figcaption>
    </figure>
  );
}

/**
 * Mobile App Design — concept apps, deliberately not case studies. There is no client, no metric
 * and no process to walk through; the interface is the whole of the argument, so each entry is a
 * name, a couple of lines and the screens themselves.
 */
export async function MobileApps({ locale }: { locale: string }) {
  const t = await getTranslations("pages.work.mobileApps");
  const apps = getMobileApps();

  return (
    <Section>
      <Container>
        <SectionHeader
          as="h2"
          number="02"
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
        />

        <ul className="mt-14 flex flex-col gap-14">
          {apps.map((app, i) => (
            <li key={app.slug} className="border-t border-border pt-10 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-3">
                <h3 className="text-h3">{app.name}</h3>
                <ul className="flex flex-wrap gap-2">
                  {app.tags.map((tag) => (
                    <li key={tag}>
                      <Tag>{tag}</Tag>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-4 max-w-[60ch] text-fg-muted">{pick(app.summary, locale)}</p>

              <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {app.screens.map((screen, j) => (
                  <li key={screen.src}>
                    <Phone
                      src={screen.src}
                      alt={pick(screen.alt, locale)}
                      label={pick(screen.label, locale)}
                      priority={i === 0 && j === 0}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
