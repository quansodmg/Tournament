-- Create ELO ratings table
CREATE TABLE IF NOT EXISTS elo_ratings (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL DEFAULT 1200,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (team_id, game_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_elo_ratings_rating ON elo_ratings(rating DESC);

-- Create ELO history table to track rating changes
CREATE TABLE IF NOT EXISTS elo_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  old_rating INTEGER NOT NULL,
  new_rating INTEGER NOT NULL,
  change INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add elo_processed field to matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS elo_processed BOOLEAN DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_elo_processed ON matches(elo_processed) WHERE elo_processed IS NULL;

-- Create function to get team ELO for a specific game
CREATE OR REPLACE FUNCTION get_team_elo(team_uuid UUID, game_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  team_elo INTEGER;
BEGIN
  SELECT rating INTO team_elo FROM elo_ratings 
  WHERE team_id = team_uuid AND game_id = game_uuid;
  
  IF team_elo IS NULL THEN
    RETURN 1200; -- Default ELO
  ELSE
    RETURN team_elo;
  END IF;
END;
$$ LANGUAGE plpgsql;
