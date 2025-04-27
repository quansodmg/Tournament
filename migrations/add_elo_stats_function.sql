-- Create a function to get ELO statistics
CREATE OR REPLACE FUNCTION get_elo_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'player_count', (SELECT COUNT(*) FROM profiles WHERE elo_matches > 0),
    'team_count', (SELECT COUNT(*) FROM teams WHERE elo_matches > 0),
    'match_count', (SELECT COUNT(*) FROM elo_match_results),
    'avg_player_rating', (SELECT AVG(elo_rating) FROM profiles WHERE elo_matches > 0),
    'avg_team_rating', (SELECT AVG(elo_rating) FROM teams WHERE elo_matches > 0),
    'highest_player_rating', (SELECT MAX(highest_elo) FROM profiles),
    'highest_team_rating', (SELECT MAX(highest_elo) FROM teams)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
