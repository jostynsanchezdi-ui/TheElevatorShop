-- ============================================================
-- Run this once in the Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- ── user_addresses ──────────────────────────────────────────
create table if not exists public.user_addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text not null default 'Home',
  full_name   text not null,
  line1       text not null,
  line2       text,
  city        text not null,
  state       text not null,
  zip         text not null,
  country     text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.user_addresses enable row level security;

-- Users can only see their own addresses
create policy "select own addresses"
  on public.user_addresses for select
  using (auth.uid() = user_id);

-- Users can insert their own addresses
create policy "insert own addresses"
  on public.user_addresses for insert
  with check (auth.uid() = user_id);

-- Users can update their own addresses
create policy "update own addresses"
  on public.user_addresses for update
  using (auth.uid() = user_id);

-- Users can delete their own addresses
create policy "delete own addresses"
  on public.user_addresses for delete
  using (auth.uid() = user_id);


-- ── user_payment_methods ────────────────────────────────────
create table if not exists public.user_payment_methods (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  stripe_pm_id        text not null,
  brand               text,
  last4               text,
  exp_month           int,
  exp_year            int,
  is_default          boolean not null default false,
  created_at          timestamptz not null default now()
);

alter table public.user_payment_methods enable row level security;

create policy "select own payment methods"
  on public.user_payment_methods for select
  using (auth.uid() = user_id);

create policy "insert own payment methods"
  on public.user_payment_methods for insert
  with check (auth.uid() = user_id);

create policy "update own payment methods"
  on public.user_payment_methods for update
  using (auth.uid() = user_id);

create policy "delete own payment methods"
  on public.user_payment_methods for delete
  using (auth.uid() = user_id);


-- ── user_orders ─────────────────────────────────────────────
create table if not exists public.user_orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete set null,
  status           text not null default 'confirmed',
  items            jsonb not null,          -- [{id, name, sku, image, price, quantity}]
  subtotal         int  not null,           -- cents
  shipping_cost    int  not null,           -- cents
  total            int  not null,           -- cents
  shipping_address jsonb not null,          -- {full_name, line1, line2, city, state, zip}
  created_at       timestamptz not null default now()
);

alter table public.user_orders enable row level security;

create policy "select own orders"
  on public.user_orders for select
  using (auth.uid() = user_id);

create policy "insert own orders"
  on public.user_orders for insert
  with check (auth.uid() = user_id);
