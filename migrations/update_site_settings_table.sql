-- Add new settings to the site_settings table if they don't exist
INSERT INTO site_settings (key, value)
VALUES
  ('site_name', 'EsportsHub'),
  ('site_description', 'Competitive Gaming Platform'),
  ('openai_api_key', '')
ON CONFLICT (key) DO NOTHING;
