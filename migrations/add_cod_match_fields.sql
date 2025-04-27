-- Add Call of Duty specific fields to matches table
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS game_mode VARCHAR(255),
ADD COLUMN IF NOT EXISTS match_format VARCHAR(50) DEFAULT 'bo1',
ADD COLUMN IF NOT EXISTS team_size INTEGER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_game_mode ON matches(game_mode);
CREATE INDEX IF NOT EXISTS idx_matches_match_format ON matches(match_format);
CREATE INDEX IF NOT EXISTS idx_matches_team_size ON matches(team_size);

-- Update match_participants table to include status field
ALTER TABLE match_participants
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Create index for match_participants status
CREATE INDEX IF NOT EXISTS idx_match_participants_status ON match_participants(status);
