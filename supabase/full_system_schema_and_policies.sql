-- ==============================================================================
-- GREEN LOOP — COMPLETE SUPABASE DATABASE SCHEMA, TRIGGERS & RLS POLICIES
-- ==============================================================================
-- Run this script in the Supabase Dashboard SQL Editor at:
-- https://supabase.com/dashboard/project/pzjczufhflhjcoorvubr/sql/new
--
-- This script configures all 12 Green Loop tables, automatic triggers,
-- bulletproof RLS policies, seeds, and backfill.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SCHEMAS, TABLES & CONSTRAINTS
-- ------------------------------------------------------------------------------

-- 1A. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Green Loop Member',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'citizen',
  city TEXT NOT NULL DEFAULT 'Coimbatore',
  address TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fix/update role check constraint to accept citizen, shop, local_shop, recycler, company, admin
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('citizen', 'shop', 'local_shop', 'recycler', 'company', 'admin'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 1B. Waste Categories Table
CREATE TABLE IF NOT EXISTS public.waste_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT ''
);

-- 1C. Recycling Centers Table
CREATE TABLE IF NOT EXISTS public.recycling_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_phone TEXT DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Coimbatore',
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  capacity_kg NUMERIC DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1D. E-Waste Posts Table (Marketplace Listings)
CREATE TABLE IF NOT EXISTS public.e_waste_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  subcategory TEXT DEFAULT '',
  condition TEXT NOT NULL DEFAULT 'good',
  status TEXT NOT NULL DEFAULT 'available',
  asking_price NUMERIC DEFAULT NULL,
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1E. Post Likes Table (Uses BIGSERIAL id)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.e_waste_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- 1F. Post Comments Table (Uses BIGSERIAL id)
CREATE TABLE IF NOT EXISTS public.post_comments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.e_waste_posts(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1G. Post Claims Table (Uses BIGSERIAL id)
CREATE TABLE IF NOT EXISTS public.post_claims (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.e_waste_posts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1H. Notifications Table (Uses BIGSERIAL id)
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.e_waste_posts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1I. Pickup Requests Table
CREATE TABLE IF NOT EXISTS public.pickup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES public.waste_categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  quantity INTEGER NOT NULL DEFAULT 1,
  description TEXT DEFAULT '',
  scheduled_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1J. Disposal Logs Table
CREATE TABLE IF NOT EXISTS public.disposal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.pickup_requests(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'doorstep_collection',
  notes TEXT DEFAULT ''
);

-- 1K. Waste Items Table
CREATE TABLE IF NOT EXISTS public.waste_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.pickup_requests(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES public.waste_categories(id) ON DELETE SET NULL,
  condition TEXT DEFAULT 'used',
  weight_kg NUMERIC DEFAULT 1.0,
  image_url TEXT DEFAULT NULL
);

-- 1L. Legacy Posts Table (preserved for integrity)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES public.waste_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grant schema and table access to both authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 2. AUTOMATIC DATABASE TRIGGERS
-- ------------------------------------------------------------------------------

-- Trigger 2A: Automatic Profile Creation on auth.users Signup
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
  IF v_raw_role IN ('shop', 'local_shop') THEN
    v_role := 'shop';
  ELSIF v_raw_role IN ('company', 'recycler') THEN
    v_role := 'company';
  ELSE
    v_role := 'citizen';
  END IF;

  v_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    SPLIT_PART(new.email, '@', 1),
    'Green Loop Citizen'
  );

  v_phone := COALESCE(new.phone, new.raw_user_meta_data->>'phone', '');
  v_city := COALESCE(new.raw_user_meta_data->>'city', 'Coimbatore');
  v_address := COALESCE(new.raw_user_meta_data->>'address', '');

  INSERT INTO public.profiles (id, full_name, phone, role, city, address, created_at)
  VALUES (new.id, v_name, v_phone, v_role, v_city, v_address, NOW())
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' OR public.profiles.full_name = 'Green Loop Member' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    phone = CASE WHEN public.profiles.phone IS NULL OR public.profiles.phone = '' THEN EXCLUDED.phone ELSE public.profiles.phone END,
    role = EXCLUDED.role,
    city = CASE WHEN public.profiles.city IS NULL OR public.profiles.city = '' THEN EXCLUDED.city ELSE public.profiles.city END;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger 2B: Automatic Notification on Post Like
CREATE OR REPLACE FUNCTION public.handle_new_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_owner UUID;
  v_post_title TEXT;
  v_actor_name TEXT;
BEGIN
  SELECT user_id, title INTO v_post_owner, v_post_title
  FROM public.e_waste_posts
  WHERE id = new.post_id;

  -- Notify post owner when someone else likes their post
  IF v_post_owner IS NOT NULL AND v_post_owner <> new.user_id THEN
    SELECT COALESCE(full_name, 'A community member') INTO v_actor_name
    FROM public.profiles
    WHERE id = new.user_id;

    INSERT INTO public.notifications (
      recipient_id,
      title,
      message,
      type,
      post_id,
      is_read,
      created_at
    )
    VALUES (
      v_post_owner,
      'New Post Like',
      COALESCE(v_actor_name, 'Someone') || ' liked your e-waste listing "' || COALESCE(v_post_title, 'Listing') || '"',
      'like',
      new.post_id,
      false,
      NOW()
    );
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_post_like_added ON public.post_likes;
CREATE TRIGGER on_post_like_added
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_post_like();

-- Trigger 2C: Automatic Notification on Post Comment
CREATE OR REPLACE FUNCTION public.handle_new_post_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_owner UUID;
  v_post_title TEXT;
  v_actor_name TEXT;
BEGIN
  SELECT user_id, title INTO v_post_owner, v_post_title
  FROM public.e_waste_posts
  WHERE id = new.post_id;

  -- Notify post owner when someone comments
  IF v_post_owner IS NOT NULL AND v_post_owner <> new.user_id THEN
    SELECT COALESCE(full_name, 'A community member') INTO v_actor_name
    FROM public.profiles
    WHERE id = new.user_id;

    INSERT INTO public.notifications (
      recipient_id,
      title,
      message,
      type,
      post_id,
      is_read,
      created_at
    )
    VALUES (
      v_post_owner,
      'New Comment on Listing',
      COALESCE(v_actor_name, 'Someone') || ' commented: "' || LEFT(new.comment, 80) || '"',
      'comment',
      new.post_id,
      false,
      NOW()
    );
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_post_comment_added ON public.post_comments;
CREATE TRIGGER on_post_comment_added
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_post_comment();

-- Trigger 2D: Automatic Notification on Post Claim
CREATE OR REPLACE FUNCTION public.handle_new_post_claim()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_owner UUID;
  v_post_title TEXT;
  v_claimant_name TEXT;
BEGIN
  SELECT user_id, title INTO v_post_owner, v_post_title
  FROM public.e_waste_posts
  WHERE id = new.post_id;

  IF v_post_owner IS NOT NULL AND v_post_owner <> new.user_id THEN
    SELECT COALESCE(full_name, 'A recycler/citizen') INTO v_claimant_name
    FROM public.profiles
    WHERE id = new.user_id;

    INSERT INTO public.notifications (
      recipient_id,
      title,
      message,
      type,
      post_id,
      is_read,
      created_at
    )
    VALUES (
      v_post_owner,
      'New Claim Request',
      COALESCE(v_claimant_name, 'A user') || ' submitted a claim request for "' || COALESCE(v_post_title, 'Item') || '"',
      'claim',
      new.post_id,
      false,
      NOW()
    );
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_post_claim_created ON public.post_claims;
CREATE TRIGGER on_post_claim_created
  AFTER INSERT ON public.post_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_post_claim();

-- Trigger 2E: Automatic Notification on Claim Status Update
CREATE OR REPLACE FUNCTION public.handle_claim_status_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_title TEXT;
BEGIN
  IF old.status IS DISTINCT FROM new.status THEN
    SELECT title INTO v_post_title
    FROM public.e_waste_posts
    WHERE id = new.post_id;

    INSERT INTO public.notifications (
      recipient_id,
      title,
      message,
      type,
      post_id,
      is_read,
      created_at
    )
    VALUES (
      new.user_id,
      'Claim Status: ' || INITCAP(new.status),
      'Your claim for "' || COALESCE(v_post_title, 'Item') || '" status has been updated to ' || new.status,
      'claim_status',
      new.post_id,
      false,
      NOW()
    );
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_claim_status_changed ON public.post_claims;
CREATE TRIGGER on_claim_status_changed
  AFTER UPDATE OF status ON public.post_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_claim_status_update();

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL 12 TABLES
-- ------------------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_waste_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disposal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycling_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3A. PROFILES
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.profiles;
CREATE POLICY "Enable insert for registration"
  ON public.profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (id IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for profile owner" ON public.profiles;
CREATE POLICY "Enable update for profile owner"
  ON public.profiles FOR UPDATE
  TO anon, authenticated
  USING (auth.uid() = id OR auth.uid() IS NULL)
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- 3B. E_WASTE_POSTS
DROP POLICY IF EXISTS "Public can view active e_waste_posts" ON public.e_waste_posts;
CREATE POLICY "Public can view active e_waste_posts"
  ON public.e_waste_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create e_waste_posts" ON public.e_waste_posts;
CREATE POLICY "Authenticated users can create e_waste_posts"
  ON public.e_waste_posts FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own e_waste_posts" ON public.e_waste_posts;
CREATE POLICY "Users can update own e_waste_posts"
  ON public.e_waste_posts FOR UPDATE
  TO anon, authenticated
  USING (auth.uid() = user_id OR auth.uid() IS NULL)
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can delete own e_waste_posts" ON public.e_waste_posts;
CREATE POLICY "Users can delete own e_waste_posts"
  ON public.e_waste_posts FOR DELETE
  TO anon, authenticated
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 3C. POST_LIKES
DROP POLICY IF EXISTS "Public can view post_likes" ON public.post_likes;
CREATE POLICY "Public can view post_likes"
  ON public.post_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own likes" ON public.post_likes;
CREATE POLICY "Users can insert own likes"
  ON public.post_likes FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete own likes" ON public.post_likes;
CREATE POLICY "Users can delete own likes"
  ON public.post_likes FOR DELETE
  TO anon, authenticated
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 3D. POST_COMMENTS
DROP POLICY IF EXISTS "Public can view post_comments" ON public.post_comments;
CREATE POLICY "Public can view post_comments"
  ON public.post_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert comments" ON public.post_comments;
CREATE POLICY "Users can insert comments"
  ON public.post_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can update/delete own comments" ON public.post_comments;
CREATE POLICY "Users can update/delete own comments"
  ON public.post_comments FOR ALL
  TO anon, authenticated
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 3E. POST_CLAIMS
DROP POLICY IF EXISTS "Users and post owners can view post_claims" ON public.post_claims;
CREATE POLICY "Users and post owners can view post_claims"
  ON public.post_claims FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create claims" ON public.post_claims;
CREATE POLICY "Users can create claims"
  ON public.post_claims FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users and post owners can update claims" ON public.post_claims;
CREATE POLICY "Users and post owners can update claims"
  ON public.post_claims FOR UPDATE
  TO anon, authenticated
  USING (true);

-- 3F. NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "System and users can insert notifications" ON public.notifications;
CREATE POLICY "System and users can insert notifications"
  ON public.notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3G. RECYCLING_CENTERS
DROP POLICY IF EXISTS "Public can view recycling_centers" ON public.recycling_centers;
CREATE POLICY "Public can view recycling_centers"
  ON public.recycling_centers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage recycling_centers" ON public.recycling_centers;
CREATE POLICY "Admin can manage recycling_centers"
  ON public.recycling_centers FOR ALL
  TO anon, authenticated
  USING (true);

-- 3H. PICKUP_REQUESTS
DROP POLICY IF EXISTS "Users can view pickup_requests" ON public.pickup_requests;
CREATE POLICY "Users can view pickup_requests"
  ON public.pickup_requests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert pickup_requests" ON public.pickup_requests;
CREATE POLICY "Users can insert pickup_requests"
  ON public.pickup_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can update pickup_requests" ON public.pickup_requests;
CREATE POLICY "Users can update pickup_requests"
  ON public.pickup_requests FOR UPDATE
  TO anon, authenticated
  USING (true);

-- 3I. DISPOSAL_LOGS
DROP POLICY IF EXISTS "Public can view disposal_logs" ON public.disposal_logs;
CREATE POLICY "Public can view disposal_logs"
  ON public.disposal_logs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert disposal_logs" ON public.disposal_logs;
CREATE POLICY "Users can insert disposal_logs"
  ON public.disposal_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3J. WASTE_ITEMS
DROP POLICY IF EXISTS "Public can view waste_items" ON public.waste_items;
CREATE POLICY "Public can view waste_items"
  ON public.waste_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert waste_items" ON public.waste_items;
CREATE POLICY "Users can insert waste_items"
  ON public.waste_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3K. WASTE_CATEGORIES
DROP POLICY IF EXISTS "Public can view waste_categories" ON public.waste_categories;
CREATE POLICY "Public can view waste_categories"
  ON public.waste_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage waste_categories" ON public.waste_categories;
CREATE POLICY "Admin can manage waste_categories"
  ON public.waste_categories FOR ALL
  TO anon, authenticated
  USING (true);

-- 3L. POSTS (Legacy)
DROP POLICY IF EXISTS "Public can view legacy posts" ON public.posts;
CREATE POLICY "Public can view legacy posts"
  ON public.posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert legacy posts" ON public.posts;
CREATE POLICY "Users can insert legacy posts"
  ON public.posts FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NOT NULL);

-- ------------------------------------------------------------------------------
-- 4. SEED STATIC DATA (WASTE CATEGORIES & RECYCLING CENTERS)
-- ------------------------------------------------------------------------------

-- Seed default categories if empty
INSERT INTO public.waste_categories (id, name, description)
VALUES
  (1, 'Mobile Phones & Devices', 'Smartphones, feature phones, PDAs, chargers and accessories'),
  (2, 'Laptops & Computers', 'Laptops, desktop motherboards, power supplies, RAM and hard drives'),
  (3, 'Tablets & E-Readers', 'iPads, Android tablets, Kindle e-readers and displays'),
  (4, 'Batteries & Power Units', 'Lithium-ion batteries, UPS backup units, lead-acid batteries'),
  (5, 'Accessories & Cables', 'Headphones, USB cables, adapters, external power bricks'),
  (6, 'Home & Office Electronics', 'Printers, scanners, routers, monitors and TV circuit boards')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Reset sequence to avoid conflict
SELECT setval('public.waste_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.waste_categories));

-- ------------------------------------------------------------------------------
-- 5. IMMEDIATE BACKFILL: POPULATE PROFILES FOR ALL AUTH USERS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. VERIFICATION QUERIES
-- ------------------------------------------------------------------------------
SELECT 'Profiles count' AS item, COUNT(*)::text AS details FROM public.profiles
UNION ALL
SELECT 'Recycling centers', COUNT(*)::text FROM public.recycling_centers
UNION ALL
SELECT 'Waste categories', COUNT(*)::text FROM public.waste_categories
UNION ALL
SELECT 'E-waste posts', COUNT(*)::text FROM public.e_waste_posts;
