-- Create admin_roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_permissions table
CREATE TABLE IF NOT EXISTS public.admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource, action)
);

-- Create admin_role_permissions junction table
CREATE TABLE IF NOT EXISTS public.admin_role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.admin_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Add role_id column to admins table
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.admin_roles(id);

-- Insert default roles
INSERT INTO public.admin_roles (name, description)
VALUES 
('Super Admin', 'Has full access to all admin features'),
('Content Manager', 'Can manage games, tournaments, and content'),
('User Manager', 'Can manage users and teams'),
('Support Agent', 'Can handle disputes and user issues')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO public.admin_permissions (name, description, resource, action)
VALUES 
-- User management
('view_users', 'View user profiles', 'users', 'view'),
('edit_users', 'Edit user profiles', 'users', 'edit'),
('delete_users', 'Delete user accounts', 'users', 'delete'),

-- Team management
('view_teams', 'View teams', 'teams', 'view'),
('edit_teams', 'Edit teams', 'teams', 'edit'),
('delete_teams', 'Delete teams', 'teams', 'delete'),

-- Tournament management
('view_tournaments', 'View tournaments', 'tournaments', 'view'),
('create_tournaments', 'Create tournaments', 'tournaments', 'create'),
('edit_tournaments', 'Edit tournaments', 'tournaments', 'edit'),
('delete_tournaments', 'Delete tournaments', 'tournaments', 'delete'),

-- Game management
('view_games', 'View games', 'games', 'view'),
('create_games', 'Create games', 'games', 'create'),
('edit_games', 'Edit games', 'games', 'edit'),
('delete_games', 'Delete games', 'games', 'delete'),

-- Match management
('view_matches', 'View matches', 'matches', 'view'),
('edit_matches', 'Edit matches', 'matches', 'edit'),
('delete_matches', 'Delete matches', 'matches', 'delete'),

-- Dispute management
('view_disputes', 'View disputes', 'disputes', 'view'),
('resolve_disputes', 'Resolve disputes', 'disputes', 'resolve'),

-- Admin management
('view_admins', 'View admin accounts', 'admins', 'view'),
('create_admins', 'Create admin accounts', 'admins', 'create'),
('edit_admins', 'Edit admin accounts', 'admins', 'edit'),
('delete_admins', 'Delete admin accounts', 'admins', 'delete'),

-- Role management
('view_roles', 'View admin roles', 'roles', 'view'),
('create_roles', 'Create admin roles', 'roles', 'create'),
('edit_roles', 'Edit admin roles', 'roles', 'edit'),
('delete_roles', 'Delete admin roles', 'roles', 'delete'),

-- Statistics
('view_statistics', 'View site statistics', 'statistics', 'view')
ON CONFLICT (resource, action) DO NOTHING;

-- Get role IDs
DO $$
DECLARE
    super_admin_id UUID;
    content_manager_id UUID;
    user_manager_id UUID;
    support_agent_id UUID;
BEGIN
    SELECT id INTO super_admin_id FROM public.admin_roles WHERE name = 'Super Admin';
    SELECT id INTO content_manager_id FROM public.admin_roles WHERE name = 'Content Manager';
    SELECT id INTO user_manager_id FROM public.admin_roles WHERE name = 'User Manager';
    SELECT id INTO support_agent_id FROM public.admin_roles WHERE name = 'Support Agent';
    
    -- Assign all permissions to Super Admin
    INSERT INTO public.admin_role_permissions (role_id, permission_id)
    SELECT super_admin_id, id FROM public.admin_permissions
    ON CONFLICT (role_id, permission_id) DO NOTHING;
    
    -- Assign content management permissions to Content Manager
    INSERT INTO public.admin_role_permissions (role_id, permission_id)
    SELECT content_manager_id, id FROM public.admin_permissions 
    WHERE resource IN ('games', 'tournaments') OR name = 'view_statistics'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
    
    -- Assign user management permissions to User Manager
    INSERT INTO public.admin_role_permissions (role_id, permission_id)
    SELECT user_manager_id, id FROM public.admin_permissions 
    WHERE resource IN ('users', 'teams') OR name = 'view_statistics'
    ON CONFLICT (role_id, permission_id) DO NOTHING;
    
    -- Assign support permissions to Support Agent
    INSERT INTO public.admin_role_permissions (role_id, permission_id)
    SELECT support_agent_id, id FROM public.admin_permissions 
    WHERE resource IN ('disputes') OR name IN ('view_users', 'view_teams', 'view_matches', 'view_tournaments', 'view_statistics')
    ON CONFLICT (role_id, permission_id) DO NOTHING;
    
    -- Update existing admins to be Super Admins if they don't have a role
    UPDATE public.admins SET role_id = super_admin_id WHERE is_super_admin = true AND role_id IS NULL;
END $$;

-- Add RLS policies
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for admin_roles
CREATE POLICY admin_roles_select_policy ON public.admin_roles
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY admin_roles_insert_policy ON public.admin_roles
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY admin_roles_update_policy ON public.admin_roles
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY admin_roles_delete_policy ON public.admin_roles
    FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_super_admin = true));

-- Policies for admin_permissions
CREATE POLICY admin_permissions_select_policy ON public.admin_permissions
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY admin_permissions_insert_policy ON public.admin_permissions
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY admin_permissions_update_policy ON public.admin_permissions
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY admin_permissions_delete_policy ON public.admin_permissions
    FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_super_admin = true));

-- Policies for admin_role_permissions
CREATE POLICY admin_role_permissions_select_policy ON public.admin_role_permissions
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY admin_role_permissions_insert_policy ON public.admin_role_permissions
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY admin_role_permissions_update_policy ON public.admin_role_permissions
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_super_admin = true));

CREATE POLICY admin_role_permissions_delete_policy ON public.admin_role_permissions
    FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_super_admin = true));

-- Grant permissions
GRANT SELECT ON public.admin_roles TO authenticated;
GRANT SELECT ON public.admin_permissions TO authenticated;
GRANT SELECT ON public.admin_role_permissions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admin_roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admin_permissions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.admin_role_permissions TO authenticated;

-- Create function to get admin permissions
CREATE OR REPLACE FUNCTION get_admin_permissions(admin_id UUID)
RETURNS TABLE (
    permission_name VARCHAR(255),
    resource VARCHAR(255),
    action VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.name, p.resource, p.action
    FROM public.admin_permissions p
    JOIN public.admin_role_permissions rp ON p.id = rp.permission_id
    JOIN public.admin_roles r ON rp.role_id = r.id
    JOIN public.admins a ON r.id = a.role_id
    WHERE a.id = admin_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if admin has specific permission
CREATE OR REPLACE FUNCTION admin_has_permission(admin_id UUID, resource_name VARCHAR, action_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN;
    is_super BOOLEAN;
BEGIN
    -- Check if admin is a super admin
    SELECT is_super_admin INTO is_super FROM public.admins WHERE id = admin_id;
    
    -- Super admins have all permissions
    IF is_super THEN
        RETURN TRUE;
    END IF;
    
    -- Check for specific permission
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_permissions p
        JOIN public.admin_role_permissions rp ON p.id = rp.permission_id
        JOIN public.admin_roles r ON rp.role_id = r.id
        JOIN public.admins a ON r.id = a.role_id
        WHERE a.id = admin_id
        AND p.resource = resource_name
        AND p.action = action_name
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;
