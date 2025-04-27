-- Create match chat table
CREATE TABLE IF NOT EXISTS match_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add foreign key constraint with special handling for system messages
  CONSTRAINT fk_profile
    FOREIGN KEY (profile_id)
    REFERENCES profiles(id)
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_match_chats_match_id ON match_chats(match_id);

-- Create match invitations table
CREATE TABLE IF NOT EXISTS match_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_match_team_invitation UNIQUE (match_id, team_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_match_invitations_match_id ON match_invitations(match_id);
CREATE INDEX IF NOT EXISTS idx_match_invitations_team_id ON match_invitations(team_id);

-- Create match player stats table
CREATE TABLE IF NOT EXISTS match_player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  objectives INTEGER DEFAULT 0,
  accuracy DECIMAL(5, 2),
  headshots INTEGER DEFAULT 0,
  time_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_match_player_stats UNIQUE (match_id, profile_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_match_player_stats_match_id ON match_player_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_match_player_stats_profile_id ON match_player_stats(profile_id);
