-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 key TEXT NOT NULL UNIQUE,
 value TEXT,
 created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value)
VALUES 
 ('show_promo_banner', 'false'),
 ('promo_text', 'ESPORTSHUB WEEKLY CHALLENGERS'),
 ('promo_tag', 'SUPER PROMO'),
 ('primary_color', '#1e90ff'),
 ('secondary_color', '#141824'),
 ('accent_color', '#1e90ff'),
 ('background_color', '#0a0a0a'),
 ('text_color', '#ffffff')
ON CONFLICT (key) DO NOTHING;

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
 NEW.updated_at = NOW();
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to site_settings table
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
