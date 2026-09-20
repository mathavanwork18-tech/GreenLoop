-- ==============================================================================
-- GREEN LOOP — MARKETPLACE PURCHASES & PAYMENTS DDL MIGRATION
-- ==============================================================================
-- Enables full lifecycle tracking for Online Payment (Razorpay) and Cash on Handover:
-- 1. Creates public.marketplace_purchases table with RLS security.
-- 2. Restricts view and update access strictly to the buyer and seller of the purchase.
-- 3. Indexes for fast lookup by post_id, buyer_id, and seller_id.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.marketplace_purchases (
  id TEXT PRIMARY KEY, -- e.g. "GL-10492"
  post_id UUID REFERENCES public.e_waste_posts(id) ON DELETE CASCADE,
  post_title TEXT NOT NULL,
  post_image TEXT,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  seller_phone TEXT,
  amount NUMERIC NOT NULL,
  platform_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('ONLINE', 'CASH')),
  payment_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'CASH_PENDING', 'CASH_RECEIVED', 'FAILED', 'REFUNDED')),
  purchase_status TEXT NOT NULL DEFAULT 'PURCHASE_REQUESTED'
    CHECK (purchase_status IN ('PURCHASE_REQUESTED', 'ACCEPTED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID', 'CASH_PENDING', 'CASH_RECEIVED', 'READY_FOR_HANDOVER', 'COMPLETED', 'CANCELLED', 'FAILED')),
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  failure_reason TEXT,
  handover_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  cash_confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;

-- 1. Participants (Buyer and Seller) can view their own purchases
DROP POLICY IF EXISTS "Participants can view own purchases" ON public.marketplace_purchases;
CREATE POLICY "Participants can view own purchases"
  ON public.marketplace_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 2. Authenticated buyers can insert their own purchase order
DROP POLICY IF EXISTS "Buyers can insert own purchase" ON public.marketplace_purchases;
CREATE POLICY "Buyers can insert own purchase"
  ON public.marketplace_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- 3. Participants can update their own purchase records (e.g. status changes, payment settlement)
DROP POLICY IF EXISTS "Participants can update own purchase" ON public.marketplace_purchases;
CREATE POLICY "Participants can update own purchase"
  ON public.marketplace_purchases FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_purchases_post_id ON public.marketplace_purchases(post_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON public.marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON public.marketplace_purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.marketplace_purchases(purchase_status);
