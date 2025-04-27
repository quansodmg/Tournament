-- Add new social media fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
ADD COLUMN IF NOT EXISTS youtube_handle TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
ADD COLUMN IF NOT EXISTS kick_url TEXT,
ADD COLUMN IF NOT EXISTS kick_handle TEXT;
