-- This migration adds commonly needed columns to the matches table if they don't exist
DO $$
BEGIN
  -- Add game_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'matches'
    AND column_name = 'game_id'
  ) THEN
    ALTER TABLE matches ADD COLUMN game_id UUID REFERENCES games(id);
    CREATE INDEX IF NOT EXISTS idx_matches_game_id ON matches(game_id);
  END IF;

  -- Add name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'matches'
    AND column_name = 'name'
  ) THEN
    ALTER TABLE matches ADD COLUMN name TEXT;
  END IF;

  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'matches'
    AND column_name = 'description'
  ) THEN
    ALTER TABLE matches ADD COLUMN description TEXT;
  END IF;

  -- Add match_notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'matches'
    AND column_name = 'match_notes'
  ) THEN
    ALTER TABLE matches ADD COLUMN match_notes TEXT;
  END IF;

  -- Add is_private column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'matches'
    AND column_name = 'is_private'
  ) THEN
    ALTER TABLE matches ADD COLUMN is_private BOOLEAN DEFAULT false;
  END IF;

  -- Add match_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'matches'
    AND column_name = 'match_type'
  ) THEN
    ALTER TABLE matches ADD COLUMN match_type TEXT;
  END IF;

  -- Add game_mode column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'matches'
    AND column_name = 'game_mode'
  ) THEN
    ALTER TABLE matches ADD COLUMN game_mode TEXT;
  END IF;

  -- Add team_size column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'matches'
    AND column_name = 'team_size'
  ) THEN
    ALTER TABLE matches ADD COLUMN team_size INTEGER DEFAULT 4;
  END IF;
END
$$;
