-- Create table for player statistics in matches
CREATE TABLE IF NOT EXISTS match_player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  objective_time INTEGER DEFAULT 0, -- in seconds
  headshots INTEGER DEFAULT 0,
  accuracy DECIMAL(5, 2), -- percentage
  longest_streak INTEGER DEFAULT 0,
  damage_dealt INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(match_id, profile_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_match_player_stats_match_id ON match_player_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_match_player_stats_profile_id ON match_player_stats(profile_id);
CREATE INDEX IF NOT EXISTS idx_match_player_stats_team_id ON match_player_stats(team_id);

-- Add function to update player stats when match is completed
CREATE OR REPLACE FUNCTION update_player_stats_after_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Update player stats in player_stats table
  INSERT INTO player_stats (user_id, game_id, matches_played, matches_won, total_earnings)
  SELECT 
    mps.profile_id,
    m.game_id,
    1,
    CASE WHEN mp.result = 'win' THEN 1 ELSE 0 END,
    CASE WHEN mp.result = 'win' AND mw.amount > 0 THEN mw.amount ELSE 0 END
  FROM match_player_stats mps
  JOIN matches m ON mps.match_id = m.id
  JOIN match_participants mp ON mp.match_id = m.id AND mp.team_id = mps.team_id
  LEFT JOIN match_wagers mw ON mw.match_id = m.id
  WHERE mps.match_id = NEW.match_id
  ON CONFLICT (user_id, game_id) DO UPDATE SET
    matches_played = player_stats.matches_played + 1,
    matches_won = player_stats.matches_won + CASE WHEN EXCLUDED.matches_won > 0 THEN 1 ELSE 0 END,
    total_earnings = player_stats.total_earnings + EXCLUDED.total_earnings;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update player stats when match is completed
CREATE TRIGGER update_player_stats_after_match_trigger
AFTER UPDATE OF status ON matches
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION update_player_stats_after_match();
