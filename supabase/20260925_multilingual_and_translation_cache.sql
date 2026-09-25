-- ==============================================================================
-- GREEN LOOP — MULTILINGUAL SYSTEM & TRANSLATION CACHE SCHEMA
-- ==============================================================================
-- Run this migration in the Supabase Dashboard SQL Editor at:
-- https://supabase.com/dashboard/project/pzjczufhflhjcoorvubr/sql/new
--
-- This script configures:
-- 1. Persistent preferred_language on user profiles.
-- 2. Non-destructive original content storage (original_title, original_description, original_language)
--    on public.e_waste_posts.
-- 3. Dedicated post_translations cache table with unique constraints and fast indexes.
-- 4. Secure RLS policies enabling viewer-specific multilingual marketplace display.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USER PROFILES: PERSISTENT PREFERRED LANGUAGE
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- ------------------------------------------------------------------------------
-- 2. E-WASTE POSTS: NON-DESTRUCTIVE ORIGINAL CONTENT STORAGE
-- ------------------------------------------------------------------------------
ALTER TABLE public.e_waste_posts
ADD COLUMN IF NOT EXISTS original_title TEXT;

ALTER TABLE public.e_waste_posts
ADD COLUMN IF NOT EXISTS original_description TEXT;

ALTER TABLE public.e_waste_posts
ADD COLUMN IF NOT EXISTS original_language TEXT DEFAULT 'en';

-- Backfill original content for existing posts without overwriting anything
UPDATE public.e_waste_posts
SET original_title = title
WHERE original_title IS NULL;

UPDATE public.e_waste_posts
SET original_description = description
WHERE original_description IS NULL;

UPDATE public.e_waste_posts
SET original_language = 'en'
WHERE original_language IS NULL;

-- ------------------------------------------------------------------------------
-- 3. DEDICATED POST TRANSLATIONS CACHE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.e_waste_posts(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  translated_title TEXT NOT NULL,
  translated_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, language)
);

-- Fast composite index for viewer-specific cache lookups
CREATE INDEX IF NOT EXISTS idx_post_translations_lookup
  ON public.post_translations(post_id, language);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.post_translations ENABLE ROW LEVEL SECURITY;

-- Allow all users (authenticated and anonymous viewers) to read cached translations
DROP POLICY IF EXISTS "Public can view post translations" ON public.post_translations;
CREATE POLICY "Public can view post translations"
  ON public.post_translations FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users and service roles to insert new cached translations
DROP POLICY IF EXISTS "Anyone can insert post translations" ON public.post_translations;
CREATE POLICY "Anyone can insert post translations"
  ON public.post_translations FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow updating cached translations if re-translated
DROP POLICY IF EXISTS "Anyone can update post translations" ON public.post_translations;
CREATE POLICY "Anyone can update post translations"
  ON public.post_translations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Confirmation query
SELECT
  'Post translations table ready' AS status,
  COUNT(*)::text AS cached_translations_count
FROM public.post_translations;
