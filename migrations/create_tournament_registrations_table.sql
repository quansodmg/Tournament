-- Create tournament_registrations table
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'registered',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK ((team_id IS NOT NULL) OR (profile_id IS NOT NULL))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament_id ON public.tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_team_id ON public.tournament_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_profile_id ON public.tournament_registrations(profile_id);

-- Add comment
COMMENT ON TABLE public.tournament_registrations IS 'Stores tournament registrations for teams and individual players';
