-- Migration: 001_create_daycares
-- Description: Create the daycares table (root entity) with RLS and seed data
-- Date: 2026-11-28

-- Create table
CREATE TABLE IF NOT EXISTS daycares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE daycares ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all daycares (public for now)
-- Tighten this when multi-tenancy is needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'daycares' 
    AND policyname = 'Authenticated users can read all daycares'
  ) THEN
    CREATE POLICY "Authenticated users can read all daycares"
      ON daycares
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Seed data: 4 example daycares for development
-- Uses ON CONFLICT (name) DO NOTHING to prevent duplicates on re-run
INSERT INTO daycares (name) VALUES
  ('Sunshine Room Daycare'),
  ('Rainbow Kids Daycare'),
  ('Little Stars Daycare'),
  ('Happy Hearts Daycare')
ON CONFLICT (name) DO NOTHING;
