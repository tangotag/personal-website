"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "@/app/[locale]/contact/actions";
import { Turnstile } from "@/components/forms/turnstile";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { site } from "@/data/site";

type ServiceOption = { slug: string; title: string };

type Props = {
  /** "contact" = name/email/I am/message · "quote" = adds service + budget. */
  variant?: "contact" | "quote";
  services?: ServiceOption[];
  defaultIntent?: "hiring" | "client" | "other";
  defaultService?: string;
};

const initial: ContactState = { status: "idle" };

function SubmitButton({ label, pending: pendingLabel }: { label: string; pending: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} disabled={pending} arrow={!pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function ContactForm({
  variant = "contact",
  services = [],
  defaultIntent = "client",
  defaultService,
}: Props) {
  const t = useTranslations("forms");
  const locale = useLocale();
  const [state, action] = useActionState(submitContact, initial);
  const v = state.values ?? {};

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-md border border-border bg-surface p-8"
        data-testid="contact-success"
      >
        <p className="text-h3">{t("success.title")}</p>
        <p className="mt-2 text-fg-muted">{t("success.text")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {site.calendarUrl ? (
            <Button external href={site.calendarUrl} arrow>
              {t("success.cta")}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => window.location.reload()}>
            {t("success.another")}
          </Button>
        </div>
      </div>
    );
  }

  const err = state.errors ?? {};

  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={variant} />
      {/* Honeypot: hidden from people, tempting for bots. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} required error={err.name ? t("errors.name") : undefined}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="name"
              autoComplete="name"
              required
              minLength={2}
              defaultValue={v.name}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
        <Field label={t("email")} required error={err.email ? t("errors.email") : undefined}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={v.email}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("company")}>
          {({ id }) => (
            <Input id={id} name="company" autoComplete="organization" defaultValue={v.company} />
          )}
        </Field>
        <Field label={t("iam")}>
          {({ id }) => (
            <Select id={id} name="intent" defaultValue={v.intent ?? defaultIntent}>
              <option value="hiring">{t("iamOptions.hiring")}</option>
              <option value="client">{t("iamOptions.client")}</option>
              <option value="other">{t("iamOptions.other")}</option>
            </Select>
          )}
        </Field>
      </div>

      {variant === "quote" ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("service")}>
            {({ id }) => (
              <Select id={id} name="service" defaultValue={v.service ?? defaultService ?? ""}>
                <option value="">{t("serviceAny")}</option>
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("budget")}>
            {({ id }) => (
              <Select id={id} name="budget" defaultValue={v.budget ?? "unsure"}>
                {(["unsure", "b1", "b2", "b3", "b4"] as const).map((k) => (
                  <option key={k} value={k}>
                    {t(`budgetOptions.${k}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      ) : null}

      <Field label={t("message")} required error={err.message ? t("errors.message") : undefined}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            name="message"
            required
            minLength={10}
            placeholder={t("messagePlaceholder")}
            defaultValue={v.message}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        )}
      </Field>

      <Turnstile />
      {err.turnstile ? (
        <p role="alert" className="text-sm text-danger">
          {t("errors.turnstile")}
        </p>
      ) : null}
      {state.formError ? (
        <p
          role="alert"
          className="rounded-sm border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {state.formError === "rate"
            ? t("errors.rate")
            : t("errors.generic", { email: site.email })}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton
          label={variant === "quote" ? t("submitQuote") : t("submit")}
          pending={t("sending")}
        />
        <p className="font-mono text-xs text-fg-muted">{t("privacy")}</p>
      </div>
    </form>
  );
}
