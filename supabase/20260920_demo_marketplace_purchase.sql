-- ==============================================================================
-- GREEN LOOP — SIMPLIFIED DEMO PAYMENT SYSTEM MIGRATION
-- ==============================================================================
-- 1. Updates marketplace_purchases check constraints to accept 'DEMO_QR' & 'SUCCESS'.
-- 2. Creates public.marketplace_transactions table with RLS.
-- 3. Implements atomic process_demo_purchase() PostgreSQL function:
--    - Uses FOR UPDATE row-level locking for concurrency protection.
--    - Enforces entered_amount == asking_price.
--    - Enforces buyer != seller.
--    - Transitions post status to 'sold'.
--    - Awards Green Coins (+10 buyer, +20 seller) & logs coin_transactions.
--    - Creates buyer & seller notifications.
--    - Commits all operations atomically or rolls back on any error.
-- ==============================================================================

-- 1. Update constraints on marketplace_purchases if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_purchases') THEN
    -- Update payment_method constraint
    ALTER TABLE public.marketplace_purchases DROP CONSTRAINT IF EXISTS marketplace_purchases_payment_method_check;
    ALTER TABLE public.marketplace_purchases ADD CONSTRAINT marketplace_purchases_payment_method_check
      CHECK (payment_method IN ('ONLINE', 'CASH', 'DEMO_QR', 'DEMO_ONLINE'));

    -- Update payment_status constraint
    ALTER TABLE public.marketplace_purchases DROP CONSTRAINT IF EXISTS marketplace_purchases_payment_status_check;
    ALTER TABLE public.marketplace_purchases ADD CONSTRAINT marketplace_purchases_payment_status_check
      CHECK (payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'CASH_PENDING', 'CASH_RECEIVED', 'FAILED', 'REFUNDED', 'SUCCESS'));
  END IF;
END $$;

-- 2. Create marketplace_transactions table
CREATE TABLE IF NOT EXISTS public.marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_ref TEXT UNIQUE NOT NULL,
  post_id UUID NOT NULL REFERENCES public.e_waste_posts(id) ON DELETE CASCADE,
  post_title TEXT NOT NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL DEFAULT 'Green Loop Member',
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL DEFAULT 'Green Loop Member',
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

-- Enable RLS on marketplace_transactions
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

-- Participants (Buyer and Seller) can view their transactions
DROP POLICY IF EXISTS "Participants can view own transactions" ON public.marketplace_transactions;
CREATE POLICY "Participants can view own transactions"
  ON public.marketplace_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Authenticated buyers can insert transaction records
DROP POLICY IF EXISTS "Buyers can insert own transactions" ON public.marketplace_transactions;
CREATE POLICY "Buyers can insert own transactions"
  ON public.marketplace_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Create lookup indexes
CREATE INDEX IF NOT EXISTS idx_mkt_tx_ref ON public.marketplace_transactions(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_post_id ON public.marketplace_transactions(post_id);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_buyer_id ON public.marketplace_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_seller_id ON public.marketplace_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_status ON public.marketplace_transactions(transaction_status);

-- 3. Atomic Database Function for Demo Purchase
CREATE OR REPLACE FUNCTION public.process_demo_purchase(
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
  v_tx_ref TEXT;
  v_buyer_new_coins INTEGER;
  v_seller_new_coins INTEGER;
  v_today TEXT;
  v_result JSONB;
BEGIN
  -- Step 1: Authenticate caller
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Please sign in to complete purchase.';
  END IF;

  -- Step 2: Lock the post row to guarantee concurrency protection (FOR UPDATE)
  SELECT * INTO v_post
  FROM public.e_waste_posts
  WHERE id = p_post_id
  FOR UPDATE;

  -- Step 3: Verify post exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found.';
  END IF;

  -- Step 4: Verify post is still AVAILABLE
  IF LOWER(COALESCE(v_post.status, 'available')) != 'available' THEN
    RAISE EXCEPTION 'Sorry, this item has already been sold.';
  END IF;

  -- Step 5: Verify buyer is not the seller
  IF v_post.user_id = v_buyer_id THEN
    RAISE EXCEPTION 'You cannot buy your own item.';
  END IF;

  -- Step 6: Verify entered amount matches exact asking price
  IF p_entered_amount IS NULL OR p_entered_amount != COALESCE(v_post.asking_price, 0) THEN
    RAISE EXCEPTION 'Incorrect amount. Please enter exactly ₹%', COALESCE(v_post.asking_price, 0);
  END IF;

  -- Step 7: Load Buyer and Seller profile details
  SELECT id, full_name, phone, coins INTO v_buyer_profile
  FROM public.profiles
  WHERE id = v_buyer_id;

  SELECT id, full_name, phone, coins INTO v_seller_profile
  FROM public.profiles
  WHERE id = v_post.user_id;

  -- Step 8: Generate unique Demo Transaction Reference
  v_tx_ref := 'GL-DEMO-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
  v_today := to_char(now(), 'YYYY-MM-DD');

  -- Step 9: Mark post status as SOLD
  UPDATE public.e_waste_posts
  SET status = 'sold',
      updated_at = now()
  WHERE id = p_post_id;

  -- Step 10: Award Green Coins to Buyer (+10) and Seller (+20)
  UPDATE public.profiles
  SET coins = COALESCE(coins, 0) + 10
  WHERE id = v_buyer_id
  RETURNING coins INTO v_buyer_new_coins;

  UPDATE public.profiles
  SET coins = COALESCE(coins, 0) + 20
  WHERE id = v_post.user_id
  RETURNING coins INTO v_seller_new_coins;

  -- Step 11: Record coin transactions if coin_transactions table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coin_transactions') THEN
    INSERT INTO public.coin_transactions (user_id, transaction_type, amount, description, reward_date, created_at)
    VALUES
      (v_buyer_id, 'EARNED', 10, 'Demo Marketplace Purchase: ' || v_post.title, v_today, now()),
      (v_post.user_id, 'EARNED', 20, 'Demo Marketplace Sale: ' || v_post.title, v_today, now());
  END IF;

  -- Step 12: Record unified transaction in public.marketplace_transactions
  INSERT INTO public.marketplace_transactions (
    transaction_ref,
    post_id,
    post_title,
    buyer_id,
    buyer_name,
    seller_id,
    seller_name,
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
    v_post.user_id,
    COALESCE(v_seller_profile.full_name, 'Green Loop Member'),
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

  -- Step 13: Also record in public.marketplace_purchases for existing views
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
      'pay_demo_' || lower(substr(md5(gen_random_uuid()::text), 1, 12)),
      now(),
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Step 14: Create Seller Notification
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
      'Item Sold',
      'Your item ''' || v_post.title || ''' was sold for ₹' || p_entered_amount || ' through Demo Payment. +20 Green Coins earned!',
      'marketplace',
      false,
      now()
    );

    -- Step 15: Create Buyer Notification
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
      'Purchase Successful',
      'You successfully purchased ''' || v_post.title || ''' for ₹' || p_entered_amount || '. +10 Green Coins awarded!',
      'marketplace',
      false,
      now()
    );
  END IF;

  -- Step 16: Prepare response object
  v_result := jsonb_build_object(
    'success', true,
    'transaction_ref', v_tx_ref,
    'post_id', p_post_id,
    'post_title', v_post.title,
    'amount', p_entered_amount,
    'buyer_id', v_buyer_id,
    'buyer_name', COALESCE(v_buyer_profile.full_name, 'Green Loop Member'),
    'seller_id', v_post.user_id,
    'seller_name', COALESCE(v_seller_profile.full_name, 'Green Loop Member'),
    'payment_method', 'DEMO_QR',
    'payment_status', 'SUCCESS',
    'purchase_status', 'COMPLETED',
    'buyer_coins_awarded', 10,
    'seller_coins_awarded', 20,
    'buyer_new_coins', v_buyer_new_coins,
    'created_at', now(),
    'message', 'Demo purchase completed successfully.'
  );

  RETURN v_result;
END;
$$;

-- Grant execution to authenticated users only
REVOKE ALL ON FUNCTION public.process_demo_purchase(UUID, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_demo_purchase(UUID, NUMERIC) TO authenticated;
