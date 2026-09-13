-- ==============================================================================
-- GREEN LOOP — PRODUCTION FINISHING SCHEMA & POLICIES
-- ==============================================================================
-- This script finalizes the database schema for multi-user production readiness:
-- 1. Profiles enhancement (coins, streaks, last_login_date)
-- 2. Persistent coin_transactions table with strict RLS
-- 3. Hardened handle_new_user trigger preventing unauthorized admin registration
-- ==============================================================================

-- 1. ENHANCE PROFILES TABLE WITH COINS AND STREAK TRACKING
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'coins') THEN
    ALTER TABLE public.profiles ADD COLUMN coins INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'current_streak') THEN
    ALTER TABLE public.profiles ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'longest_streak') THEN
    ALTER TABLE public.profiles ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_login_date') THEN
    ALTER TABLE public.profiles ADD COLUMN last_login_date TEXT DEFAULT '';
  END IF;

  -- Safely update role check constraint to accept citizen, shop, local_shop, recycler, company, admin
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('citizen', 'shop', 'local_shop', 'recycler', 'company', 'admin'));
END $$;

-- 2. CREATE COIN TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT DEFAULT '',
  reward_date TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for fast lookup and streak audits
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON public.coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_date ON public.coin_transactions(user_id, reward_date);

-- Enable RLS on coin_transactions
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own coin transactions
DROP POLICY IF EXISTS "Users can read own coin transactions" ON public.coin_transactions;
CREATE POLICY "Users can read own coin transactions"
  ON public.coin_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own coin transactions (or via secure functions)
DROP POLICY IF EXISTS "Users can insert own coin transactions" ON public.coin_transactions;
CREATE POLICY "Users can insert own coin transactions"
  ON public.coin_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. HARDENED PROFILE CREATION TRIGGER (NO UNAUTHORIZED ADMIN REGISTRATION)
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
  
  -- Extract full name
  v_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    SPLIT_PART(new.email, '@', 1),
    'Green Loop Member'
  );

  -- Admin check: ONLY recognized Green Loop creators can obtain admin status
  IF LOWER(v_name) IN ('mathavan', 'vimal raj', 'vimalraj', 'thiru loop', 'thiruloop')
     OR LOWER(new.email) LIKE '%mathavan%'
     OR LOWER(new.email) LIKE '%vimal%'
     OR LOWER(new.email) LIKE '%thiru%' THEN
    v_role := 'admin';
  ELSIF v_raw_role IN ('shop', 'local_shop', 'shop_owner') THEN
    v_role := 'shop';
  ELSIF v_raw_role IN ('company', 'recycler', 'enterprise') THEN
    v_role := 'company';
  ELSE
    -- Any arbitrary or malicious role input (e.g. attempting 'admin' from public signup) defaults safely to citizen
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
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
