import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Row shape for public.contact_submissions (see supabase/migrations/0001_contact_submissions.sql). */
export type ContactSubmission = {
  name: string;
  email: string;
  company?: string;
  intent: "hiring" | "client" | "other";
  service?: string;
  budget?: string;
  message: string;
  locale: "en" | "es";
  source: "contact" | "quote";
  ip?: string;
  user_agent?: string;
  email_sent?: boolean;
  email_error?: string;
};

const URL = process.env.SUPABASE_PROJECT_URL;
// Server-only module: the service role key (bypasses RLS) is preferred when present so a policy
// mistake can never drop a lead; the public anon key (insert-only via RLS) is the fallback.
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

/** True when the database is configured; the form degrades to email-only otherwise. */
export const supabaseEnabled = Boolean(URL && KEY);

/**
 * Inserts one submission without `.select()` (the anon role cannot read the table and nothing here
 * needs the row back). Returns an error string instead of throwing so a database hiccup never
 * blocks the email path.
 */
export async function saveContactSubmission(
  row: ContactSubmission,
): Promise<{ ok: boolean; error?: string }> {
  if (!URL || !KEY) return { ok: false, error: "supabase not configured" };
  try {
    const supabase = createClient(URL, KEY, { auth: { persistSession: false } });
    const { error } = await supabase.from("contact_submissions").insert({
      ...row,
      ip: row.ip && row.ip !== "unknown" ? row.ip : null,
    });
    if (error) return { ok: false, error: `${error.code ?? ""} ${error.message}`.trim() };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "insert failed" };
  }
}
