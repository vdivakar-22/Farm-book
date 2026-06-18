-- FarmBook Supabase Database Schema Setup
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- =========================================================================
-- 1. DROP TABLES (If you want to start fresh, uncomment the lines below)
-- =========================================================================
-- DROP TABLE IF EXISTS crop_expenses CASCADE;
-- DROP TABLE IF EXISTS crops CASCADE;
-- DROP TABLE IF EXISTS cattle CASCADE;
-- DROP TABLE IF EXISTS cattle_types CASCADE;
-- DROP TABLE IF EXISTS workers CASCADE;
-- DROP TABLE IF EXISTS machinery CASCADE;

-- =========================================================================
-- 2. CREATE TABLES
-- =========================================================================

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  revenue NUMERIC NOT NULL DEFAULT 0,
  cultivated_date DATE,
  harvesting_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Crop Expenses table
CREATE TABLE IF NOT EXISTS crop_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Cattle Types table
CREATE TABLE IF NOT EXISTS cattle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Cattle table
CREATE TABLE IF NOT EXISTS cattle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id UUID NOT NULL REFERENCES cattle_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cost NUMERIC,
  purpose TEXT,
  gender TEXT,
  lactation TEXT,
  lactation_date DATE,
  lactation_count INT,
  calf_gender TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift TEXT NOT NULL DEFAULT 'full',
  field_name TEXT,
  crop TEXT,
  salary NUMERIC NOT NULL DEFAULT 0,
  advance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Machinery table
CREATE TABLE IF NOT EXISTS machinery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  field_name TEXT,
  purpose TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
-- For local/demo testing, we disable RLS so that any client can read/write.
-- If you want to configure secure access, enable RLS and use proper user auth policies.

ALTER TABLE crops DISABLE ROW LEVEL SECURITY;
ALTER TABLE crop_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE cattle_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE cattle DISABLE ROW LEVEL SECURITY;
ALTER TABLE workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE machinery DISABLE ROW LEVEL SECURITY;

-- OPTIONAL: If you want to keep RLS enabled but allow public access:
/*
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Access" ON crops FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE crop_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Access" ON crop_expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE cattle_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Access" ON cattle_types FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE cattle ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Access" ON cattle FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Access" ON workers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE machinery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Access" ON machinery FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
*/

-- =========================================================================
-- 4. SEED SAMPLE DATA
-- =========================================================================

-- Insert Crops
INSERT INTO crops (id, name, image_url, revenue, cultivated_date, harvesting_date, created_at)
VALUES 
  ('d7b30c4e-b5f7-4f6c-8bb3-47cb23214872', 'Paddy', NULL, 25000, '2026-05-01', '2026-09-15', NOW() - INTERVAL '30 days'),
  ('a5b30c4e-b5f7-4f6c-8bb3-47cb23214873', 'Wheat', NULL, 30000, '2025-11-10', '2026-04-05', NOW() - INTERVAL '60 days'),
  ('c9b30c4e-b5f7-4f6c-8bb3-47cb23214874', 'Tomato', NULL, 15000, '2026-04-12', '2026-07-20', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Crop Expenses
INSERT INTO crop_expenses (id, crop_id, category, amount, note, created_at)
VALUES
  ('e3a890b2-29ac-40d9-81a1-5527f3299ad1', 'd7b30c4e-b5f7-4f6c-8bb3-47cb23214872', 'Ploughing', 8000, '2 acres, tractor rent', NOW() - INTERVAL '28 days'),
  ('e3a890b2-29ac-40d9-81a1-5527f3299ad2', 'd7b30c4e-b5f7-4f6c-8bb3-47cb23214872', 'Seeds', 2500, 'Paddy nursery seeds', NOW() - INTERVAL '25 days'),
  ('e3a890b2-29ac-40d9-81a1-5527f3299ad3', 'd7b30c4e-b5f7-4f6c-8bb3-47cb23214872', 'Sowing', 3000, 'Manual labor', NOW() - INTERVAL '24 days'),
  ('e3a890b2-29ac-40d9-81a1-5527f3299ad4', 'a5b30c4e-b5f7-4f6c-8bb3-47cb23214873', 'Fertilizers', 5000, 'Urea and NPK', NOW() - INTERVAL '45 days'),
  ('e3a890b2-29ac-40d9-81a1-5527f3299ad5', 'a5b30c4e-b5f7-4f6c-8bb3-47cb23214873', 'Harvesting', 7500, 'Combine harvester rent', NOW() - INTERVAL '5 days'),
  ('e3a890b2-29ac-40d9-81a1-5527f3299ad6', 'c9b30c4e-b5f7-4f6c-8bb3-47cb23214874', 'Irrigation', 1500, 'Diesel for water pump', NOW() - INTERVAL '10 days'),
  ('e3a890b2-29ac-40d9-81a1-5527f3299ad7', 'c9b30c4e-b5f7-4f6c-8bb3-47cb23214874', 'Pesticides', 2000, 'Organic sprays', NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Cattle Types
INSERT INTO cattle_types (id, type, image_url, created_at)
VALUES 
  ('e1b30c4e-b5f7-4f6c-8bb3-47cb23214875', 'Cow', NULL, NOW() - INTERVAL '120 days'),
  ('f2b30c4e-b5f7-4f6c-8bb3-47cb23214876', 'Goat', NULL, NOW() - INTERVAL '110 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Cattle
INSERT INTO cattle (id, type_id, name, cost, purpose, gender, lactation, lactation_date, created_at)
VALUES
  ('c0a890b2-29ac-40d9-81a1-5527f3299ac1', 'e1b30c4e-b5f7-4f6c-8bb3-47cb23214875', 'Lakshmi', 45000, 'Milk', 'Female', 'Lactating', '2026-04-10', NOW() - INTERVAL '100 days'),
  ('c0a890b2-29ac-40d9-81a1-5527f3299ac2', 'e1b30c4e-b5f7-4f6c-8bb3-47cb23214875', 'Ganga', 42000, 'Milk', 'Female', 'Pregnant', '2026-05-15', NOW() - INTERVAL '80 days'),
  ('c0a890b2-29ac-40d9-81a1-5527f3299ac3', 'f2b30c4e-b5f7-4f6c-8bb3-47cb23214876', 'Blackie', 8500, 'Meat', 'Male', NULL, NULL, NOW() - INTERVAL '40 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Workers
INSERT INTO workers (id, name, work_date, shift, field_name, crop, salary, advance, created_at)
VALUES
  ('10a890b2-29ac-40d9-81a1-5527f3299ab1', 'Ramesh Kumar', CURRENT_DATE, 'full', 'North Field', 'Paddy', 500, 0, NOW()),
  ('10a890b2-29ac-40d9-81a1-5527f3299ab2', 'Suresh Singh', CURRENT_DATE, 'full', 'South Field', 'Tomato', 500, 0, NOW()),
  ('10a890b2-29ac-40d9-81a1-5527f3299ab3', 'Sunita Devi', CURRENT_DATE - 1, 'half', 'Greenhouse', 'Tomato', 300, 0, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Machinery
INSERT INTO machinery (id, name, work_date, field_name, purpose, cost, created_at)
VALUES
  ('20a890b2-29ac-40d9-81a1-5527f3299aa1', 'John Deere Tractor', CURRENT_DATE - 3, 'North Field', 'Ploughing', 3500, NOW()),
  ('20a890b2-29ac-40d9-81a1-5527f3299aa2', 'Water Pump', CURRENT_DATE - 1, 'South Field', 'Irrigation', 1200, NOW())
ON CONFLICT (id) DO NOTHING;

-- Cattle Expenses table
CREATE TABLE IF NOT EXISTS cattle_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cattle_id UUID NOT NULL REFERENCES cattle(id) ON DELETE CASCADE,
  food_type TEXT NOT NULL,
  milk_liters NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE cattle_expenses DISABLE ROW LEVEL SECURITY;

-- Insert Cattle Expenses
INSERT INTO cattle_expenses (id, cattle_id, food_type, milk_liters, amount, start_date, end_date, created_at)
VALUES
  ('e0a890b2-29ac-40d9-81a1-5527f3299ad1', 'c0a890b2-29ac-40d9-81a1-5527f3299ac1', 'Cotton Seed', 10, 1500, '2026-06-01', '2026-06-07', NOW() - INTERVAL '10 days'),
  ('e0a890b2-29ac-40d9-81a1-5527f3299ad2', 'c0a890b2-29ac-40d9-81a1-5527f3299ac1', 'Rice Husk', 12, 1200, '2026-06-08', '2026-06-14', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

