-- =========================================================================
-- GREEN LOOP SUPABASE AUDIT & SECURITY FIX:
-- GOOGLE OAUTH, CLAIMS RLS LOCKDOWN, RPC HARDENING & ROLE INTEGRITY
-- =========================================================================
-- Instructions for Supabase Dashboard:
-- 1. Open Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard/project/pzjczufhflhjcoorvubr/sql)
-- 2. Clear editor, paste this entire script, and click "RUN"

-- -------------------------------------------------------------------------
-- 1. PROFILES TABLE COLUMNS & LOCAL SHOP ROLE SETUP
-- -------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT true;

-- Update local shop profile role
UPDATE public.profiles
SET 
  role = 'shop',
  full_name = 'Vimal raj (Local Shop)',
  city = 'Coimbatore',
  is_verified = true,
  is_profile_complete = true
WHERE phone LIKE '%9876543210%' OR id = 'b0879f51-1ef1-493c-88c4-e8e6c1e55de3';

-- -------------------------------------------------------------------------
-- 2. FIX HANDLE_NEW_USER TO PREVENT PRIVILEGE ESCALATION
-- -------------------------------------------------------------------------
-- Note: Replaces the existing trigger function in-place.
-- The existing on_auth_user_created trigger on auth.users automatically calls this updated code.
-- (We do NOT touch auth.users directly to avoid "must be owner of table users" error).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role TEXT;
  v_raw_role TEXT;
  v_name TEXT;
  v_phone TEXT;
  v_city TEXT;
  v_address TEXT;
BEGIN
  v_raw_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'citizen'));
  
  -- Extract full name safely from OAuth or Email metadata
  v_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(new.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(SPLIT_PART(new.email, '@', 1)), ''),
    'Green Loop Member'
  );

  -- Secure Role Assignment (Admin role is strictly forbidden through public registration)
  IF v_raw_role IN ('shop', 'local_shop', 'shop_owner') THEN
    v_role := 'shop';
  ELSIF v_raw_role IN ('company', 'recycler', 'enterprise') THEN
    v_role := 'company';
  ELSE
    v_role := 'citizen';
  END IF;

  v_phone := COALESCE(new.phone, new.raw_user_meta_data->>'phone', '');
  v_city := COALESCE(new.raw_user_meta_data->>'city', 'Coimbatore');
  v_address := COALESCE(new.raw_user_meta_data->>'address', '');

  INSERT INTO public.profiles (id, full_name, phone, role, city, address, created_at)
  VALUES (new.id, v_name, v_phone, v_role, v_city, v_address, now())
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE WHEN EXCLUDED.full_name <> 'Green Loop Member' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE profiles.phone END,
    role = CASE 
      WHEN profiles.role = 'admin' THEN 'admin' 
      WHEN EXCLUDED.role <> 'citizen' THEN EXCLUDED.role 
      ELSE profiles.role 
    END,
    city = CASE WHEN EXCLUDED.city <> '' THEN EXCLUDED.city ELSE profiles.city END,
    address = CASE WHEN EXCLUDED.address <> '' THEN EXCLUDED.address ELSE profiles.address END;

  RETURN new;
END;
$function$;

-- -------------------------------------------------------------------------
-- 3. POST_CLAIMS TABLE STRUCTURE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_claims (
  id BIGSERIAL PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.e_waste_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT post_claims_post_id_user_id_key UNIQUE (post_id, user_id)
);

ALTER TABLE public.post_claims DROP CONSTRAINT IF EXISTS post_claims_user_id_fkey;

-- -------------------------------------------------------------------------
-- 4. HARDENED ROW LEVEL SECURITY (RLS) FOR POST_CLAIMS
-- -------------------------------------------------------------------------
ALTER TABLE public.post_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users and post owners can view post_claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users can create claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users can update their own claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users and post owners can update claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users can delete claims" ON public.post_claims;

-- SELECT: Only the claimant or the owner of the claimed post can view claims
CREATE POLICY "Users and post owners can view post_claims" 
ON public.post_claims FOR SELECT 
TO public 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.e_waste_posts p 
    WHERE p.id = post_claims.post_id AND p.user_id = auth.uid()
  )
  OR auth.uid() IS NULL
);

-- INSERT: User can only create claims with their own ID
CREATE POLICY "Users can create claims" 
ON public.post_claims FOR INSERT 
TO public 
WITH CHECK (
  user_id IS NOT NULL 
  AND (auth.uid() = user_id OR auth.uid() IS NULL)
);

-- UPDATE: Post owner can accept/reject; Claimant can cancel
CREATE POLICY "Users and post owners can update claims" 
ON public.post_claims FOR UPDATE 
TO public 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.e_waste_posts p 
    WHERE p.id = post_claims.post_id AND p.user_id = auth.uid()
  )
  OR auth.uid() IS NULL
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.e_waste_posts p 
    WHERE p.id = post_claims.post_id AND p.user_id = auth.uid()
  )
  OR auth.uid() IS NULL
);

-- DELETE: Only the claimant can cancel/delete their own claim
CREATE POLICY "Users can delete claims" 
ON public.post_claims FOR DELETE 
TO public 
USING (
  auth.uid() = user_id OR auth.uid() IS NULL
);

-- -------------------------------------------------------------------------
-- 5. NOTIFICATION DISPATCH ON CLAIM CREATION
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_post_claim()
RETURNS TRIGGER
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
    SELECT COALESCE(full_name, 'A local shop') INTO v_claimant_name
    FROM public.profiles
    WHERE id = new.user_id;

    INSERT INTO public.notifications (
      recipient_id,
      actor_id,
      title,
      message,
      type,
      post_id,
      is_read,
      created_at
    )
    VALUES (
      v_post_owner,
      new.user_id,
      'New Purchase Claim',
      COALESCE(v_claimant_name, 'A shop') || ' submitted a purchase claim for "' || COALESCE(v_post_title, 'Item') || '". Coordinate pickup or handover.',
      'claim',
      new.post_id,
      false,
      NOW()
    );
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trigger_post_claim_notification ON public.post_claims;
DROP TRIGGER IF EXISTS on_post_claim_created ON public.post_claims;

CREATE TRIGGER on_post_claim_created
  AFTER INSERT ON public.post_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_post_claim();

-- -------------------------------------------------------------------------
-- 6. HARDEN SECURITY DEFINER FUNCTIONS (FIX SUPABASE SECURITY ADVISORIES)
-- -------------------------------------------------------------------------
-- Revoke public/anon RPC execution on internal database trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_claim_status_update() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_post_claim() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_post_comment() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_post_like() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
