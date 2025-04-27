-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  entity_id UUID,
  entity_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(50)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS admin_activity_log_admin_id_idx ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS admin_activity_log_type_idx ON admin_activity_log(type);
CREATE INDEX IF NOT EXISTS admin_activity_log_created_at_idx ON admin_activity_log(created_at);

-- Add preview mode settings if they don't exist
INSERT INTO site_settings (key, value, created_at, updated_at)
VALUES 
  ('preview_mode', 'false', NOW(), NOW()),
  ('preview_duration', '30', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
