import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Reveal, RevealItem } from "@/components/motion/reveal";
import { Link } from "@/i18n/navigation";

const paths = [
  { key: "hiring", href: "/about" },
  { key: "client", href: "/services" },
] as const;

/** Two explicit entry points — hiring managers vs. clients. */
export async function TwoPaths() {
  const t = await getTranslations("home.paths");

  return (
    <section className="pb-8 md:pb-12">
      <Reveal>
        <Container className="grid gap-4 md:grid-cols-2 md:gap-6">
          {paths.map(({ key, href }, i) => (
            <RevealItem key={key} i={i}>
              <Link
                href={href}
                className="group flex items-end justify-between gap-6 rounded-md border border-border bg-surface p-6 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:border-accent hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-safe:hover:-translate-y-0.5 md:p-8"
              >
                <div>
                  <p className="text-h3">{t(`${key}.title`)}</p>
                  <p className="mt-2 max-w-md text-fg-muted">{t(`${key}.text`)}</p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent">
                    {t(`${key}.cta`)}
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5"
                    />
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </Container>
      </Reveal>
    </section>
  );
}
