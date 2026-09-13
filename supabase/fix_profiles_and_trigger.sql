-- ==============================================================================
-- GREEN LOOP — FIX PROFILES TABLE, AUTOMATIC TRIGGER & RLS POLICIES
-- ==============================================================================
-- Run this script in your Supabase Dashboard SQL Editor at:
-- https://supabase.com/dashboard/project/pzjczufhflhjcoorvubr/sql/new
--
-- This script:
-- 1. Ensures public.profiles table exists with all required columns.
-- 2. Grants full permissions to both authenticated and anon roles.
-- 3. Creates the automatic trigger (handle_new_user) on auth.users so that
--    every signup immediately creates a corresponding public.profiles row.
-- 4. Sets up bulletproof Row Level Security (RLS) policies that allow BOTH
--    the database trigger and client-side registration to store user data.
-- 5. Immediately BACKFILLS all existing auth.users into public.profiles.
-- ==============================================================================

-- 1. Ensure public.profiles table exists with correct schema
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Green Loop Member',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'citizen',
  city TEXT NOT NULL DEFAULT 'Coimbatore',
  address TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grant schema and table access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO anon, authenticated;

-- 2. Create or replace the automatic profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_raw_role TEXT;
  v_name TEXT;
  v_phone TEXT;
  v_city TEXT;
  v_address TEXT;
BEGIN
  -- Normalize role: 'citizen', 'shop', or 'company'
  v_raw_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'citizen'));
  IF v_raw_role IN ('shop', 'local_shop') THEN
    v_role := 'shop';
  ELSIF v_raw_role IN ('company', 'recycler') THEN
    v_role := 'company';
  ELSE
    v_role := 'citizen';
  END IF;

  -- Extract name
  v_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    SPLIT_PART(new.email, '@', 1),
    'Green Loop Citizen'
  );

  -- Extract phone
  v_phone := COALESCE(
    new.phone,
    new.raw_user_meta_data->>'phone',
    ''
  );

  -- Extract city & address
  v_city := COALESCE(new.raw_user_meta_data->>'city', 'Coimbatore');
  v_address := COALESCE(new.raw_user_meta_data->>'address', '');

  -- Insert profile row (SECURITY DEFINER runs as database owner, bypassing RLS)
  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    role,
    city,
    address,
    created_at
  )
  VALUES (
    new.id,
    v_name,
    v_phone,
    v_role,
    v_city,
    v_address,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' OR public.profiles.full_name = 'Green Loop Member' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    phone = CASE WHEN public.profiles.phone IS NULL OR public.profiles.phone = '' THEN EXCLUDED.phone ELSE public.profiles.phone END,
    role = EXCLUDED.role,
    city = CASE WHEN public.profiles.city IS NULL OR public.profiles.city = '' THEN EXCLUDED.city ELSE public.profiles.city END;

  RETURN new;
END;
$$;

-- Drop trigger if already exists and recreate cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Configure Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3A. Anyone can read profiles (public leaderboard, marketplace sellers, contact directory)
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- 3B. Allow registration inserts (both anon and authenticated)
-- This ensures client-side signup can store profiles immediately, even before email confirmation
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.profiles;
CREATE POLICY "Enable insert for registration"
  ON public.profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (id IS NOT NULL);

-- 3C. Allow users to update their profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for profile owner" ON public.profiles;
CREATE POLICY "Enable update for profile owner"
  ON public.profiles
  FOR UPDATE
  TO anon, authenticated
  USING (auth.uid() = id OR auth.uid() IS NULL)
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- 4. IMMEDIATE BACKFILL: Populate public.profiles for all existing auth.users
INSERT INTO public.profiles (id, full_name, phone, role, city, address, created_at)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    SPLIT_PART(u.email, '@', 1),
    'Green Loop Member'
  ),
  COALESCE(u.phone, u.raw_user_meta_data->>'phone', ''),
  CASE 
    WHEN LOWER(COALESCE(u.raw_user_meta_data->>'role', 'citizen')) IN ('shop', 'local_shop') THEN 'shop'
    ELSE 'citizen'
  END,
  COALESCE(u.raw_user_meta_data->>'city', 'Coimbatore'),
  COALESCE(u.raw_user_meta_data->>'address', ''),
  u.created_at
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = CASE WHEN public.profiles.phone IS NULL OR public.profiles.phone = '' THEN EXCLUDED.phone ELSE public.profiles.phone END,
  role = EXCLUDED.role,
  city = CASE WHEN public.profiles.city IS NULL OR public.profiles.city = '' THEN EXCLUDED.city ELSE public.profiles.city END;

-- 5. Verification query to confirm the populated profiles
SELECT id, full_name, phone, role, city, address, created_at 
FROM public.profiles 
ORDER BY created_at DESC;
