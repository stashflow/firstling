create extension if not exists pgcrypto;

create table if not exists demo_calls (
  id uuid primary key default gen_random_uuid(),
  call_id text,
  result_slug text unique not null,
  caller_name text,
  caller_phone text,
  caller_email text,
  caller_type text,
  service_requested text,
  location text,
  timeline text,
  add_ons text,
  business_name text,
  owner_name text,
  business_services text,
  preferred_contact_method text,
  summary text,
  transcript text,
  recording_url text,
  raw_payload jsonb,
  result_url text,
  email_sent boolean default false,
  sms_sent boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists demo_calls_result_slug_idx on demo_calls (result_slug);
create index if not exists demo_calls_call_id_idx on demo_calls (call_id);
create index if not exists demo_calls_created_at_idx on demo_calls (created_at desc);
