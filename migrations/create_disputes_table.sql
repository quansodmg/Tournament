-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    reported_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_note TEXT,
    evidence_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS disputes_match_id_idx ON public.disputes(match_id);
CREATE INDEX IF NOT EXISTS disputes_reported_by_id_idx ON public.disputes(reported_by_id);
CREATE INDEX IF NOT EXISTS disputes_assigned_to_id_idx ON public.disputes(assigned_to_id);
CREATE INDEX IF NOT EXISTS disputes_status_idx ON public.disputes(status);
CREATE INDEX IF NOT EXISTS disputes_created_at_idx ON public.disputes(created_at);

-- Add RLS policies
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own disputes
CREATE POLICY disputes_select_policy ON public.disputes
    FOR SELECT
    USING (
        auth.uid() = reported_by_id
        OR auth.uid() = assigned_to_id
        OR EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
    );

-- Policy for users to insert their own disputes
CREATE POLICY disputes_insert_policy ON public.disputes
    FOR INSERT
    WITH CHECK (auth.uid() = reported_by_id);

-- Policy for users to update their own disputes
CREATE POLICY disputes_update_policy ON public.disputes
    FOR UPDATE
    USING (
        auth.uid() = reported_by_id
        OR auth.uid() = assigned_to_id
        OR EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_disputes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_disputes_updated_at_trigger
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION update_disputes_updated_at();

-- Add trigger to set resolved_at when status changes to 'resolved'
CREATE OR REPLACE FUNCTION update_disputes_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_disputes_resolved_at_trigger
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION update_disputes_resolved_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.disputes TO authenticated;
GRANT SELECT ON public.disputes TO anon;

-- Update admin dashboard stats function to include disputes
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    users BIGINT,
    teams BIGINT,
    tournaments BIGINT,
    matches BIGINT,
    disputes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.profiles)::BIGINT AS users,
        (SELECT COUNT(*) FROM public.teams)::BIGINT AS teams,
        (SELECT COUNT(*) FROM public.tournaments)::BIGINT AS tournaments,
        (SELECT COUNT(*) FROM public.matches)::BIGINT AS matches,
        (SELECT COUNT(*) FROM public.disputes)::BIGINT AS disputes;
END;
$$ LANGUAGE plpgsql;
