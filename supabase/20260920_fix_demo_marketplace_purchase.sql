-- ==============================================================================
-- GREEN LOOP — FIX MARKETPLACE BUY FLOW FOR ALL ROLE COMBINATIONS
-- ==============================================================================
-- Migration: 20260920_fix_demo_marketplace_purchase.sql
--
-- Supports all 4 Role Combinations without restriction:
--   1. General -> General
--   2. General -> Local Shop
--   3. Local Shop -> General
--   4. Local Shop -> Local Shop
-- Only Restriction: buyer_id != seller_id (cannot buy own post).
-- Old post_claims 'pending' status does NOT block the purchase.
-- ==============================================================================

-- 1. Ensure marketplace_transactions table has buyer_role and seller_role columns
CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_ref TEXT UNIQUE NOT NULL,
  post_id UUID NOT NULL REFERENCES public.e_waste_posts(id) ON DELETE CASCADE,
  post_title TEXT NOT NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL DEFAULT 'Green Loop Member',
  buyer_role TEXT NOT NULL DEFAULT 'General',
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL DEFAULT 'Green Loop Member',
  seller_role TEXT NOT NULL DEFAULT 'General',
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'DEMO_QR',
  payment_status TEXT NOT NULL DEFAULT 'SUCCESS',
  transaction_status TEXT NOT NULL DEFAULT 'COMPLETED',
  buyer_coins_awarded INTEGER NOT NULL DEFAULT 10,
  seller_coins_awarded INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns if table already existed without them
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_transactions') THEN
    ALTER TABLE public.marketplace_transactions ADD COLUMN IF NOT EXISTS buyer_role TEXT DEFAULT 'General';
    ALTER TABLE public.marketplace_transactions ADD COLUMN IF NOT EXISTS seller_role TEXT DEFAULT 'General';
  END IF;
END $$;

-- Enable RLS on marketplace_transactions
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies
DROP POLICY IF EXISTS "Participants can view own transactions" ON public.marketplace_transactions;
CREATE POLICY "Participants can view own transactions"
  ON public.marketplace_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Buyers can insert own transactions" ON public.marketplace_transactions;
CREATE POLICY "Buyers can insert own transactions"
  ON public.marketplace_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Lookup indexes
CREATE INDEX IF NOT EXISTS idx_mkt_tx_ref ON public.marketplace_transactions(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_post_id ON public.marketplace_transactions(post_id);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_buyer_id ON public.marketplace_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_seller_id ON public.marketplace_transactions(seller_id);

-- Ensure marketplace_purchases table constraints accept DEMO_QR and SUCCESS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_purchases') THEN
    ALTER TABLE public.marketplace_purchases DROP CONSTRAINT IF EXISTS marketplace_purchases_payment_method_check;
    ALTER TABLE public.marketplace_purchases ADD CONSTRAINT marketplace_purchases_payment_method_check
      CHECK (payment_method IN ('ONLINE', 'CASH', 'DEMO_QR', 'DEMO_ONLINE'));

    ALTER TABLE public.marketplace_purchases DROP CONSTRAINT IF EXISTS marketplace_purchases_payment_status_check;
    ALTER TABLE public.marketplace_purchases ADD CONSTRAINT marketplace_purchases_payment_status_check
      CHECK (payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'CASH_PENDING', 'CASH_RECEIVED', 'FAILED', 'REFUNDED', 'SUCCESS'));
  END IF;
END $$;

-- 2. Atomic Database Purchase Function: process_demo_marketplace_purchase
CREATE OR REPLACE FUNCTION public.process_demo_marketplace_purchase(
  p_post_id UUID,
  p_entered_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_buyer_id UUID;
  v_post RECORD;
  v_buyer_profile RECORD;
  v_seller_profile RECORD;
  v_buyer_role_label TEXT;
  v_seller_role_label TEXT;
  v_tx_ref TEXT;
  v_buyer_new_coins INTEGER;
  v_seller_new_coins INTEGER;
  v_today TEXT;
  v_result JSONB;
BEGIN
  -- STEP 1: Authenticate buyer using auth.uid()
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Please sign in to purchase this item.';
  END IF;

  -- STEP 2 & 3: Find post and lock row for concurrency protection (FOR UPDATE)
  SELECT * INTO v_post
  FROM public.e_waste_posts
  WHERE id = p_post_id
  FOR UPDATE;

  -- STEP 4 & 5: Check post exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found.';
  END IF;

  -- STEP 6: Check post is still available (NOT already SOLD)
  IF LOWER(COALESCE(v_post.status, 'available')) != 'available' THEN
    RAISE EXCEPTION 'Sorry, this item has already been sold.';
  END IF;

  -- STEP 7: Check buyer is not the seller
  IF v_post.user_id = v_buyer_id THEN
    RAISE EXCEPTION 'You cannot buy your own item.';
  END IF;

  -- STEP 8: Read Buyer and Seller profiles (General or Local Shop - ALL combinations permitted)
  SELECT id, full_name, phone, role, coins INTO v_buyer_profile
  FROM public.profiles
  WHERE id = v_buyer_id;

  SELECT id, full_name, phone, role, coins INTO v_seller_profile
  FROM public.profiles
  WHERE id = v_post.user_id;

  -- Format human-readable role labels
  IF LOWER(COALESCE(v_buyer_profile.role, 'citizen')) IN ('shop', 'local_shop') THEN
    v_buyer_role_label := 'Local Shop';
  ELSE
    v_buyer_role_label := 'General';
  END IF;

  IF LOWER(COALESCE(v_seller_profile.role, 'citizen')) IN ('shop', 'local_shop') THEN
    v_seller_role_label := 'Local Shop';
  ELSE
    v_seller_role_label := 'General';
  END IF;

  -- STEP 9: Validate entered amount matches database asking price
  IF p_entered_amount IS NULL OR p_entered_amount != COALESCE(v_post.asking_price, 0) THEN
    RAISE EXCEPTION 'Incorrect amount. Please enter exactly ₹%', COALESCE(v_post.asking_price, 0);
  END IF;

  -- STEP 10: Generate unique transaction reference (e.g. GL-DEMO-ABC12345)
  v_tx_ref := 'GL-DEMO-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
  v_today := to_char(now(), 'YYYY-MM-DD');

  -- STEP 11: Mark post status as SOLD
  UPDATE public.e_waste_posts
  SET status = 'sold',
      updated_at = now()
  WHERE id = p_post_id;

  -- STEP 12: Award Green Coins (Buyer +10, Seller +20)
  UPDATE public.profiles
  SET coins = COALESCE(coins, 0) + 10
  WHERE id = v_buyer_id
  RETURNING coins INTO v_buyer_new_coins;

  UPDATE public.profiles
  SET coins = COALESCE(coins, 0) + 20
  WHERE id = v_post.user_id
  RETURNING coins INTO v_seller_new_coins;

  -- Log Green Coin transactions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coin_transactions') THEN
    INSERT INTO public.coin_transactions (user_id, transaction_type, amount, description, reward_date, created_at)
    VALUES
      (v_buyer_id, 'EARNED', 10, 'Marketplace Purchase: ' || v_post.title, v_today, now()),
      (v_post.user_id, 'EARNED', 20, 'Marketplace Sale: ' || v_post.title, v_today, now());
  END IF;

  -- STEP 13: Create Seller Notification (recipient = post.user_id)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    INSERT INTO public.notifications (
      recipient_id,
      post_id,
      title,
      message,
      type,
      is_read,
      created_at
    ) VALUES (
      v_post.user_id,
      p_post_id,
      'Your product was sold',
      'Your product ''' || v_post.title || ''' was sold successfully for ₹' || p_entered_amount || '. Buyer: ' || COALESCE(v_buyer_profile.full_name, 'Green Loop Member') || ' (' || v_buyer_role_label || '). Payment: Demo Payment — Successful. Green Coins: +20. Ref: ' || v_tx_ref,
      'marketplace',
      false,
      now()
    );

    -- STEP 14: Create Buyer Notification (recipient = auth.uid())
    INSERT INTO public.notifications (
      recipient_id,
      post_id,
      title,
      message,
      type,
      is_read,
      created_at
    ) VALUES (
      v_buyer_id,
      p_post_id,
      'Payment Successful',
      'Your payment for ''' || v_post.title || ''' was successful. Amount: ₹' || p_entered_amount || '. Seller: ' || COALESCE(v_seller_profile.full_name, 'Green Loop Member') || ' (' || v_seller_role_label || '). Payment: Demo Payment — Successful. Green Coins: +10. Ref: ' || v_tx_ref,
      'marketplace',
      false,
      now()
    );
  END IF;

  -- STEP 15: Insert into public.marketplace_transactions
  INSERT INTO public.marketplace_transactions (
    transaction_ref,
    post_id,
    post_title,
    buyer_id,
    buyer_name,
    buyer_role,
    seller_id,
    seller_name,
    seller_role,
    amount,
    payment_method,
    payment_status,
    transaction_status,
    buyer_coins_awarded,
    seller_coins_awarded,
    created_at,
    paid_at,
    completed_at
  ) VALUES (
    v_tx_ref,
    p_post_id,
    v_post.title,
    v_buyer_id,
    COALESCE(v_buyer_profile.full_name, 'Green Loop Member'),
    v_buyer_role_label,
    v_post.user_id,
    COALESCE(v_seller_profile.full_name, 'Green Loop Member'),
    v_seller_role_label,
    p_entered_amount,
    'DEMO_QR',
    'SUCCESS',
    'COMPLETED',
    10,
    20,
    now(),
    now(),
    now()
  );

  -- Synchronize with marketplace_purchases for existing orders views
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_purchases') THEN
    INSERT INTO public.marketplace_purchases (
      id,
      post_id,
      post_title,
      post_image,
      buyer_id,
      buyer_name,
      buyer_phone,
      seller_id,
      seller_name,
      seller_phone,
      amount,
      platform_fee,
      total,
      payment_method,
      payment_status,
      purchase_status,
      gateway_order_id,
      gateway_payment_id,
      paid_at,
      completed_at,
      created_at
    ) VALUES (
      v_tx_ref,
      p_post_id,
      v_post.title,
      v_post.image_url,
      v_buyer_id,
      COALESCE(v_buyer_profile.full_name, 'Green Loop Member'),
      v_buyer_profile.phone,
      v_post.user_id,
      COALESCE(v_seller_profile.full_name, 'Green Loop Member'),
      v_seller_profile.phone,
      p_entered_amount,
      0,
      p_entered_amount,
      'DEMO_QR',
      'PAID',
      'COMPLETED',
      'DEMO_ORDER',
      'pay_demo_' || lower(substr(md5(gen_random_uuid()::text), 1, 10)),
      now(),
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Ensure existing post_claims historical records for this post/buyer are marked completed (no blocking)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_claims') THEN
    UPDATE public.post_claims
    SET status = 'completed',
        updated_at = now()
    WHERE post_id = p_post_id
      AND user_id = v_buyer_id;
  END IF;

  -- STEP 16: Prepare and return response
  v_result := jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_ref,
    'transaction_reference', v_tx_ref,
    'post_id', p_post_id,
    'buyer_id', v_buyer_id,
    'seller_id', v_post.user_id,
    'amount', p_entered_amount,
    'product_title', v_post.title,
    'buyer_name', COALESCE(v_buyer_profile.full_name, 'Green Loop Member'),
    'seller_name', COALESCE(v_seller_profile.full_name, 'Green Loop Member'),
    'buyer_role', v_buyer_role_label,
    'seller_role', v_seller_role_label,
    'buyer_coins_awarded', 10,
    'seller_coins_awarded', 20,
    'buyer_new_coins', v_buyer_new_coins,
    'payment_method', 'DEMO_QR',
    'payment_status', 'SUCCESS',
    'transaction_status', 'COMPLETED',
    'created_at', now(),
    'message', 'Purchase completed successfully.'
  );

  RETURN v_result;
END;
$$;

-- Grant execution to authenticated users
REVOKE ALL ON FUNCTION public.process_demo_marketplace_purchase(UUID, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_demo_marketplace_purchase(UUID, NUMERIC) TO authenticated;

-- Alias function for backward compatibility
CREATE OR REPLACE FUNCTION public.process_demo_purchase(
  p_post_id UUID,
  p_entered_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN public.process_demo_marketplace_purchase(p_post_id, p_entered_amount);
END;
$$;

REVOKE ALL ON FUNCTION public.process_demo_purchase(UUID, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_demo_purchase(UUID, NUMERIC) TO authenticated;
