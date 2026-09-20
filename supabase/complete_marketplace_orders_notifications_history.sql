-- ==============================================================================
-- GREEN LOOP — COMPLETE MARKETPLACE ORDERS, NOTIFICATIONS & HISTORY SYSTEM
-- ==============================================================================
-- File: supabase/complete_marketplace_orders_notifications_history.sql
-- 
-- This single structured SQL script contains:
--   PART 1: Schema Setup (Tables, Columns, Constraints & Indexes)
--           - marketplace_transactions (Unified Orders & Transactions)
--           - notifications (Buyer & Seller Notification Delivery)
--           - coin_transactions (Green Coins Ledger)
--   PART 2: Row Level Security (RLS) Policies
--   PART 3: Atomic Purchase RPC Function (process_demo_marketplace_purchase)
--           - Enforces row lock (FOR UPDATE)
--           - Enforces exact amount check
--           - Enforces self-purchase block
--           - Marks post SOLD atomically
--           - Creates order record
--           - Delivers Seller notification: "Your product was sold"
--           - Delivers Buyer notification: "Payment Successful"
--           - Credits +10 Green Coins to Buyer, +20 to Seller
--   PART 4: Unified Views & Query Structures
--           - v_buyer_purchase_history (Buyer Dashboard view)
--           - v_seller_sold_items (Seller Dashboard view)
--           - v_user_notifications (User notification inbox view)
-- ==============================================================================

-- ==============================================================================
-- PART 1: SCHEMA SETUP
-- ==============================================================================

-- 1A. Ensure public.notifications table exists and has required columns
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.e_waste_posts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'marketplace',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Backfill user_id from recipient_id if user_id was just added
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'recipient_id') THEN
    ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE public.notifications SET user_id = recipient_id WHERE user_id IS NULL;
  END IF;
END $$;

-- 1B. Ensure public.marketplace_transactions table exists
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

-- Ensure all columns exist if table was previously created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_transactions') THEN
    ALTER TABLE public.marketplace_transactions ADD COLUMN IF NOT EXISTS buyer_role TEXT DEFAULT 'General';
    ALTER TABLE public.marketplace_transactions ADD COLUMN IF NOT EXISTS seller_role TEXT DEFAULT 'General';
    ALTER TABLE public.marketplace_transactions ADD COLUMN IF NOT EXISTS buyer_coins_awarded INTEGER DEFAULT 10;
    ALTER TABLE public.marketplace_transactions ADD COLUMN IF NOT EXISTS seller_coins_awarded INTEGER DEFAULT 20;
    ALTER TABLE public.marketplace_transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'DEMO_QR';
    ALTER TABLE public.marketplace_transactions ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'SUCCESS';
    ALTER TABLE public.marketplace_transactions ADD COLUMN IF NOT EXISTS transaction_status TEXT DEFAULT 'COMPLETED';
  END IF;
END $$;

-- 1C. Ensure public.coin_transactions table exists for audit history
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL DEFAULT 'EARNED',
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  reward_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1D. Create Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_mkt_tx_ref ON public.marketplace_transactions(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_post_id ON public.marketplace_transactions(post_id);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_buyer_id ON public.marketplace_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_mkt_tx_seller_id ON public.marketplace_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_coin_tx_user ON public.coin_transactions(user_id);


-- ==============================================================================
-- PART 2: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark own notifications as read" ON public.notifications;
CREATE POLICY "Users can mark own notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = recipient_id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Marketplace Transactions RLS
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;

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


-- ==============================================================================
-- PART 3: ATOMIC PURCHASE RPC FUNCTION
-- ==============================================================================

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
  -- 1. Identify and authenticate buyer
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Please sign in to purchase this item.';
  END IF;

  -- 2. Lock post row to prevent race conditions / duplicate purchases
  SELECT * INTO v_post
  FROM public.e_waste_posts
  WHERE id = p_post_id
  FOR UPDATE;

  -- 3. Verify post exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found.';
  END IF;

  -- 4. Verify post availability (must not be SOLD)
  IF LOWER(COALESCE(v_post.status, 'available')) != 'available' THEN
    RAISE EXCEPTION 'Sorry, this item has already been sold.';
  END IF;

  -- 5. Prevent self-purchases
  IF v_post.user_id = v_buyer_id THEN
    RAISE EXCEPTION 'You cannot buy your own item.';
  END IF;

  -- 6. Read Buyer and Seller profiles
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

  -- 7. Validate entered payment amount against database price
  IF p_entered_amount IS NULL OR p_entered_amount != COALESCE(v_post.asking_price, 0) THEN
    RAISE EXCEPTION 'Incorrect amount. Please enter exactly ₹%', COALESCE(v_post.asking_price, 0);
  END IF;

  -- 8. Generate unique transaction reference (e.g. GL-DEMO-ABC12345)
  v_tx_ref := 'GL-DEMO-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
  v_today := to_char(now(), 'YYYY-MM-DD');

  -- 9. Update post status to SOLD
  UPDATE public.e_waste_posts
  SET status = 'sold',
      updated_at = now()
  WHERE id = p_post_id;

  -- 10. Award Green Coins (+10 Buyer, +20 Seller)
  UPDATE public.profiles
  SET coins = COALESCE(coins, 0) + 10
  WHERE id = v_buyer_id
  RETURNING coins INTO v_buyer_new_coins;

  UPDATE public.profiles
  SET coins = COALESCE(coins, 0) + 20
  WHERE id = v_post.user_id
  RETURNING coins INTO v_seller_new_coins;

  -- Record in coin ledger
  INSERT INTO public.coin_transactions (user_id, transaction_type, amount, description, reward_date, created_at)
  VALUES
    (v_buyer_id, 'EARNED', 10, 'Marketplace Purchase: ' || v_post.title, v_today, now()),
    (v_post.user_id, 'EARNED', 20, 'Marketplace Sale: ' || v_post.title, v_today, now());

  -- 11. Create SELLER Notification
  INSERT INTO public.notifications (
    recipient_id,
    user_id,
    post_id,
    title,
    message,
    type,
    is_read,
    created_at
  ) VALUES (
    v_post.user_id,
    v_post.user_id,
    p_post_id,
    'Your product was sold',
    'Your product ''' || v_post.title || ''' was sold successfully for ₹' || p_entered_amount || '. Buyer: ' || COALESCE(v_buyer_profile.full_name, 'Green Loop Member') || ' (' || v_buyer_role_label || '). Payment: Demo Payment — Successful. Green Coins: +20. Ref: ' || v_tx_ref,
    'marketplace',
    false,
    now()
  );

  -- 12. Create BUYER Notification
  INSERT INTO public.notifications (
    recipient_id,
    user_id,
    post_id,
    title,
    message,
    type,
    is_read,
    created_at
  ) VALUES (
    v_buyer_id,
    v_buyer_id,
    p_post_id,
    'Payment Successful',
    'Your payment for ''' || v_post.title || ''' was successful. Amount: ₹' || p_entered_amount || '. Seller: ' || COALESCE(v_seller_profile.full_name, 'Green Loop Member') || ' (' || v_seller_role_label || '). Payment: Demo Payment — Successful. Green Coins: +10. Ref: ' || v_tx_ref,
    'marketplace',
    false,
    now()
  );

  -- 13. Create Order / Transaction Record
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

  -- 14. Ensure legacy post_claims for this post/buyer are marked completed
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'post_claims') THEN
    UPDATE public.post_claims
    SET status = 'completed',
        updated_at = now()
    WHERE post_id = p_post_id
      AND user_id = v_buyer_id;
  END IF;

  -- 15. Return comprehensive result to frontend
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

-- Backward-compatible alias
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


-- ==============================================================================
-- PART 4: UNIFIED VIEWS & QUERY STRUCTURES
-- ==============================================================================

-- 4A. View for Buyer Purchase History (My Purchases)
CREATE OR REPLACE VIEW public.v_buyer_purchase_history AS
SELECT
  t.id AS transaction_id,
  t.transaction_ref,
  t.post_id,
  t.post_title,
  t.amount,
  t.payment_method,
  t.payment_status,
  t.transaction_status,
  t.buyer_id,
  t.buyer_name,
  t.buyer_role,
  t.seller_id,
  t.seller_name,
  t.seller_role,
  t.buyer_coins_awarded AS coins_earned,
  'DEMO TRANSACTION — NO REAL MONEY WAS TRANSFERRED' AS demo_disclaimer,
  t.created_at AS purchase_date,
  p.image_url AS post_image,
  p.category AS post_category
FROM public.marketplace_transactions t
LEFT JOIN public.e_waste_posts p ON t.post_id = p.id;

-- 4B. View for Seller Sold Items (My Sales)
CREATE OR REPLACE VIEW public.v_seller_sold_items AS
SELECT
  t.id AS transaction_id,
  t.transaction_ref,
  t.post_id,
  t.post_title,
  t.amount,
  t.payment_method,
  t.payment_status,
  t.transaction_status,
  t.seller_id,
  t.seller_name,
  t.seller_role,
  t.buyer_id,
  t.buyer_name,
  t.buyer_role,
  t.seller_coins_awarded AS coins_earned,
  t.created_at AS sold_date,
  p.image_url AS post_image,
  p.category AS post_category,
  p.status AS post_status
FROM public.marketplace_transactions t
LEFT JOIN public.e_waste_posts p ON t.post_id = p.id;

-- 4C. View for User Notifications Inbox
CREATE OR REPLACE VIEW public.v_user_notifications AS
SELECT
  n.id,
  COALESCE(n.recipient_id, n.user_id) AS user_id,
  n.title,
  n.message,
  n.type,
  n.is_read,
  n.post_id,
  n.created_at
FROM public.notifications n;

-- Permissions on views
GRANT SELECT ON public.v_buyer_purchase_history TO authenticated;
GRANT SELECT ON public.v_seller_sold_items TO authenticated;
GRANT SELECT ON public.v_user_notifications TO authenticated;
