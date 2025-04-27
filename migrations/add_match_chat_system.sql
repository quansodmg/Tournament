-- Create table for match chats if it doesn't exist
CREATE TABLE IF NOT EXISTS match_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add index for faster queries
  INDEX(match_id, created_at)
);

-- Create function to notify clients about new messages
CREATE OR REPLACE FUNCTION notify_match_chat()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'match_chat',
    json_build_object(
      'match_id', NEW.match_id,
      'message', json_build_object(
        'id', NEW.id,
        'profile_id', NEW.profile_id,
        'message', NEW.message,
        'is_system', NEW.is_system,
        'created_at', NEW.created_at
      )
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to notify clients about new messages
CREATE TRIGGER notify_match_chat_trigger
AFTER INSERT ON match_chats
FOR EACH ROW
EXECUTE FUNCTION notify_match_chat();

-- Add system user for system messages if it doesn't exist
INSERT INTO profiles (id, username, display_name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system',
  'System',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
