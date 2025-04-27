-- Add ELO rating fields to profiles and teams tables
ALTER TABLE profiles
ADD COLUMN elo_rating INTEGER DEFAULT 1200,
ADD COLUMN elo_matches INTEGER DEFAULT 0,
ADD COLUMN highest_elo INTEGER DEFAULT 1200,
ADD COLUMN elo_history JSONB DEFAULT '[]'::jsonb;

ALTER TABLE teams
ADD COLUMN elo_rating INTEGER DEFAULT 1200,
ADD COLUMN elo_matches INTEGER DEFAULT 0,
ADD COLUMN highest_elo INTEGER DEFAULT 1200,
ADD COLUMN elo_history JSONB DEFAULT '[]'::jsonb;

-- Create a table to track game-specific ELO ratings
CREATE TABLE IF NOT EXISTS player_elo_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  game_id UUID NOT NULL REFERENCES games(id),
  elo_rating INTEGER DEFAULT 1200,
  elo_matches INTEGER DEFAULT 0,
  highest_elo INTEGER DEFAULT 1200,
  elo_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, game_id)
);

CREATE TABLE IF NOT EXISTS team_elo_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id),
  game_id UUID NOT NULL REFERENCES games(id),
  elo_rating INTEGER DEFAULT 1200,
  elo_matches INTEGER DEFAULT 0,
  highest_elo INTEGER DEFAULT 1200,
  elo_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, game_id)
);

-- Create a table to track ELO changes from matches
CREATE TABLE IF NOT EXISTS elo_match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id),
  winner_id UUID NOT NULL,
  winner_type TEXT NOT NULL CHECK (winner_type IN ('team', 'player')),
  winner_previous_elo INTEGER NOT NULL,
  winner_new_elo INTEGER NOT NULL,
  winner_elo_change INTEGER NOT NULL,
  loser_id UUID NOT NULL,
  loser_type TEXT NOT NULL CHECK (loser_type IN ('team', 'player')),
  loser_previous_elo INTEGER NOT NULL,
  loser_new_elo INTEGER NOT NULL,
  loser_elo_change INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to update ELO ratings after a match
CREATE OR REPLACE FUNCTION update_elo_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be implemented in the application code
  -- for more flexibility, but we create it here as a placeholder
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update ELO ratings when a match is completed
CREATE TRIGGER update_elo_after_match
AFTER UPDATE OF status ON matches
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION update_elo_ratings();
