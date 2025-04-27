-- Create friendship_status enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'friendship_status') THEN
        CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
    END IF;
END$$;

-- Create friendships table if it doesn't exist
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status friendship_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_friendships_sender_id ON friendships(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver_id ON friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Add online_status and last_seen to profiles if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS online_status VARCHAR(20) DEFAULT 'offline',
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to update last_seen timestamp
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_seen when online_status changes
DROP TRIGGER IF EXISTS update_last_seen_trigger ON profiles;
CREATE TRIGGER update_last_seen_trigger
BEFORE UPDATE OF online_status ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_last_seen();

-- Create RLS policies for friendships table
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own friendships
CREATE POLICY friendships_select_policy ON friendships 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy to allow users to insert friend requests
CREATE POLICY friendships_insert_policy ON friendships 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Policy to allow users to update friendships they're part of
CREATE POLICY friendships_update_policy ON friendships 
FOR UPDATE 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy to allow users to delete friendships they're part of
CREATE POLICY friendships_delete_policy ON friendships 
FOR DELETE 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create view for easier friend queries
CREATE OR REPLACE VIEW user_friends AS
SELECT 
    f.id,
    CASE 
        WHEN f.sender_id = auth.uid() THEN f.receiver_id
        ELSE f.sender_id
    END AS friend_id,
    f.status,
    f.created_at,
    f.updated_at,
    CASE 
        WHEN f.sender_id = auth.uid() THEN 'sent'
        ELSE 'received'
    END AS direction
FROM friendships f
WHERE (f.sender_id = auth.uid() OR f.receiver_id = auth.uid());
