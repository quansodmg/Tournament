-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  category VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  rarity VARCHAR(20) NOT NULL DEFAULT 'common',
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user achievements table to track which users have which achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create initial achievements
INSERT INTO achievements (name, description, category, points, rarity, requirement_type, requirement_value, icon_url) VALUES
('First Blood', 'Win your first match', 'matches', 10, 'common', 'matches_won', 1, '/achievements/first-blood.png'),
('Veteran', 'Play 10 matches', 'matches', 20, 'common', 'matches_played', 10, '/achievements/veteran.png'),
('Champion', 'Win 25 matches', 'matches', 50, 'rare', 'matches_won', 25, '/achievements/champion.png'),
('Unstoppable', 'Win 5 matches in a row', 'matches', 100, 'epic', 'win_streak', 5, '/achievements/unstoppable.png'),
('Tournament Rookie', 'Participate in your first tournament', 'tournaments', 15, 'common', 'tournaments_played', 1, '/achievements/tournament-rookie.png'),
('Tournament Victor', 'Win your first tournament', 'tournaments', 100, 'rare', 'tournaments_won', 1, '/achievements/tournament-victor.png'),
('Team Player', 'Join your first team', 'teams', 10, 'common', 'teams_joined', 1, '/achievements/team-player.png'),
('Team Captain', 'Create your first team', 'teams', 20, 'common', 'teams_created', 1, '/achievements/team-captain.png'),
('Social Butterfly', 'Add 5 friends', 'social', 15, 'common', 'friends_count', 5, '/achievements/social-butterfly.png'),
('Profile Perfectionist', 'Complete your profile information', 'profile', 10, 'common', 'profile_completed', 1, '/achievements/profile-perfectionist.png');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(completed);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
