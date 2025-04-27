-- Create friends table if it doesn't exist
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'accepted', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_friends_updated_at ON friends;
CREATE TRIGGER update_friends_updated_at
BEFORE UPDATE ON friends
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Policy for selecting friends (users can see their own friends)
DROP POLICY IF EXISTS select_friends ON friends;
CREATE POLICY select_friends ON friends
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Policy for inserting friends (users can only create their own friend relationships)
DROP POLICY IF EXISTS insert_friends ON friends;
CREATE POLICY insert_friends ON friends
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating friends (users can only update their own friend relationships)
DROP POLICY IF EXISTS update_friends ON friends;
CREATE POLICY update_friends ON friends
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Policy for deleting friends (users can only delete their own friend relationships)
DROP POLICY IF EXISTS delete_friends ON friends;
CREATE POLICY delete_friends ON friends
  FOR DELETE
  USING (auth.uid() = user_id);

-- Insert some sample data if needed (comment out in production)
-- INSERT INTO friends (user_id, friend_id, status)
-- VALUES 
--   ('user-uuid-1', 'user-uuid-2', 'accepted'),
--   ('user-uuid-1', 'user-uuid-3', 'accepted'),
--   ('user-uuid-2', 'user-uuid-3', 'pending');
