-- ==============================================================================
-- GREEN LOOP — WEB PUSH & DEVICE NOTIFICATIONS MIGRATION
-- ==============================================================================
-- File: supabase/20260920_push_notifications.sql
--
-- Features:
--   1. notification_subscriptions table for Web Push device registration
--   2. Multi-device support per user (Laptop, Mobile, Tablet, etc.)
--   3. Row Level Security (RLS) policies: auth.uid() = user_id
--   4. Stored procedures for subscribing and unsubscribing cleanly
--   5. Integration with public.notifications
-- ==============================================================================

-- 1. Create notification_subscriptions Table
CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_info TEXT DEFAULT 'Browser Device',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_device_endpoint UNIQUE (user_id, endpoint)
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notif_subs_user_id ON public.notification_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_subs_endpoint ON public.notification_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_notif_subs_active ON public.notification_subscriptions(is_active);

-- 3. Row Level Security (RLS)
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.notification_subscriptions;
CREATE POLICY "Users can view own push subscriptions"
  ON public.notification_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.notification_subscriptions;
CREATE POLICY "Users can insert own push subscriptions"
  ON public.notification_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.notification_subscriptions;
CREATE POLICY "Users can update own push subscriptions"
  ON public.notification_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.notification_subscriptions;
CREATE POLICY "Users can delete own push subscriptions"
  ON public.notification_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Stored Procedure: Upsert Push Subscription (Handles multi-device safely)
CREATE OR REPLACE FUNCTION public.save_push_subscription(
  p_endpoint TEXT,
  p_p256dh TEXT,
  p_auth TEXT,
  p_device_info TEXT DEFAULT 'Browser Device'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_sub_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to register for push notifications.';
  END IF;

  INSERT INTO public.notification_subscriptions (
    user_id,
    endpoint,
    p256dh,
    auth,
    device_info,
    is_active,
    updated_at
  ) VALUES (
    v_user_id,
    p_endpoint,
    p_p256dh,
    p_auth,
    COALESCE(p_device_info, 'Browser Device'),
    true,
    now()
  )
  ON CONFLICT (user_id, endpoint)
  DO UPDATE SET
    p256dh = EXCLUDED.p256dh,
    auth = EXCLUDED.auth,
    device_info = EXCLUDED.device_info,
    is_active = true,
    updated_at = now()
  RETURNING id INTO v_sub_id;

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_sub_id,
    'user_id', v_user_id,
    'message', 'Push subscription registered successfully.'
  );
END;
$$;

-- Grant execution to authenticated users
REVOKE ALL ON FUNCTION public.save_push_subscription(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_push_subscription(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 5. Stored Procedure: Remove / Invalidate Push Subscription
CREATE OR REPLACE FUNCTION public.remove_push_subscription(
  p_endpoint TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_deleted_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to unsubscribe from push notifications.';
  END IF;

  DELETE FROM public.notification_subscriptions
  WHERE user_id = v_user_id
    AND endpoint = p_endpoint;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count,
    'message', 'Push subscription removed successfully.'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.remove_push_subscription(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_push_subscription(TEXT) TO authenticated;
