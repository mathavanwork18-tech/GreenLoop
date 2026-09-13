-- ==============================================================================
-- GREEN LOOP — ADMIN AUTHORIZATION & RECOMMENDATION ENGINE SCHEMA
-- ==============================================================================
-- Run this script in the Supabase Dashboard SQL Editor at:
-- https://supabase.com/dashboard/project/pzjczufhflhjcoorvubr/sql/new
--
-- This script configures:
-- 1. profiles_role_check constraint updated to include 'admin'
-- 2. recommendation_events table for AI Instagram-style personalization
-- 3. admin_audit_logs table for tracking administrator actions
-- 4. Admin Creator role assignment for Mathavan, Vimal Raj, Thiru Loop
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UPDATE ROLE CONSTRAINT TO INCLUDE 'admin'
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('citizen', 'shop', 'local_shop', 'recycler', 'company', 'admin'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 2. RECOMMENDATION EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recommendation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  post_id UUID REFERENCES public.e_waste_posts(id) ON DELETE CASCADE,
  category_id TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recommendation Events Indexes
CREATE INDEX IF NOT EXISTS idx_recommendation_events_user ON public.recommendation_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_events_type ON public.recommendation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_events_post ON public.recommendation_events(post_id);

-- ------------------------------------------------------------------------------
-- 3. ADMIN AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_name TEXT DEFAULT 'Green Loop Admin',
  action TEXT NOT NULL,
  target_record TEXT DEFAULT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON public.admin_audit_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.recommendation_events TO anon, authenticated;
GRANT ALL ON TABLE public.admin_audit_logs TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 4. RLS POLICIES FOR RECOMMENDATION EVENTS & AUDIT LOGS
-- ------------------------------------------------------------------------------
ALTER TABLE public.recommendation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- recommendation_events policies:
-- Users can insert their own events or anonymous events
DROP POLICY IF EXISTS "rec_events_insert_all" ON public.recommendation_events;
CREATE POLICY "rec_events_insert_all" ON public.recommendation_events
  FOR INSERT WITH CHECK (true);

-- Users can read their own recommendation events
DROP POLICY IF EXISTS "rec_events_select_own" ON public.recommendation_events;
CREATE POLICY "rec_events_select_own" ON public.recommendation_events
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- admin_audit_logs policies:
-- Only authenticated admins can insert and read audit logs
DROP POLICY IF EXISTS "admin_audit_logs_insert" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_insert" ON public.admin_audit_logs
  FOR INSERT WITH CHECK (
    auth.uid() = admin_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_audit_logs_select" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_select" ON public.admin_audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ------------------------------------------------------------------------------
-- 5. ADMIN CREATOR ACCOUNTS AUTHORIZATION
-- ------------------------------------------------------------------------------
-- Automatically assigns role = 'admin' for Creator accounts:
-- Mathavan, Vimal Raj, Thiru Loop
CREATE OR REPLACE FUNCTION public.authorize_admin_creators()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Match creators by full_name or email prefix
  UPDATE public.profiles
  SET role = 'admin'
  WHERE LOWER(full_name) IN (
    'mathavan', 'vimal raj', 'vimalraj', 'thiru loop', 'thiruloop'
  )
  OR id IN (
    SELECT id FROM auth.users
    WHERE LOWER(email) LIKE '%mathavan%'
       OR LOWER(email) LIKE '%vimal%'
       OR LOWER(email) LIKE '%thiru%'
  );
END;
$$;

-- Run authorization now
SELECT public.authorize_admin_creators();

-- Update trigger handle_new_user to maintain admin support
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
  v_raw_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'citizen'));
  
  -- Check if user is a designated creator admin
  v_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    SPLIT_PART(new.email, '@', 1),
    'Green Loop Citizen'
  );

  IF LOWER(v_name) IN ('mathavan', 'vimal raj', 'vimalraj', 'thiru loop', 'thiruloop')
     OR LOWER(new.email) LIKE '%mathavan%'
     OR LOWER(new.email) LIKE '%vimal%'
     OR LOWER(new.email) LIKE '%thiru%' THEN
    v_role := 'admin';
  ELSIF v_raw_role IN ('shop', 'local_shop') THEN
    v_role := 'shop';
  ELSIF v_raw_role IN ('company', 'recycler') THEN
    v_role := 'company';
  ELSIF v_raw_role = 'admin' THEN
    v_role := 'admin';
  ELSE
    v_role := 'citizen';
  END IF;

  v_phone := COALESCE(new.phone, new.raw_user_meta_data->>'phone', '');
  v_city := COALESCE(new.raw_user_meta_data->>'city', 'Coimbatore');
  v_address := COALESCE(new.raw_user_meta_data->>'address', '');

  INSERT INTO public.profiles (id, full_name, phone, role, city, address, created_at)
  VALUES (new.id, v_name, v_phone, v_role, v_city, v_address, now())
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE profiles.phone END,
    role = CASE WHEN profiles.role = 'admin' THEN 'admin' ELSE EXCLUDED.role END,
    city = EXCLUDED.city,
    address = EXCLUDED.address;

  RETURN new;
END;
$$;
