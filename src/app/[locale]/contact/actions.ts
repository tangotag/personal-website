"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { saveContactSubmission, supabaseEnabled } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";

export type ContactField = "name" | "email" | "message" | "turnstile";

export type ContactState = {
  status: "idle" | "success" | "error";
  /** Field-level error keys (message keys under forms.errors). */
  errors?: Partial<Record<ContactField, "name" | "email" | "message" | "turnstile">>;
  /** Form-level error key: "rate" | "generic". */
  formError?: "rate" | "generic";
  /** Echoed so the form can keep what the user typed after an error. */
  values?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  company: z.string().trim().max(120).optional(),
  intent: z.enum(["hiring", "client", "other"]).default("other"),
  service: z.string().trim().max(80).optional(),
  budget: z.string().trim().max(40).optional(),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(["en", "es"]).default("en"),
  source: z.enum(["contact", "quote"]).default("contact"),
  // Honeypot — must stay empty.
  website: z.string().max(0).optional(),
});

// Best-effort per-IP throttle (per server instance). Vercel functions are short-lived, so this is a
// speed bump, not a guarantee; Turnstile is the real defence.
const hits = new Map<string, number[]>();
function rateLimited(ip: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string") as [string, string][],
  );
  const values = { ...raw };
  delete values["cf-turnstile-response"];

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "email" || field === "message") errors[field] = field;
      // Honeypot filled → pretend success, drop silently.
      if (field === "website") return { status: "success" };
    }
    return { status: "error", errors, values };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return { status: "error", formError: "rate", values };

  const token = formData.get("cf-turnstile-response");
  const human = await verifyTurnstile(typeof token === "string" ? token : null, ip);
  if (!human) return { status: "error", errors: { turnstile: "turnstile" }, values };

  const { website: _honeypot, source, ...payload } = parsed.data;
  const userAgent = h.get("user-agent")?.slice(0, 512) ?? undefined;

  // 1. Email Raheel (primary channel). 2. Persist to Postgres (record of every lead).
  // Either succeeding is a success for the visitor; both failing is the only error.
  const email = await sendContactEmail({ ...payload, ip });
  if (!email.ok) console.error("[contact] email failed:", email.error);

  const db = supabaseEnabled
    ? await saveContactSubmission({
        ...payload,
        source,
        ip,
        user_agent: userAgent,
        email_sent: email.ok,
        email_error: email.ok ? undefined : email.error?.slice(0, 500),
      })
    : { ok: false, error: "supabase not configured" };
  if (!db.ok) console.error("[contact] database save failed:", db.error);

  if (!email.ok && !db.ok) return { status: "error", formError: "generic", values };
  return { status: "success" };
}
