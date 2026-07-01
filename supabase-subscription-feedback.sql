-- =============================================
-- JastipOS: Subscription Dates + Feedback Table
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1. Tambah kolom tanggal langganan Pro ke tabel profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_start_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_end_date   TIMESTAMPTZ;

-- 2. Buat tabel feedback
CREATE TABLE IF NOT EXISTS feedback (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  category   TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Aktifkan RLS untuk feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 4. Policy: user hanya bisa insert feedback miliknya sendiri
DROP POLICY IF EXISTS "Users insert own feedback" ON feedback;
CREATE POLICY "Users insert own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Selesai!
