-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Add RLS policies
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own friendships
CREATE POLICY "Users can view their own friendships"
  ON public.friendships
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy to allow users to create friend requests
CREATE POLICY "Users can create friend requests"
  ON public.friendships
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policy to allow users to update their own friendships
CREATE POLICY "Users can update their own friendships"
  ON public.friendships
  FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy to allow users to delete their own friendships
CREATE POLICY "Users can delete their own friendships"
  ON public.friendships
  FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create a view for easier friend queries
CREATE OR REPLACE VIEW public.user_friends AS
  SELECT 
    CASE 
      WHEN f.sender_id = auth.uid() THEN f.sender_id
      ELSE f.receiver_id
    END as user_id,
    CASE 
      WHEN f.sender_id = auth.uid() THEN f.receiver_id
      ELSE f.sender_id
    END as friend_id
  FROM public.friendships f
  WHERE 
    (f.sender_id = auth.uid() OR f.receiver_id = auth.uid())
    AND f.status = 'accepted';

-- Add RLS policy to the view
ALTER VIEW public.user_friends SECURITY INVOKER;
