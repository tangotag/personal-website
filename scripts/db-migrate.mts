/**
 * Applies supabase/migrations/*.sql in order against DATABASE_URL (Supabase → Connect → Session
 * pooler URI). Migrations are idempotent, so re-running is safe. Run: npm run db:migrate
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    [
      "DATABASE_URL is not set.",
      "Supabase dashboard → Connect (top bar) → Session pooler → copy the URI,",
      "replace [YOUR-PASSWORD] with the database password, and add it to .env as",
      "DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres",
    ].join("\n"),
  );
  process.exit(2);
}

const dir = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  for (const file of files) {
    const sql = readFileSync(join(dir, file), "utf8");
    process.stdout.write(`→ ${file} … `);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("commit");
      console.log("ok");
    } catch (err) {
      await client.query("rollback");
      throw err;
    }
  }
  const { rows } = await client.query("select count(*)::int as n from public.contact_submissions");
  console.log(`✔ migrations applied — contact_submissions has ${rows[0].n} row(s)`);
} finally {
  await client.end();
}
