-- Create a stored procedure for creating matches
CREATE OR REPLACE FUNCTION create_match(
  p_scheduled_by UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_status TEXT,
  p_location TEXT,
  p_match_type TEXT,
  p_is_private BOOLEAN,
  p_stream_url TEXT,
  p_match_notes TEXT,
  p_game_id UUID
) RETURNS JSON AS $$
DECLARE
  v_match_id UUID;
  v_result JSON;
BEGIN
  -- Insert the match
  INSERT INTO matches (
    scheduled_by,
    start_time,
    status,
    location,
    match_type,
    is_private,
    stream_url,
    match_notes,
    game_id
  ) VALUES (
    p_scheduled_by,
    p_start_time,
    p_status,
    p_location,
    p_match_type,
    p_is_private,
    p_stream_url,
    p_match_notes,
    p_game_id
  )
  RETURNING id INTO v_match_id;
  
  -- Return the match ID as JSON
  SELECT json_build_object(
    'id', v_match_id
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
