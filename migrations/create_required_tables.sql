-- Create games table if it doesn't exist
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  cover_image VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tournaments table if it doesn't exist
CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  prize_pool INTEGER DEFAULT 0,
  entry_fee INTEGER DEFAULT 0,
  team_size INTEGER DEFAULT 1,
  game_id INTEGER REFERENCES games(id),
  banner_image VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(255) UNIQUE,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create player_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS player_stats (
  id SERIAL PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  game_id INTEGER REFERENCES games(id),
  total_earnings INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, game_id)
);

-- Insert some sample data into games if the table is empty
INSERT INTO games (name, slug, cover_image)
SELECT 'League of Legends', 'league-of-legends', '/vibrant-esports-showdown.png'
WHERE NOT EXISTS (SELECT 1 FROM games LIMIT 1);

INSERT INTO games (name, slug, cover_image)
SELECT 'Counter-Strike 2', 'counter-strike-2', '/tactical-shooter-scene.png'
WHERE NOT EXISTS (SELECT 1 FROM games WHERE slug = 'counter-strike-2');

INSERT INTO games (name, slug, cover_image)
SELECT 'Valorant', 'valorant', '/urban-team-clash.png'
WHERE NOT EXISTS (SELECT 1 FROM games WHERE slug = 'valorant');

-- Insert some sample data into tournaments if the table is empty
INSERT INTO tournaments (name, slug, start_date, prize_pool, team_size, game_id, banner_image)
SELECT 
  'Summer Championship', 
  'summer-championship', 
  CURRENT_TIMESTAMP + INTERVAL '7 days', 
  10000, 
  5, 
  (SELECT id FROM games WHERE slug = 'league-of-legends' LIMIT 1),
  '/esports-arena-showdown.png'
WHERE NOT EXISTS (SELECT 1 FROM tournaments LIMIT 1);

INSERT INTO tournaments (name, slug, start_date, prize_pool, team_size, game_id, banner_image)
SELECT 
  'Winter Invitational', 
  'winter-invitational', 
  CURRENT_TIMESTAMP + INTERVAL '30 days', 
  5000, 
  5, 
  (SELECT id FROM games WHERE slug = 'counter-strike-2' LIMIT 1),
  '/vibrant-esports-showdown.png'
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE slug = 'winter-invitational');
