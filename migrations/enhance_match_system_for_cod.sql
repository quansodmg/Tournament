-- Rule sets table for standardized game settings
CREATE TABLE IF NOT EXISTS rule_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  name VARCHAR(255) NOT NULL,
  game_mode VARCHAR(100),
  settings JSONB,
  banned_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maps table for the map pool
CREATE TABLE IF NOT EXISTS maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Map veto process tracking
CREATE TABLE IF NOT EXISTS match_map_vetos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id),
  map_id UUID REFERENCES maps(id),
  team_id UUID REFERENCES teams(id),
  action VARCHAR(50) NOT NULL, -- 'ban', 'pick'
  order_num INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ELO history for tracking team rating changes
CREATE TABLE IF NOT EXISTS elo_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id),
  match_id UUID REFERENCES matches(id),
  old_elo INTEGER NOT NULL,
  new_elo INTEGER NOT NULL,
  change INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add ELO rating to teams table if it doesn't exist
ALTER TABLE teams ADD COLUMN IF NOT EXISTS elo_rating INTEGER DEFAULT 1000;

-- Match confirmation codes for verifying both teams are ready
CREATE TABLE IF NOT EXISTS match_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id),
  team_id UUID REFERENCES teams(id),
  confirmation_code VARCHAR(10),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match results with evidence
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id),
  reported_by UUID REFERENCES profiles(id),
  team1_id UUID REFERENCES teams(id),
  team2_id UUID REFERENCES teams(id),
  team1_score INTEGER,
  team2_score INTEGER,
  evidence_urls TEXT[],
  video_clip_url TEXT,
  status VARCHAR(50) DEFAULT 'pending_confirmation',
  confirmed_by UUID REFERENCES profiles(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new fields to matches table
ALTER TABLE matches 
  ADD COLUMN IF NOT EXISTS ruleset_id UUID REFERENCES rule_sets(id),
  ADD COLUMN IF NOT EXISTS map_veto_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS selected_maps TEXT[],
  ADD COLUMN IF NOT EXISTS confirmation_deadline TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS game_mode VARCHAR(100),
  ADD COLUMN IF NOT EXISTS match_format VARCHAR(50) DEFAULT 'bo1',
  ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 4;
