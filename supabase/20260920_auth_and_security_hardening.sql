-- ==============================================================================
-- GREEN LOOP — COMPREHENSIVE AUTHENTICATION & RLS SECURITY HARDENING MIGRATION
-- ==============================================================================
-- Resolves all P0 Supabase security vulnerabilities:
-- 1. Eliminates wide-open 'auth.uid() IS NULL' policies and 'TO anon' write policies.
-- 2. Restricts profile INSERT and UPDATE exclusively to the authenticated profile owner.
-- 3. Adds server-side trigger preventing unauthorized privilege escalation to 'admin'.
-- 4. Locks down e_waste_posts, post_likes, post_comments, and post_claims to authorized owners.
-- 5. Hardens SECURITY DEFINER functions with strict search_path = public, pg_temp.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE SECURITY & ROLE PROTECTION
-- ------------------------------------------------------------------------------

-- Ensure role check constraint allows standard roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('citizen', 'shop', 'local_shop', 'recycler', 'company', 'admin'));

-- Ensure phone_verified column exists, defaulting to false
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Ensure is_profile_complete column exists with DEFAULT false (new Google OAuth users start incomplete)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN is_profile_complete SET DEFAULT false;

-- Preserve existing profiles as complete
UPDATE public.profiles 
SET is_profile_complete = true 
WHERE is_profile_complete IS NULL;

-- Drop all insecure or deprecated policies on public.profiles
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for profile owner" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1A. Anyone can view profiles (needed for post author, shop name, public badges)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- 1B. Authenticated users can insert ONLY their own profile record (matching auth.uid())
CREATE POLICY "Authenticated users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 1C. Authenticated users can update ONLY their own profile
CREATE POLICY "Authenticated users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 1D. Trigger: Strictly prevent self-escalation to 'admin'
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Prevent role modification to 'admin' unless invoked by superuser (postgres) or service_role
  IF NEW.role = 'admin' AND (OLD.role IS NULL OR OLD.role <> 'admin') THEN
    IF CURRENT_USER <> 'postgres' AND COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'role', '') <> 'service_role' THEN
      RAISE EXCEPTION 'Unauthorized: The admin role cannot be self-assigned.';
    END IF;
  END IF;

  -- Default to citizen if role is empty or invalid
  IF NEW.role IS NULL OR NEW.role = '' THEN
    NEW.role := 'citizen';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();


-- ------------------------------------------------------------------------------
-- 2. E-WASTE POSTS (MARKETPLACE) SECURITY
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view active e_waste_posts" ON public.e_waste_posts;
DROP POLICY IF EXISTS "Authenticated users can create e_waste_posts" ON public.e_waste_posts;
DROP POLICY IF EXISTS "Users can update own e_waste_posts" ON public.e_waste_posts;
DROP POLICY IF EXISTS "Users can delete own e_waste_posts" ON public.e_waste_posts;

ALTER TABLE public.e_waste_posts ENABLE ROW LEVEL SECURITY;

-- Public can view posts
CREATE POLICY "Public can view active e_waste_posts"
  ON public.e_waste_posts FOR SELECT
  USING (true);

-- Only authenticated users can create posts under their own ID
CREATE POLICY "Authenticated users can create e_waste_posts"
  ON public.e_waste_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can update their own posts
CREATE POLICY "Users can update own e_waste_posts"
  ON public.e_waste_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete their own posts
CREATE POLICY "Users can delete own e_waste_posts"
  ON public.e_waste_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 3. POST LIKES & COMMENTS SECURITY
-- ------------------------------------------------------------------------------

-- Likes
DROP POLICY IF EXISTS "Public can view post_likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.post_likes;

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view post_likes"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON public.post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments
DROP POLICY IF EXISTS "Public can view post_comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update/delete own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view post_comments"
  ON public.post_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert comments"
  ON public.post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.post_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 4. POST CLAIMS (PURCHASE / COLLECTION REQUESTS)
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users and post owners can view post_claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users can create claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users and post owners can update claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users can delete own claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users can delete claims" ON public.post_claims;

ALTER TABLE public.post_claims ENABLE ROW LEVEL SECURITY;

-- Post owners and claimants can view claims for the relevant post
CREATE POLICY "Users and post owners can view post_claims"
  ON public.post_claims FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT p.user_id FROM public.e_waste_posts p WHERE p.id = post_claims.post_id)
  );

-- Only authenticated users can submit a claim for an item under their own ID
CREATE POLICY "Users can create claims"
  ON public.post_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only claimant or post owner can update the claim (e.g. accept/reject/complete)
CREATE POLICY "Users and post owners can update claims"
  ON public.post_claims FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT p.user_id FROM public.e_waste_posts p WHERE p.id = post_claims.post_id)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT p.user_id FROM public.e_waste_posts p WHERE p.id = post_claims.post_id)
  );

-- Only the claimant can cancel/delete their own pending claim
CREATE POLICY "Users can delete own claims"
  ON public.post_claims FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 5. NOTIFICATIONS SECURITY
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can mark their notifications as read" ON public.notifications;
DROP POLICY IF EXISTS "System and users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);


-- ------------------------------------------------------------------------------
-- 6. HARDEN TRIGGER FUNCTIONS WITH STRICT SEARCH PATH
-- ------------------------------------------------------------------------------

-- Auth User Created Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_name TEXT;
  v_phone TEXT;
  v_role TEXT;
  v_city TEXT;
  v_address TEXT;
  v_is_complete BOOLEAN;
BEGIN
  v_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    SPLIT_PART(COALESCE(new.email, ''), '@', 1),
    'Green Loop Member'
  );

  v_phone := COALESCE(
    new.phone,
    new.raw_user_meta_data->>'phone',
    ''
  );

  v_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'citizen'));
  IF v_role NOT IN ('citizen', 'shop', 'local_shop', 'recycler', 'company') THEN
    v_role := 'citizen'; -- Safe default role, never auto-assign admin!
  END IF;

  v_city := COALESCE(new.raw_user_meta_data->>'city', 'Coimbatore');
  v_address := COALESCE(new.raw_user_meta_data->>'address', new.raw_user_meta_data->>'shopAddress', '');
  
  -- Profile completion flag: false for new Google OAuth signups until they complete onboarding
  v_is_complete := COALESCE((new.raw_user_meta_data->>'is_profile_complete')::boolean, false);

  INSERT INTO public.profiles (id, full_name, phone, phone_verified, role, city, address, is_profile_complete, created_at)
  VALUES (new.id, v_name, v_phone, false, v_role, v_city, v_address, v_is_complete, NOW())
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' OR public.profiles.full_name = 'Green Loop Member' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    phone = CASE WHEN public.profiles.phone IS NULL OR public.profiles.phone = '' THEN EXCLUDED.phone ELSE public.profiles.phone END,
    phone_verified = COALESCE(public.profiles.phone_verified, false),
    role = CASE WHEN public.profiles.role = 'admin' THEN 'admin' ELSE EXCLUDED.role END,
    city = CASE WHEN public.profiles.city IS NULL OR public.profiles.city = '' THEN EXCLUDED.city ELSE public.profiles.city END;

  RETURN new;
END;
$$;

-- Secure notification trigger functions
ALTER FUNCTION public.handle_new_post_like() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_post_comment() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_post_claim() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_claim_status_update() SET search_path = public, pg_temp;
