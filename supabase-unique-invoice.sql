-- =============================================
-- JastipOS: Cegah nomor invoice tabrakan
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Jaring pengaman terakhir: nomor invoice harus unik per toko (owner_id).
-- Kalaupun terjadi race condition (mis. 2 tab/device buat order bersamaan),
-- insert kedua akan ditolak database daripada diam-diam membuat invoice ganda.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_owner_invoice
  ON orders(owner_id, invoice_no);
