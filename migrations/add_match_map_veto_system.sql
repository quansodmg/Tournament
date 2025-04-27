-- Create table for match map vetos
CREATE TABLE IF NOT EXISTS match_map_vetos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  map_id VARCHAR NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  action VARCHAR NOT NULL CHECK (action IN ('ban', 'pick')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(match_id, map_id)
);

-- Create table for match settings
CREATE TABLE IF NOT EXISTS match_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  ruleset_id VARCHAR,
  settings JSONB DEFAULT '{}'::JSONB,
  selected_map VARCHAR,
  selected_maps VARCHAR[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(match_id)
);

-- Create table for match results
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  loser_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  winner_score INTEGER DEFAULT 0,
  loser_score INTEGER DEFAULT 0,
  notes TEXT,
  evidence_urls TEXT[],
  status VARCHAR NOT NULL DEFAULT 'pending_confirmation',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  disputed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(match_id)
);

-- Create table for match chats
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

-- Create table for match wagers
CREATE TABLE IF NOT EXISTS match_wagers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_out_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(match_id)
);

-- Add new columns to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS reported_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS selected_maps VARCHAR[];
