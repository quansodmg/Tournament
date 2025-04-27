-- Add preview mode settings to site_settings table
INSERT INTO site_settings (key, value)
VALUES ('preview_mode', 'false')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO site_settings (key, value)
VALUES ('preview_duration', '30')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create admin_activity_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS admin_activity_log_user_id_idx ON admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS admin_activity_log_created_at_idx ON admin_activity_log(created_at);
