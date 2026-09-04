-- Contact / quote form submissions.
-- Applied with: npm run db:migrate  (needs DATABASE_URL — see README "Database").
-- Idempotent: safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.contact_submissions (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  -- What the visitor typed
  name         text not null check (char_length(name) between 2 and 80),
  email        text not null check (char_length(email) <= 120 and position('@' in email) > 1),
  company      text check (char_length(company) <= 120),
  intent       text not null default 'other' check (intent in ('hiring', 'client', 'other')),
  service      text check (char_length(service) <= 80),
  budget       text check (char_length(budget) <= 40),
  message      text not null check (char_length(message) between 10 and 5000),

  -- Context
  locale       text not null default 'en' check (locale in ('en', 'es')),
  source       text not null default 'contact' check (source in ('contact', 'quote')),
  ip           inet,
  user_agent   text check (char_length(user_agent) <= 512),

  -- Delivery bookkeeping (filled by the app)
  email_sent   boolean not null default false,
  email_error  text,

  -- Triage (edit in the Supabase dashboard)
  status       text not null default 'new' check (status in ('new', 'replied', 'archived', 'spam')),
  notes        text
);

comment on table public.contact_submissions is 'Messages from the contact and quote forms on raheelqureshi.com';

create index if not exists contact_submissions_created_at_idx on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_status_idx     on public.contact_submissions (status);

-- Row Level Security: the website uses the public anon key, so anon may INSERT and nothing else.
-- Reading/updating/deleting stays with the dashboard (service role / SQL editor).
alter table public.contact_submissions enable row level security;

drop policy if exists "website can insert submissions" on public.contact_submissions;
create policy "website can insert submissions"
  on public.contact_submissions
  for insert
  to anon
  with check (
    -- The app records whether the notification email went out (email_sent / email_error);
    -- triage fields stay untouched by the website.
    status = 'new'
    and notes is null
  );

-- No select/update/delete policies for anon on purpose.
revoke all on public.contact_submissions from anon;
grant insert on public.contact_submissions to anon;

-- Belt and braces: the anon role can insert but must never read the table back (PostgREST `select` on insert
-- is avoided by the app: it inserts without `.select()`).
