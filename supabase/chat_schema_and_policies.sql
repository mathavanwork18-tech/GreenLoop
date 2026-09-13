-- ==============================================================================
-- GREEN LOOP — USER-TO-USER CHAT SCHEMA & RLS POLICIES
-- ==============================================================================
-- Run this migration in your Supabase SQL Editor to enable persistent,
-- real-time 1-on-1 marketplace and logistics messaging with Row Level Security.
-- ==============================================================================

-- 1. CREATE DIRECT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.e_waste_posts(id) ON DELETE SET NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(trim(message)) > 0 AND char_length(message) <= 2000),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CREATE INDEXES FOR FAST LOOKUP AND REALTIME FILTERING
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_thread ON public.direct_messages(sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_post ON public.direct_messages(post_id);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES (STRICT USER PRIVACY)
-- Users can only view messages where they are either the sender or recipient
DROP POLICY IF EXISTS "Users can view their own direct messages" ON public.direct_messages;
CREATE POLICY "Users can view their own direct messages"
  ON public.direct_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can only insert messages if they are the authenticated sender
DROP POLICY IF EXISTS "Users can send direct messages" ON public.direct_messages;
CREATE POLICY "Users can send direct messages"
  ON public.direct_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
  );

-- Receivers can mark messages as read
DROP POLICY IF EXISTS "Receivers can update message read status" ON public.direct_messages;
CREATE POLICY "Receivers can update message read status"
  ON public.direct_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- 5. ENABLE REALTIME BROADCASTING
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'direct_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- 6. OPTIONAL NOTIFICATION TRIGGER
-- Automatically sends an in-app notification to the receiver when a direct message arrives
CREATE OR REPLACE FUNCTION public.handle_new_direct_message()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_name TEXT;
  v_post_title TEXT;
BEGIN
  -- Fetch sender name
  SELECT COALESCE(full_name, 'A user') INTO v_sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;

  -- Fetch post title if applicable
  IF NEW.post_id IS NOT NULL THEN
    SELECT title INTO v_post_title
    FROM public.e_waste_posts
    WHERE id = NEW.post_id;
  END IF;

  -- Insert in-app notification for recipient
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    created_at
  ) VALUES (
    NEW.receiver_id,
    'New Message from ' || v_sender_name,
    CASE 
      WHEN v_post_title IS NOT NULL THEN 'Inquiry regarding "' || v_post_title || '": ' || substring(NEW.message from 1 for 60)
      ELSE substring(NEW.message from 1 for 80)
    END,
    'message',
    now()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Prevent notification failure from blocking message send
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_new_direct_message ON public.direct_messages;
CREATE TRIGGER tr_on_new_direct_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_direct_message();
