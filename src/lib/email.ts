import "server-only";
import { Resend } from "resend";
import { site } from "@/data/site";

export type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  intent: "hiring" | "client" | "other";
  service?: string;
  budget?: string;
  message: string;
  locale: string;
  ip?: string;
};

const TO = process.env.CONTACT_TO ?? site.email;
// raheelqureshi.com is verified in Resend, so the default sender is the real address.
const FROM = process.env.CONTACT_FROM ?? `Raheel Qureshi <${site.email}>`;

function escape(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function notification(p: ContactPayload) {
  const rows: [string, string | undefined][] = [
    ["Name", p.name],
    ["Email", p.email],
    ["Company", p.company],
    ["Intent", p.intent],
    ["Service", p.service],
    ["Budget", p.budget],
    ["Locale", p.locale],
    ["IP", p.ip],
  ];
  const table = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${escape(v!)}</td></tr>`,
    )
    .join("");
  return {
    subject: `[raheelqureshi.com] ${p.intent} · ${p.name}`,
    html: `<table>${table}</table><hr><p style="white-space:pre-wrap">${escape(p.message)}</p>`,
    text:
      rows
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n") + `\n\n${p.message}`,
  };
}

function autoReply(p: ContactPayload) {
  const es = p.locale === "es";
  const subject = es
    ? "Recibido. Te respondo en menos de 24 horas"
    : "Got it. I’ll reply within 24 hours";
  const body = es
    ? `Hola ${p.name},\n\nGracias por escribir. He recibido tu mensaje y te respondo en menos de 24 horas.${site.calendarUrl ? `\n\nSi prefieres no esperar, reserva una llamada de 30 minutos: ${site.calendarUrl}` : ""}\n\nRaheel\n${site.url}`
    : `Hi ${p.name},\n\nThanks for writing. I’ve received your message and will reply within 24 hours.${site.calendarUrl ? `\n\nIf you’d rather not wait, book a 30-minute call: ${site.calendarUrl}` : ""}\n\nRaheel\n${site.url}`;
  return { subject, text: body };
}

/**
 * Sends the notification to Raheel and an auto-reply to the sender.
 * Without RESEND_API_KEY (local dev, CI) it logs instead and reports success so the UI flow can be exercised.
 */
export async function sendContactEmail(
  p: ContactPayload,
): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info("[contact] RESEND_API_KEY not set, message logged only:", {
      ...p,
      message: p.message.slice(0, 200),
    });
    return { ok: true };
  }

  const resend = new Resend(key);
  const n = notification(p);
  const r = autoReply(p);

  try {
    const sent = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: p.email,
      subject: n.subject,
      html: n.html,
      text: n.text,
    });
    if (sent.error) return { ok: false, error: sent.error.message };

    // Auto-reply is best-effort; a failure here must not fail the submission.
    await resend.emails
      .send({ from: FROM, to: [p.email], subject: r.subject, text: r.text })
      .catch(() => undefined);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "send failed" };
  }
}
