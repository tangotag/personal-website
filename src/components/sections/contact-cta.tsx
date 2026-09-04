import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { StatusPill } from "@/components/ui/status-pill";
import { site } from "@/data/site";

/** Page-closing CTA: email (copy), calendar, message. Used on every page. */
export async function ContactCta() {
  const t = await getTranslations("home.cta");
  const tc = await getTranslations("common");

  return (
    <Section id="contact-cta">
      <Container>
        <StatusPill>{tc("available")}</StatusPill>
        <h2 className="mt-6 max-w-4xl text-display">{t("title")}</h2>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {site.calendarUrl ? (
            <Button size="lg" external href={site.calendarUrl} arrow>
              {t("call")}
            </Button>
          ) : (
            <Button size="lg" href="/contact" arrow>
              {t("call")}
            </Button>
          )}
          <CopyButton
            value={site.email}
            label={tc("copyEmail")}
            copiedLabel={tc("copied")}
            className="h-13"
          />
          <Button variant="ghost" href="/contact">
            {t("message")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
