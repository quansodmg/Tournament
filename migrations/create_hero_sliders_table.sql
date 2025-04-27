-- Create hero_sliders table
CREATE TABLE IF NOT EXISTS hero_sliders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  banner_image TEXT,
  active BOOLEAN DEFAULT true,
  order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some initial data
INSERT INTO hero_sliders (name, slug, description, banner_image, active, order)
VALUES 
  ('Call of Duty World Championship', 'call-of-duty-world-championship', 'Join the ultimate Call of Duty tournament and compete for glory', '/placeholder.svg?height=600&width=1200', true, 1),
  ('Fortnite World Cup', 'fortnite-world-cup', 'Battle against the best Fortnite players from around the world', '/placeholder.svg?height=600&width=1200', true, 2),
  ('Rocket League Championship Series', 'rocket-league-championship-series', 'High-octane rocket-powered car soccer at its finest', '/placeholder.svg?height=600&width=1200', true, 3);
