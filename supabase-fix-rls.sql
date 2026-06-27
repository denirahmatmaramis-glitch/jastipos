-- Fix RLS policies: "for all" doesn't work properly in Supabase
-- Run this in Supabase SQL Editor

-- Drop existing policies
drop policy if exists "Owner can manage customers" on customers;
drop policy if exists "Owner can manage batches" on batches;
drop policy if exists "Owner can manage orders" on orders;
drop policy if exists "Owner can manage order items" on order_items;
drop policy if exists "Owner can manage payments" on payments;

-- Customers: separate policies per operation
create policy "customers_select" on customers for select using (auth.uid() = owner_id);
create policy "customers_insert" on customers for insert with check (auth.uid() = owner_id);
create policy "customers_update" on customers for update using (auth.uid() = owner_id);
create policy "customers_delete" on customers for delete using (auth.uid() = owner_id);

-- Batches: separate policies per operation
create policy "batches_select" on batches for select using (auth.uid() = owner_id);
create policy "batches_insert" on batches for insert with check (auth.uid() = owner_id);
create policy "batches_update" on batches for update using (auth.uid() = owner_id);
create policy "batches_delete" on batches for delete using (auth.uid() = owner_id);

-- Orders: separate policies per operation (+ public select for tracking)
drop policy if exists "Public can view order by token" on orders;
create policy "orders_select" on orders for select using (true);
create policy "orders_insert" on orders for insert with check (auth.uid() = owner_id);
create policy "orders_update" on orders for update using (auth.uid() = owner_id);
create policy "orders_delete" on orders for delete using (auth.uid() = owner_id);

-- Order items: separate policies per operation
drop policy if exists "Public can view order items" on order_items;
create policy "order_items_select" on order_items for select using (true);
create policy "order_items_insert" on order_items for insert
  with check (exists (select 1 from orders where orders.id = order_items.order_id and orders.owner_id = auth.uid()));
create policy "order_items_update" on order_items for update
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.owner_id = auth.uid()));
create policy "order_items_delete" on order_items for delete
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.owner_id = auth.uid()));

-- Payments: separate policies per operation
drop policy if exists "Public can view payments" on payments;
create policy "payments_select" on payments for select using (true);
create policy "payments_insert" on payments for insert
  with check (exists (select 1 from orders where orders.id = payments.order_id and orders.owner_id = auth.uid()));
create policy "payments_update" on payments for update
  using (exists (select 1 from orders where orders.id = payments.order_id and orders.owner_id = auth.uid()));
create policy "payments_delete" on payments for delete
  using (exists (select 1 from orders where orders.id = payments.order_id and orders.owner_id = auth.uid()));
