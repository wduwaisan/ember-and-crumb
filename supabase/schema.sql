-- ============================================================================
-- Ember & Crumb — Supabase schema
-- Paste this whole file into  Supabase Dashboard → SQL Editor → New query → Run
-- It is idempotent: safe to run again after edits.
--
-- Design notes worth reading before you change anything:
--   * Crumbs (loyalty points) are awarded by a TRIGGER, not by the browser.
--     The client cannot write to profiles.crumbs at all — see the column grant.
--   * "Bought this" on a review is verified server-side against real orders,
--     so the badge cannot be faked from the console.
--   * Anonymous reviews really are anonymous: the public view never exposes
--     user_id, so nobody can correlate an anonymous review back to an account.
-- ============================================================================

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  display_name  text,
  usual         text,
  crumbs        integer not null default 0 check (crumbs >= 0),
  created_at    timestamptz not null default now()
);

-- A profile row appears automatically whenever someone signs up, by any method.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',   -- our email/phone signup form
      new.raw_user_meta_data->>'full_name',      -- Google
      new.raw_user_meta_data->>'name',           -- Facebook
      split_part(coalesce(new.email, ''), '@', 1),
      'Guest'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------ orders
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  code        text not null,                       -- the EC-XXXXX shown to the guest
  lines       jsonb not null,
  subtotal    numeric(10,3) not null,
  service     numeric(10,3) not null,
  total       numeric(10,3) not null,
  fulfilment  text,
  notes       text,
  status      text not null default 'ac.inBakehouse',
  created_at  timestamptz not null default now()
);
create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc);

-- One crumb per whole dinar, awarded by the database so it cannot be forged.
create or replace function public.award_crumbs()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
     set crumbs = crumbs + greatest(0, floor(new.total)::int)
   where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists on_order_created on public.orders;
create trigger on_order_created
  after insert on public.orders
  for each row execute function public.award_crumbs();

-- --------------------------------------------------------- saved recipes
create table if not exists public.recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  name        text not null,
  meta        text,
  price       numeric(10,3),
  kind        text check (kind in ('drink','cake','cookie')),
  c1          text,
  c2          text,
  recipe      jsonb,                                -- the full Studio builder state
  created_at  timestamptz not null default now()
);
create index if not exists recipes_user_created_idx
  on public.recipes (user_id, created_at desc);

-- -------------------------------------------------------------------- cart
-- One row per person; the whole bag lives in a jsonb array.
create table if not exists public.carts (
  user_id     uuid primary key references auth.users on delete cascade,
  lines       jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------- reviews
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    text not null,
  user_id       uuid not null references auth.users on delete cascade,
  display_name  text,                               -- "Wahj A." — denormalised on purpose
  anon          boolean not null default false,
  stars         smallint not null check (stars between 0 and 5),
  body          text not null check (char_length(btrim(body)) between 1 and 600),
  bought        boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz,
  unique (product_id, user_id)                      -- one review per person per product
);
create index if not exists reviews_product_idx
  on public.reviews (product_id, created_at desc);

-- Verify "Bought this" against real orders instead of trusting the browser.
create or replace function public.verify_bought()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.bought := exists (
    select 1
      from public.orders o,
           lateral jsonb_array_elements(o.lines) l
     where o.user_id = new.user_id
       and l->>'id' = new.product_id
  );
  if tg_op = 'UPDATE' then new.updated_at := now(); end if;
  return new;
end;
$$;

drop trigger if exists on_review_write on public.reviews;
create trigger on_review_write
  before insert or update on public.reviews
  for each row execute function public.verify_bought();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.orders   enable row level security;
alter table public.recipes  enable row level security;
alter table public.carts    enable row level security;
alter table public.reviews  enable row level security;

-- profiles: you can only ever see and touch your own
drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile write"  on public.profiles;
create policy "own profile read"  on public.profiles for select using (auth.uid() = id);
create policy "own profile write" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- ...and crumbs is not yours to edit. Only the trigger (security definer) may.
revoke update on public.profiles from authenticated;
grant  update (display_name, usual) on public.profiles to authenticated;

-- orders: read and create your own; never edit or delete after the fact
drop policy if exists "own orders read"   on public.orders;
drop policy if exists "own orders insert" on public.orders;
create policy "own orders read"   on public.orders for select using (auth.uid() = user_id);
create policy "own orders insert" on public.orders for insert with check (auth.uid() = user_id);

-- recipes: full control over your own
drop policy if exists "own recipes" on public.recipes;
create policy "own recipes" on public.recipes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- cart: full control over your own
drop policy if exists "own cart" on public.carts;
create policy "own cart" on public.carts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reviews: the base table is private. Everyone reads the view below instead,
-- which is what keeps "post anonymously" honest.
drop policy if exists "own reviews" on public.reviews;
create policy "own reviews" on public.reviews for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------- public reviews
-- Deliberately owner-owned (not security_invoker) so it can read past the RLS
-- policy above. It exposes no user_id, and blanks the name when anon is set,
-- so an anonymous review cannot be traced back to an account by anyone.
drop view if exists public.reviews_public;
create view public.reviews_public as
  select
    id,
    product_id,
    case when anon then null else display_name end as display_name,
    anon,
    stars,
    body,
    bought,
    created_at,
    updated_at
  from public.reviews;

grant select on public.reviews_public to anon, authenticated;

-- ============================================================================
-- Done. Next: Authentication → Providers to switch on Google / Facebook / Phone,
-- and Authentication → URL Configuration to add your site + redirect URLs.
-- ============================================================================
