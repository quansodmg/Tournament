-- Create match settings table
CREATE TABLE IF NOT EXISTS match_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  ruleset_id TEXT,
  selected_maps TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_match_settings UNIQUE (match_id)
);

-- Create match results table
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  winner_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  loser_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  winner_score INTEGER NOT NULL DEFAULT 0,
  loser_score INTEGER NOT NULL DEFAULT 0,
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  disputed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  dispute_reason TEXT,
  notes TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending_confirmation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_match_result UNIQUE (match_id)
);

-- Create match wagers table
CREATE TABLE IF NOT EXISTS match_wagers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_match_wager UNIQUE (match_id)
);

-- Add setup_completed_at column to matches table if it doesn't exist
ALTER TABLE matches ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMP WITH TIME ZONE;

-- Add started_at column to matches table if it doesn't exist
ALTER TABLE matches ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

-- Add completed_at column to matches table if it doesn't exist
ALTER TABLE matches ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create function to update match status based on results
CREATE OR REPLACE FUNCTION update_match_status_on_result_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If result is confirmed, update match status to completed
  IF NEW.status = 'confirmed' THEN
    UPDATE matches SET status = 'completed', completed_at = NOW() WHERE id = NEW.match_id;
  -- If result is disputed, update match status to disputed
  ELSIF NEW.status = 'disputed' THEN
    UPDATE matches SET status = 'disputed' WHERE id = NEW.match_id;
  -- If result is pending confirmation, update match status to pending_confirmation
  ELSIF NEW.status = 'pending_confirmation' THEN
    UPDATE matches SET status = 'pending_confirmation' WHERE id = NEW.match_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update match status when result changes
CREATE TRIGGER update_match_status_on_result_change_trigger
AFTER INSERT OR UPDATE ON match_results
FOR EACH ROW
EXECUTE FUNCTION update_match_status_on_result_change();

-- Create storage bucket for match results if it doesn't exist
-- Note: This would typically be done in application code, not SQL
-- INSERT INTO storage.buckets (id, name) VALUES ('match-results', 'Match Results')
-- ON CONFLICT (id) DO NOTHING;
