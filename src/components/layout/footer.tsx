import { getTranslations } from "next-intl/server";
import { LocaleSwitch } from "@/components/ui/locale-switch";
import { StatusPill } from "@/components/ui/status-pill";
import { TextLink } from "@/components/ui/text-link";
import { navItems } from "@/data/nav";
import { site } from "@/data/site";
import { Link } from "@/i18n/navigation";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-eyebrow text-fg-muted">{title}</p>
      <ul className="flex flex-col gap-2 text-sm">{children}</ul>
    </div>
  );
}

export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container-content py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              className="self-start font-mono text-sm font-medium tracking-[0.12em] uppercase"
              aria-label={`${site.shortName} · ${site.name}`}
            >
              {site.shortName}
            </Link>
            <p className="max-w-xs text-fg-muted">{t("tagline")}</p>
            <StatusPill className="self-start">{tc("available")}</StatusPill>
          </div>

          <Column title={t("navigate")}>
            {navItems.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="text-fg-muted transition-colors hover:text-fg">
                  {tn(item.key)}
                </Link>
              </li>
            ))}
          </Column>

          <Column title={t("work")}>
            {/* Case-study links are generated from content in Phase 6. */}
            <li>
              <Link href="/work" className="text-fg-muted transition-colors hover:text-fg">
                {tc("seeAll")}
              </Link>
            </li>
          </Column>

          <Column title={t("connect")}>
            <li>
              <TextLink external href={`mailto:${site.email}`} className="text-fg-muted">
                {t("email")}
              </TextLink>
            </li>
            <li>
              <TextLink external href={site.social.linkedin} className="text-fg-muted">
                LinkedIn
              </TextLink>
            </li>
            <li>
              <TextLink external href={site.social.behance} className="text-fg-muted">
                Behance
              </TextLink>
            </li>
            {site.social.upwork ? (
              <li>
                <TextLink external href={site.social.upwork} className="text-fg-muted">
                  Upwork
                </TextLink>
              </li>
            ) : null}
            <li>
              <a
                href={site.resumePath}
                download
                className="text-fg-muted underline decoration-fg/40 underline-offset-[0.2em] transition-colors hover:text-accent-strong hover:decoration-accent-strong"
              >
                {tc("downloadResume")}
              </a>
            </li>
          </Column>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 text-xs text-fg-muted md:flex-row md:items-center md:justify-between">
          <p>{t("rights", { year })}</p>
          <div className="flex items-center gap-4">
            <LocaleSwitch />
            <a href="#top" className="transition-colors hover:text-fg">
              {t("backToTop")} ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
