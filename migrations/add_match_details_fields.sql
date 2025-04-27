-- Add game_mode and match_format columns to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS game_mode VARCHAR(255),
ADD COLUMN IF NOT EXISTS match_format VARCHAR(50);

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN matches.game_mode IS 'Specific game mode for the match (e.g., hardpoint, search_and_destroy)';
COMMENT ON COLUMN matches.match_format IS 'Format of the match (e.g., bo1, bo3, bo5)';
