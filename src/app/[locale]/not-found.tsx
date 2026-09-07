import { useTranslations } from "next-intl";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

/** Localized 404 — rendered for unknown paths under /[locale] via the [...rest] catch-all. */
export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main id="main" className="flex flex-1 items-center">
      <Section>
        <Container>
          <p className="text-eyebrow text-fg-muted">
            <span className="text-accent-strong">404</span>
          </p>
          <h1 className="mt-4 max-w-3xl text-h1">{t("title")}</h1>
          <p className="mt-5 max-w-xl text-lead text-fg-muted">{t("description")}</p>
          <div className="mt-10">
            <Button href="/" arrow>
              {t("cta")}
            </Button>
          </div>
        </Container>
      </Section>
    </main>
  );
}
