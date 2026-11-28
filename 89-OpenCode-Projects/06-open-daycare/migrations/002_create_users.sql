-- Migration: 002_create_users
-- Description: Create users table with enums, RLS, and auth trigger
-- Date: 2026-11-28
-- Depends on: 001_create_daycares

-- Create enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('staff', 'parent', 'admin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('pending', 'active');
  END IF;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daycare_id uuid NOT NULL REFERENCES public.daycares(id),
  role user_role NOT NULL DEFAULT 'staff',
  status user_status NOT NULL DEFAULT 'active',
  full_name text NOT NULL,
  avatar_url text,
  notify_on_post boolean NOT NULL DEFAULT true,
  daily_summary_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policy: authenticated users can read all users (for now)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Authenticated users can read all users'
  ) THEN
    CREATE POLICY "Authenticated users can read all users"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Function to handle new user creation (SECURITY DEFINER)
-- Reads daycare_id, role, and full_name from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only insert if daycare_id is provided in metadata
  IF NEW.raw_user_meta_data->>'daycare_id' IS NOT NULL THEN
    INSERT INTO public.users (id, daycare_id, role, full_name)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'daycare_id')::uuid,
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff'),
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unnamed User')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger: fires after insert on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
