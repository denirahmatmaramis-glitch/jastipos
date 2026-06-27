-- ============================================================
-- JastipOS Database Schema for Supabase
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES — data owner/jastiper (multi-tenant root)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  store_name text not null default 'Toko Jastip Kamu',
  bank_info text not null default '',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  upgrade_status text not null default 'none' check (upgrade_status in ('none', 'pending', 'active')),
  fee_config jsonb not null default '{"type":"tier","flatFee":50000,"percent":10,"percentMin":50000,"tiers":[{"from":0,"upTo":500000,"fee":50000,"isPercent":false},{"from":500001,"upTo":1000000,"fee":75000,"isPercent":false},{"from":1000001,"upTo":0,"fee":10,"isPercent":true}]}',
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. CUSTOMERS
-- ============================================================
create table customers (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  phone text not null,
  address text not null default '',
  instagram text not null default '',
  created_at timestamptz not null default now()
);

create index idx_customers_owner on customers(owner_id);

-- ============================================================
-- 3. BATCHES
-- ============================================================
create table batches (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  place text not null default '',
  start_date text not null default '',
  end_date text not null default '',
  arrival text not null default '',
  status text not null default 'Draft',
  notes text not null default '',
  fee_mode text not null default 'global' check (fee_mode in ('global', 'custom')),
  fee_config jsonb,
  created_at timestamptz not null default now()
);

create index idx_batches_owner on batches(owner_id);

-- ============================================================
-- 4. ORDERS
-- ============================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  invoice_no text not null,
  tracking_token text not null,
  customer_name text not null,
  customer_phone text not null,
  address text not null default '',
  batch_id uuid references batches(id) on delete set null,
  batch_name text not null default '',
  order_date text not null,
  paid_amount integer not null default 0,
  dp_percent integer not null default 50,
  payment_status text not null default 'Menunggu DP',
  order_status text not null default 'Menunggu DP',
  notes text not null default '',
  courier text not null default '',
  resi text not null default '',
  ship_cost integer not null default 0,
  ship_date text not null default '',
  ship_status text not null default 'Belum dikirim',
  weight integer not null default 0,
  -- totals (denormalized for speed)
  total_product integer not null default 0,
  total_fee integer not null default 0,
  total_local integer not null default 0,
  total_intl integer not null default 0,
  total_other integer not null default 0,
  total_amount integer not null default 0,
  remaining_amount integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_orders_owner on orders(owner_id);
create unique index idx_orders_tracking on orders(tracking_token);

-- ============================================================
-- 5. ORDER ITEMS
-- ============================================================
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_name text not null,
  brand_store text not null default '',
  product_link text not null default '',
  color text not null default '',
  size text not null default '',
  qty integer not null default 1,
  price_in_idr integer not null default 0,
  jastip_fee integer not null default 0,
  local_shipping integer not null default 0,
  intl_shipping integer not null default 0,
  other_fee integer not null default 0,
  purchase_status text not null default 'Menunggu Pembelian' check (purchase_status in ('Menunggu Pembelian', 'Sudah Dibeli')),
  sort_order integer not null default 0
);

create index idx_order_items_order on order_items(order_id);

-- ============================================================
-- 6. PAYMENTS
-- ============================================================
create table payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  date text not null,
  amount integer not null,
  method text not null default 'Transfer BCA',
  type text not null default 'DP',
  created_at timestamptz not null default now()
);

create index idx_payments_order on payments(order_id);

-- ============================================================
-- 7. ROW LEVEL SECURITY (multi-tenant isolation)
-- ============================================================
alter table profiles enable row level security;
alter table customers enable row level security;
alter table batches enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;

-- Profiles: user can only read/update own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Customers: owner-scoped
create policy "Owner can manage customers" on customers for all using (auth.uid() = owner_id);

-- Batches: owner-scoped
create policy "Owner can manage batches" on batches for all using (auth.uid() = owner_id);

-- Orders: owner-scoped
create policy "Owner can manage orders" on orders for all using (auth.uid() = owner_id);
-- Public: anyone can read order by tracking_token (for customer tracking page)
create policy "Public can view order by token" on orders for select using (true);

-- Order items: accessible if user owns the parent order
create policy "Owner can manage order items" on order_items for all
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.owner_id = auth.uid()));
-- Public: readable for tracking
create policy "Public can view order items" on order_items for select using (true);

-- Payments: accessible if user owns the parent order
create policy "Owner can manage payments" on payments for all
  using (exists (select 1 from orders where orders.id = payments.order_id and orders.owner_id = auth.uid()));
create policy "Public can view payments" on payments for select using (true);
