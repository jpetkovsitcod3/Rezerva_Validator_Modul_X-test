-- =====================================================================
--  EmailValidator Pro — Supabase Schema
--  Run this once in: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- UUID support (usually pre-enabled)
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) validation_results — every single / bulk validation outcome
-- ---------------------------------------------------------------------
create table if not exists public.validation_results (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  status            text not null
                    check (status in ('valid','invalid','risky','unknown','error')),
  score             integer not null default 0,
  risk_level        text,
  syntax            jsonb not null default '{}'::jsonb,
  dns               jsonb not null default '{}'::jsonb,
  disposable        jsonb not null default '{}'::jsonb,
  catch_all         jsonb not null default '{}'::jsonb,
  smtp              jsonb not null default '{}'::jsonb,
  processing_time_ms numeric(10,2),
  validated_at      timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists idx_validation_email       on public.validation_results (email);
create index if not exists idx_validation_status      on public.validation_results (status);
create index if not exists idx_validation_created_at  on public.validation_results (created_at desc);

-- ---------------------------------------------------------------------
-- 2) bulk_jobs — async bulk validation jobs (Celery ↔ API handshake)
-- ---------------------------------------------------------------------
create table if not exists public.bulk_jobs (
  id           uuid primary key default gen_random_uuid(),
  task_id      text unique not null,
  status       text not null default 'pending'
               check (status in ('pending','processing','progress','success','failure','error')),
  total        integer not null default 0,
  processed    integer not null default 0,
  results      jsonb not null default '[]'::jsonb,
  error        text,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_bulk_jobs_task_id     on public.bulk_jobs (task_id);
create index if not exists idx_bulk_jobs_created_at  on public.bulk_jobs (created_at desc);

-- ---------------------------------------------------------------------
-- 3) domain_records — optional domain-intelligence cache
-- ---------------------------------------------------------------------
create table if not exists public.domain_records (
  id             uuid primary key default gen_random_uuid(),
  domain         text unique not null,
  mx_records     jsonb not null default '[]'::jsonb,
  has_mx_records boolean not null default false,
  has_spf        boolean not null default false,
  spf_record     text,
  has_dmarc      boolean not null default false,
  dmarc_record   text,
  has_dkim       boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_domain_records_domain on public.domain_records (domain);

-- ---------------------------------------------------------------------
-- Row Level Security
-- The backend uses the service_role key (bypasses RLS).
-- The anon / publishable key (browser SDK) gets read + insert only.
-- ---------------------------------------------------------------------
alter table public.validation_results enable row level security;
alter table public.bulk_jobs            enable row level security;
alter table public.domain_records       enable row level security;

drop policy if exists "anon_read_validation_results"  on public.validation_results;
drop policy if exists "anon_insert_validation_results" on public.validation_results;
create policy "anon_read_validation_results"  on public.validation_results
  for select to anon using (true);
create policy "anon_insert_validation_results" on public.validation_results
  for insert to anon with check (true);

drop policy if exists "anon_read_bulk_jobs"  on public.bulk_jobs;
drop policy if exists "anon_insert_bulk_jobs" on public.bulk_jobs;
create policy "anon_read_bulk_jobs"  on public.bulk_jobs
  for select to anon using (true);
create policy "anon_insert_bulk_jobs" on public.bulk_jobs
  for insert to anon with check (true);

drop policy if exists "anon_read_domain_records"  on public.domain_records;
drop policy if exists "anon_insert_domain_records" on public.domain_records;
create policy "anon_read_domain_records"  on public.domain_records
  for select to anon using (true);
create policy "anon_insert_domain_records" on public.domain_records
  for insert to anon with check (true);

-- ---------------------------------------------------------------------
-- Sanity check
-- ---------------------------------------------------------------------
select
  (select count(*) from public.validation_results) as validation_count,
  (select count(*) from public.bulk_jobs)          as bulk_job_count,
  (select count(*) from public.domain_records)     as domain_record_count;
