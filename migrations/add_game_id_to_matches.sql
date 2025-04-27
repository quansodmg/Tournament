-- Migration to add game_id column to matches table
-- This resolves the error in the enhanced-schedule-match-form component

-- Add game_id column to matches table
ALTER TABLE matches ADD COLUMN game_id UUID REFERENCES games(id);

-- Add an index for better query performance
CREATE INDEX idx_matches_game_id ON matches(game_id);

-- Update existing matches with game information from match_settings if available
DO $$
DECLARE
    match_record RECORD;
BEGIN
    -- Check if match_settings table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'match_settings') THEN
        FOR match_record IN 
            SELECT m.id, ms.value->>'game_id' AS game_id_from_settings
            FROM matches m
            JOIN match_settings ms ON ms.match_id = m.id
            WHERE ms.key = 'game_info'
            AND ms.value->>'game_id' IS NOT NULL
        LOOP
            -- Update the match with the game_id from match_settings
            UPDATE matches 
            SET game_id = match_record.game_id_from_settings::uuid
            WHERE id = match_record.id;
        END LOOP;
    END IF;
END $$;

-- Add a comment to the column
COMMENT ON COLUMN matches.game_id IS 'Reference to the game this match is for';
