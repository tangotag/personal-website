import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { MediaFrame } from "@/components/ui/media-frame";
import { Metric } from "@/components/ui/metric";
import { StatusPill } from "@/components/ui/status-pill";
import { ChipButton, Tag } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";
import { Copy, Menu, Moon } from "lucide-react";

export const metadata = { title: "Components (dev)", robots: { index: false, follow: false } };

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-border py-8 md:grid-cols-[12rem_1fr]">
      <p className="text-eyebrow text-fg-muted">{title}</p>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  );
}

/** Design-system gallery. Dev only — 404s in production. */
export default async function ComponentsPage({ params }: PageProps<"/[locale]/dev/components">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="main">
      <Section>
        <Container>
          <SectionHeader
            number="00"
            eyebrow="Design system"
            title="Components"
            lead="Every primitive from docs/07-design-system.md, both themes. Toggle the theme with your OS setting until the header ships."
            action={
              <Button variant="ghost" href="/">
                Back home
              </Button>
            }
          />

          <div className="mt-12">
            <Row title="Type scale">
              <div className="flex w-full flex-col gap-3">
                <p className="text-display">Display 800</p>
                <p className="text-h1">Heading one</p>
                <p className="text-h2">Heading two</p>
                <p className="text-h3">Heading three</p>
                <p className="text-lead text-fg-muted">Lead · clamp(1.125rem, 1.4vw, 1.375rem)</p>
                <p className="max-w-[68ch]">
                  Body · Inter 16/1.65. Nine-plus years designing end-to-end products: restaurant
                  POS and self-service kiosks, compliance SaaS, and multiplayer games.
                </p>
                <p className="text-eyebrow text-fg-muted">
                  <span className="text-accent-strong">01 / </span>Eyebrow mono
                </p>
                <p className="font-mono text-xs text-fg-muted">Caption mono · faint</p>
              </div>
            </Row>

            <Row title="Colour">
              {(
                [
                  ["bg", "bg-bg"],
                  ["surface", "bg-surface"],
                  ["surface-2", "bg-surface-2"],
                  ["accent", "bg-accent"],
                  ["accent-soft", "bg-accent-soft"],
                  ["success", "bg-success"],
                  ["danger", "bg-danger"],
                ] as const
              ).map(([name, cls]) => (
                <div key={name} className="flex flex-col items-center gap-2">
                  <div className={`size-14 rounded-md border border-border ${cls}`} />
                  <span className="font-mono text-xs text-fg-muted">{name}</span>
                </div>
              ))}
            </Row>

            <Row title="Buttons">
              <Button>Start a project</Button>
              <Button variant="secondary">Download resume</Button>
              <Button variant="ghost" href="/">
                View work
              </Button>
              <Button size="lg">Large primary</Button>
              <Button variant="secondary" size="lg" arrow>
                Large with arrow
              </Button>
              <Button loading>Sending</Button>
              <Button disabled>Disabled</Button>
              <Button variant="secondary" external href="https://www.behance.net/theraheel10" arrow>
                Behance
              </Button>
            </Row>

            <Row title="Links">
              <p>
                Inline <TextLink href="/">internal link</TextLink> and an{" "}
                <TextLink external href="https://www.linkedin.com/in/theraheel10/">
                  external link
                </TextLink>{" "}
                inside body text.
              </p>
            </Row>

            <Row title="Tags & chips">
              <Tag>POS</Tag>
              <Tag>Design system</Tag>
              <Tag selected>Fintech</Tag>
              <ChipButton pressed>All</ChipButton>
              <ChipButton pressed={false}>Games</ChipButton>
              <ChipButton pressed={false}>SaaS</ChipButton>
            </Row>

            <Row title="Status & icons">
              <StatusPill>Available for full-time & freelance</StatusPill>
              <IconButton aria-label="Toggle theme">
                <Moon className="size-5" />
              </IconButton>
              <IconButton aria-label="Open menu">
                <Menu className="size-5" />
              </IconButton>
              <IconButton aria-label="Copy email">
                <Copy className="size-5" />
              </IconButton>
            </Row>

            <Row title="Metrics">
              <div className="grid w-full grid-cols-2 gap-8 md:grid-cols-4">
                <Metric value={9} suffix="+" label="years designing digital products" />
                <Metric
                  value={25}
                  prefix="−"
                  suffix="%"
                  label="development time via dev-ready handoff"
                />
                <Metric
                  value={40}
                  prefix="+"
                  suffix="%"
                  label="conversion after the Open Omaha redesign"
                />
                <Metric display="< 30 min" label="cashier onboarding" note="[CONFIRM]" />
              </div>
            </Row>

            <Row title="Fields">
              <form className="grid w-full max-w-xl gap-5">
                <Field label="Name" required>
                  {({ id, describedBy, invalid }) => (
                    <Input
                      id={id}
                      name="name"
                      placeholder="Your name"
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                      required
                    />
                  )}
                </Field>
                <Field label="Email" error="Enter a valid email address." required>
                  {({ id, describedBy, invalid }) => (
                    <Input
                      id={id}
                      type="email"
                      defaultValue="not-an-email"
                      aria-describedby={describedBy}
                      aria-invalid={invalid || undefined}
                    />
                  )}
                </Field>
                <Field label="I am…" hint="Helps me route your message.">
                  {({ id, describedBy }) => (
                    <Select id={id} aria-describedby={describedBy} defaultValue="client">
                      <option value="hiring">Hiring for a team</option>
                      <option value="client">A client with a project</option>
                      <option value="other">Something else</option>
                    </Select>
                  )}
                </Field>
                <Field label="Message">
                  {({ id }) => <Textarea id={id} placeholder="What are you building?" />}
                </Field>
              </form>
            </Row>

            <Row title="Callouts">
              <div className="w-full max-w-2xl">
                <Callout kind="constraint">
                  <p>
                    Must work offline and reconcile payments later; staff learn it in one shift.
                  </p>
                </Callout>
                <Callout kind="insight" title="What the kitchen told us">
                  <p>Tickets were being read from three metres away. Type had to be huge.</p>
                </Callout>
                <Callout kind="decision">
                  <p>One design system across five surfaces instead of five apps.</p>
                </Callout>
              </div>
            </Row>

            <Row title="Media frames">
              <div className="grid w-full gap-6 md:grid-cols-3">
                <MediaFrame kind="plain" aspect="16/10" caption="plain · 16:10">
                  <div className="size-full bg-[repeating-linear-gradient(45deg,var(--border)_0_8px,transparent_8px_16px)]" />
                </MediaFrame>
                <MediaFrame kind="phone" aspect="9/19" caption="phone">
                  <div className="size-full bg-[repeating-linear-gradient(45deg,var(--border)_0_8px,transparent_8px_16px)]" />
                </MediaFrame>
                <MediaFrame kind="desktop" aspect="16/10" caption="desktop">
                  <div className="size-full bg-[repeating-linear-gradient(45deg,var(--border)_0_8px,transparent_8px_16px)]" />
                </MediaFrame>
              </div>
            </Row>
          </div>
        </Container>
      </Section>
    </main>
  );
}
