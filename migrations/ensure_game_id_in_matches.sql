-- Check if game_id column exists in matches table
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'matches'
        AND column_name = 'game_id'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE matches ADD COLUMN game_id UUID REFERENCES games(id);
        
        -- Add an index for better query performance
        CREATE INDEX IF NOT EXISTS idx_matches_game_id ON matches(game_id);
        
        -- Add a comment to the column
        COMMENT ON COLUMN matches.game_id IS 'Reference to the game this match is for';
    END IF;
END $$;
