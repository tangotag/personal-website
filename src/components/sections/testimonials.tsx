import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Link } from "@/i18n/navigation";
import { getTestimonials } from "@/lib/data";
import { pick } from "@/types/content";

function Avatar({ name, src }: { name: string; src?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span className="relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 font-mono text-xs text-fg-muted">
      {src ? <Image src={src} alt="" fill sizes="40px" className="object-cover" /> : initials}
    </span>
  );
}

/** Renders nothing in production until at least one testimonial is published with permission. */
export async function Testimonials({ locale }: { locale: string }) {
  const t = await getTranslations("home.testimonials");
  const items = getTestimonials();
  if (items.length === 0 && process.env.NODE_ENV === "production") return null;

  return (
    <Section id="testimonials">
      <Container>
        <SectionHeader number="06" eyebrow={t("eyebrow")} title={t("title")} />
        {items.length === 0 ? (
          <p className="mt-10 rounded-md border border-dashed border-border p-6 font-mono text-xs text-fg-muted">
            {t("empty")}
          </p>
        ) : (
          <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, i) => (
              <li
                key={i}
                className="flex flex-col gap-6 rounded-md border border-border bg-surface p-6"
              >
                <blockquote className="text-lead">“{pick(item.quote, locale)}”</blockquote>
                <div className="mt-auto flex items-center gap-3">
                  <Avatar name={item.name} src={item.avatar} />
                  <div className="text-sm">
                    <p className="font-medium text-fg">{item.name}</p>
                    <p className="text-fg-muted">
                      {item.role}, {item.company}
                    </p>
                  </div>
                </div>
                {item.project ? (
                  <Link
                    href={`/work/${item.project}`}
                    className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                  >
                    {t("viewProject")} ↗
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
