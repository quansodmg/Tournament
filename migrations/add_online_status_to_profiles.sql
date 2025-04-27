-- Add online_status column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS online_status VARCHAR(20) DEFAULT 'offline',
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a function to update last_seen timestamp
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update last_seen when online_status changes
DROP TRIGGER IF EXISTS update_last_seen_trigger ON profiles;
CREATE TRIGGER update_last_seen_trigger
BEFORE UPDATE OF online_status ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_last_seen();
