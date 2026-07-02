create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  business_name text not null unique,
  owner_name text,
  notification_email text,
  notification_phone text,
  website_url text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_name text not null default 'Starter',
  monthly_price numeric(10, 2) not null default 29,
  included_minutes integer not null default 50,
  overage_rate numeric(10, 2) not null default 0.25,
  phone_number_monthly_cost numeric(10, 2) not null default 2,
  payment_fee_estimate numeric(10, 2) not null default 1.15,
  billing_status text not null default 'trial',
  caller_preferences jsonb,
  caller_phone_number text,
  caller_status text not null default 'needs_setup',
  caller_notes text,
  caller_live_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table clients add column if not exists owner_name text;
alter table clients add column if not exists notification_email text;
alter table clients add column if not exists notification_phone text;
alter table clients add column if not exists website_url text;
alter table clients add column if not exists stripe_customer_id text;
alter table clients add column if not exists stripe_subscription_id text;
alter table clients add column if not exists caller_preferences jsonb;
alter table clients add column if not exists caller_phone_number text;
alter table clients add column if not exists caller_status text not null default 'needs_setup';
alter table clients add column if not exists caller_notes text;
alter table clients add column if not exists caller_live_at timestamp with time zone;

create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  external_call_id text not null,
  caller_number text,
  duration_seconds integer not null default 0,
  billable_minutes integer not null default 0,
  estimated_cost numeric(10, 2) not null default 0,
  call_status text not null default 'completed',
  lead_name text,
  service_requested text,
  booking_status text,
  transcript_summary text,
  raw_payload jsonb,
  created_at timestamp with time zone default now(),
  unique (client_id, external_call_id)
);

create table if not exists monthly_usage (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  month date not null,
  total_calls integer not null default 0,
  total_minutes integer not null default 0,
  included_minutes integer not null default 0,
  overage_minutes integer not null default 0,
  overage_revenue numeric(10, 2) not null default 0,
  estimated_call_cost numeric(10, 2) not null default 0,
  monthly_revenue numeric(10, 2) not null default 0,
  gross_profit numeric(10, 2) not null default 0,
  profit_margin numeric(10, 4) not null default 0,
  billing_status text not null default 'trial',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (client_id, month)
);

create index if not exists clients_billing_status_idx on clients (billing_status);
create index if not exists clients_caller_status_idx on clients (caller_status);
create index if not exists clients_stripe_customer_idx on clients (stripe_customer_id);
create index if not exists clients_stripe_subscription_idx on clients (stripe_subscription_id);
create index if not exists calls_client_created_at_idx on calls (client_id, created_at desc);
create index if not exists calls_external_call_id_idx on calls (external_call_id);
create index if not exists monthly_usage_month_idx on monthly_usage (month desc);
