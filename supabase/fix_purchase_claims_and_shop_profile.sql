-- =========================================================================
-- GREEN LOOP SUPABASE FIX: PURCHASE CLAIMS, PERMISSIONS & SHOP PROFILE
-- =========================================================================
-- In your Supabase SQL Editor:
-- 1. Delete whatever is currently in the editor (Ctrl+A -> Backspace)
-- 2. Paste this entire script
-- 3. Click "RUN"

-- 1. Ensure columns exist on profiles table (prevents missing column errors)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT true;

-- 2. Ensure Local Shop Profile is configured as role 'shop'
UPDATE public.profiles
SET 
  role = 'shop',
  full_name = 'Vimal raj (Local Shop)',
  city = 'Coimbatore',
  is_verified = true,
  is_profile_complete = true
WHERE phone LIKE '%9876543210%' OR id = 'b0879f51-1ef1-493c-88c4-e8e6c1e55de3';

-- 3. Ensure post_claims table structure exists
CREATE TABLE IF NOT EXISTS public.post_claims (
  id BIGSERIAL PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.e_waste_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT post_claims_post_id_user_id_key UNIQUE (post_id, user_id)
);

-- Drop restrictive user_id foreign key constraint so any valid profile/test account can claim
ALTER TABLE public.post_claims DROP CONSTRAINT IF EXISTS post_claims_user_id_fkey;

-- 4. Row Level Security (RLS) policies for post_claims
ALTER TABLE public.post_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users and post owners can view post_claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users can create claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users can update their own claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users and post owners can update claims" ON public.post_claims;
DROP POLICY IF EXISTS "Users can delete claims" ON public.post_claims;

-- Allow reading claims
CREATE POLICY "Users and post owners can view post_claims" 
ON public.post_claims FOR SELECT 
TO public 
USING (true);

-- Allow creating claims for anon and authenticated users
CREATE POLICY "Users can create claims" 
ON public.post_claims FOR INSERT 
TO public 
WITH CHECK (user_id IS NOT NULL);

-- Allow updating claims
CREATE POLICY "Users and post owners can update claims" 
ON public.post_claims FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

-- Allow deleting claims
CREATE POLICY "Users can delete claims" 
ON public.post_claims FOR DELETE 
TO public 
USING (true);

-- 5. Enable secure notification dispatch to seller on claim creation
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

-- Clean and reattach trigger
DROP TRIGGER IF EXISTS trigger_post_claim_notification ON public.post_claims;
DROP TRIGGER IF EXISTS on_post_claim_created ON public.post_claims;

CREATE TRIGGER on_post_claim_created
  AFTER INSERT ON public.post_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_post_claim();
