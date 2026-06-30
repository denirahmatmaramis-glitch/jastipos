-- Public function: ambil store_name dari tracking_token order (untuk halaman customer link)
-- Aman: hanya mengembalikan store_name, tidak membocorkan email/bank_info/plan.
-- Jalankan di Supabase SQL Editor.

create or replace function public.get_store_name_by_token(track_token text)
returns text
language sql
security definer
set search_path = public
as $$
  select p.store_name
  from orders o
  join profiles p on p.id = o.owner_id
  where o.tracking_token = track_token
  limit 1;
$$;

-- Izinkan anon (publik) memanggil function ini
grant execute on function public.get_store_name_by_token(text) to anon;
