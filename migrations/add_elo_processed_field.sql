-- Add a field to track if ELO has been processed for a match
ALTER TABLE matches
ADD COLUMN elo_processed BOOLEAN DEFAULT NULL;

-- Create an index for faster queries
CREATE INDEX idx_matches_elo_processed ON matches (elo_processed);

-- Create a function to reset ELO ratings (for admin use)
CREATE OR REPLACE FUNCTION reset_elo_ratings()
RETURNS void AS $$
BEGIN
  -- Reset profile ratings
  UPDATE profiles SET 
    elo_rating = 1200,
    elo_matches = 0,
    highest_elo = 1200,
    elo_history = '[]'::jsonb;
  
  -- Reset team ratings
  UPDATE teams SET 
    elo_rating = 1200,
    elo_matches = 0,
    highest_elo = 1200,
    elo_history = '[]'::jsonb;
  
  -- Reset game-specific player ratings
  DELETE FROM player_elo_ratings;
  
  -- Reset game-specific team ratings
  DELETE FROM team_elo_ratings;
  
  -- Delete ELO match results
  DELETE FROM elo_match_results;
  
  -- Reset ELO processed flag on matches
  UPDATE matches SET elo_processed = NULL WHERE status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Create a function to recalculate ELO for a specific game
CREATE OR REPLACE FUNCTION recalculate_game_elo(game_id_param UUID)
RETURNS void AS $$
BEGIN
  -- Reset game-specific player ratings for this game
  DELETE FROM player_elo_ratings WHERE game_id = game_id_param;
  
  -- Reset game-specific team ratings for this game
  DELETE FROM team_elo_ratings WHERE game_id = game_id_param;
  
  -- Delete ELO match results for this game
  DELETE FROM elo_match_results 
  WHERE match_id IN (SELECT id FROM matches WHERE game_id = game_id_param);
  
  -- Reset ELO processed flag on matches for this game
  UPDATE matches SET elo_processed = NULL 
  WHERE status = 'completed' AND game_id = game_id_param;
END;
$$ LANGUAGE plpgsql;
