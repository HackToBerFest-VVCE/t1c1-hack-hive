-- ============================================================================
-- LabSense AI — Complete Database Migration: Institution Hierarchy, 4-Role RBAC & Audit Security
-- Migration: 002_institution_hierarchy_and_rbac.sql
-- Status: AUDITED, HARDENED & RECOVERY-TESTED FOR SUPABASE SQL EDITOR
-- Order: Execute AFTER 001_initial_schema.sql
-- ============================================================================

-- 1. ROLE ENUM EXPANSION
-- Add required administrative roles if not already present.
-- We issue an explicit COMMIT immediately so new enum values are catalog-committed
-- and will not trigger PostgreSQL error 55P04 in the statements below.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'institution_admin';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'platform_super_admin';
COMMIT;

-- 2. INSTITUTIONS TABLE (Multi-Tenant Institutional Workspaces)
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g., 'LSAI-VVCE-A7K2'
    institution_type TEXT NOT NULL DEFAULT 'Autonomous Engineering College',
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    official_email TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_designation TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    enrollment_paused BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_institutions_code ON public.institutions(code);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON public.institutions(status);

-- Explicit grants for institutions table
GRANT SELECT ON public.institutions TO anon, authenticated;
GRANT ALL ON public.institutions TO authenticated;

-- 3. PROFILES TABLE EXTENSIONS
-- Add foreign key reference to institutions and institutional roster metadata idempotently
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS usn TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS semester TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS staff_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrolled_subjects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_subjects JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_status'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT chk_profiles_status CHECK (status IN ('active', 'pending_approval', 'suspended'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_institution_code ON public.profiles(institution_code);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Explicit grants for profiles table
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- 4. ADMINISTRATIVE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'institution', 'user', 'experiment', 'system'
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- HARDENED PERMISSIONS: Revoke direct client mutation on audit logs.
-- Authenticated users can only read logs via RLS policies; all writes occur through trusted SECURITY DEFINER RPCs.
REVOKE ALL ON public.audit_logs FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

-- 5. WORKSPACE SCOPING FOR CORE DOMAINS
ALTER TABLE public.experiments
    ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_experiments_institution ON public.experiments(institution_id);

ALTER TABLE public.tests
    ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_tests_institution ON public.tests(institution_id);

ALTER TABLE public.student_questions
    ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_questions_institution ON public.student_questions(institution_id);

ALTER TABLE public.instructor_invites
    ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_invites_institution ON public.instructor_invites(institution_id);

-- 6. SEED BENCHMARK INSTITUTION
INSERT INTO public.institutions (
    id,
    name,
    code,
    institution_type,
    country,
    state,
    city,
    official_email,
    contact_name,
    contact_designation,
    contact_email,
    contact_phone,
    status,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000100',
    'Vidyavardhaka College of Engineering',
    'LSAI-VVCE-A7K2',
    'Autonomous Engineering College',
    'India',
    'Karnataka',
    'Mysuru',
    'principal@vvce.ac.in',
    'Prof. B. S. Gowda',
    'Principal & Institutional Workspace Admin',
    'admin.vvce@labsense.edu',
    '+91-821-4276200',
    'approved',
    true
) ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active;

-- 7. SECURITY HELPER FUNCTIONS (SECURITY DEFINER with safe search_path)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role::text = 'platform_super_admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_institution_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role::text = 'institution_admin' OR role::text = 'platform_super_admin' OR role::text = 'admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role::text = 'instructor' OR role::text = 'institution_admin' OR role::text = 'platform_super_admin' OR role::text = 'admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.current_user_institution_id()
RETURNS UUID AS $$
    SELECT institution_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_institution_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_instructor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_institution_id() TO authenticated;

-- 8. AUTO-REGISTRATION TRIGGER (STRICT STUDENT ENFORCEMENT)
-- Users self-registering via Supabase Auth are STRICTLY defaulted to 'student'.
-- Privileged roles (instructor, institution_admin, platform_super_admin) CANNOT be self-assigned.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    inst_id UUID := NULL;
    provided_code TEXT;
BEGIN
    provided_code := trim(COALESCE(NEW.raw_user_meta_data->>'institution_code', ''));
    
    IF provided_code <> '' THEN
        SELECT id INTO inst_id FROM public.institutions 
        WHERE code = provided_code AND status = 'approved' AND is_active = true;
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        institution_id,
        institution_code,
        status
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'student', -- Strict default: self-registration is ALWAYS student
        inst_id,
        provided_code,
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. INSTITUTION REGISTRATION RPC (PUBLIC APPLICATION WORKFLOW)
CREATE OR REPLACE FUNCTION public.register_institution_request(
    p_name TEXT,
    p_institution_type TEXT,
    p_country TEXT,
    p_state TEXT,
    p_city TEXT,
    p_official_email TEXT,
    p_contact_name TEXT,
    p_contact_designation TEXT,
    p_contact_email TEXT,
    p_contact_phone TEXT
)
RETURNS JSONB AS $$
DECLARE
    gen_code TEXT;
    words TEXT[];
    initials TEXT := '';
    w TEXT;
    new_inst RECORD;
BEGIN
    -- Generate unique institution code
    words := regexp_split_to_array(trim(p_name), '\s+');
    FOREACH w IN ARRAY words LOOP
        IF length(w) > 0 AND length(initials) < 4 THEN
            initials := initials || upper(substr(w, 1, 1));
        END IF;
    END LOOP;
    IF length(initials) < 3 THEN initials := 'COL'; END IF;
    gen_code := 'LSAI-' || initials || '-' || upper(substr(md5(random()::text), 1, 4));

    INSERT INTO public.institutions (
        name,
        code,
        institution_type,
        country,
        state,
        city,
        official_email,
        contact_name,
        contact_designation,
        contact_email,
        contact_phone,
        status,
        is_active
    ) VALUES (
        p_name,
        gen_code,
        COALESCE(p_institution_type, 'Autonomous Engineering College'),
        COALESCE(p_country, 'India'),
        p_state,
        p_city,
        p_official_email,
        p_contact_name,
        p_contact_designation,
        p_contact_email,
        p_contact_phone,
        'pending',
        true
    ) RETURNING * INTO new_inst;

    INSERT INTO public.audit_logs (
        actor_id, actor_name, actor_role, action, target_type, target_id, details, severity
    ) VALUES (
        auth.uid(), p_contact_name, 'applicant',
        'New Institution Workspace Application Submitted', 'institution', new_inst.id::text,
        jsonb_build_object('institution_name', p_name, 'code', gen_code, 'official_email', p_official_email), 'info'
    );

    RETURN jsonb_build_object(
        'success', true,
        'institution_id', new_inst.id,
        'code', new_inst.code,
        'status', new_inst.status,
        'message', 'Institution registration submitted for Super Admin review.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.register_institution_request(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 10. SUPER ADMIN INSTITUTION APPROVAL RPC
CREATE OR REPLACE FUNCTION public.approve_institution(
    p_institution_id UUID,
    p_admin_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    target_inst RECORD;
    actor_rec RECORD;
BEGIN
    IF NOT public.is_super_admin() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Super Admin privileges required.');
    END IF;

    SELECT * INTO target_inst FROM public.institutions WHERE id = p_institution_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Institution not found.');
    END IF;

    SELECT * INTO actor_rec FROM public.profiles WHERE id = auth.uid();

    UPDATE public.institutions
    SET status = 'approved', updated_at = now()
    WHERE id = p_institution_id;

    IF p_admin_user_id IS NOT NULL THEN
        UPDATE public.profiles
        SET role = 'institution_admin',
            institution_id = p_institution_id,
            updated_at = now()
        WHERE id = p_admin_user_id;
    END IF;

    INSERT INTO public.audit_logs (
        actor_id, actor_name, actor_role, action, target_type, target_id, details, severity
    ) VALUES (
        auth.uid(), COALESCE(actor_rec.full_name, 'Super Admin'), 'platform_super_admin',
        'Institution Workspace Approved', 'institution', p_institution_id::text,
        jsonb_build_object('institution_name', target_inst.name, 'code', target_inst.code), 'success'
    );

    RETURN jsonb_build_object('success', true, 'message', 'Institution approved successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.approve_institution(UUID, UUID) TO authenticated;

-- 11. HARDENED SERVER-SIDE SUPER ADMIN PROVISIONING PROCEDURE
-- SECURITY HARDENING:
-- 1. Direct invocation from PostgREST/anon/authenticated is strictly blocked via REVOKE and runtime check.
-- 2. Bootstrap Lock: Can ONLY be run once if no platform_super_admin exists.
-- 3. Sets safe search path.
CREATE OR REPLACE FUNCTION public.promote_initial_super_admin(target_email TEXT)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_target_email TEXT;
BEGIN
    -- Security Guard 1: Prohibit execution from anon and authenticated clients over PostgREST
    IF current_user IN ('anon', 'authenticated') OR COALESCE(auth.role(), '') IN ('anon', 'authenticated') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Access Denied: promote_initial_super_admin can only be invoked by postgres or service_role in trusted environment (Supabase SQL Editor or Backend CLI).'
        );
    END IF;

    -- Security Guard 2: Bootstrap Lock. If any super admin already exists, lock this procedure.
    IF EXISTS (SELECT 1 FROM public.profiles WHERE role::text = 'platform_super_admin') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Bootstrap locked: A platform super admin has already been provisioned. Use administrative delegation.'
        );
    END IF;

    v_target_email := lower(trim(target_email));
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = v_target_email;
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User with email "' || v_target_email || '" does not exist in auth.users. Please create or register the user first via Supabase Auth.'
        );
    END IF;

    -- Upsert profile record
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        institution_code,
        department,
        designation,
        status
    ) VALUES (
        v_user_id,
        v_target_email,
        split_part(v_target_email, '@', 1),
        'platform_super_admin',
        'GLOBAL-SUPER-ROOT',
        'Global Governance',
        'Platform Super Administrator',
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'platform_super_admin',
        institution_code = 'GLOBAL-SUPER-ROOT',
        department = 'Global Governance',
        designation = 'Platform Super Administrator',
        status = 'active',
        updated_at = now();

    -- Record immutable audit log
    INSERT INTO public.audit_logs (
        actor_id, actor_name, actor_role, action, target_type, target_id, details, severity
    ) VALUES (
        v_user_id, 'System Owner / SQL Editor', 'platform_super_admin',
        'Initial Platform Super Admin Provisioned', 'user', v_user_id::text,
        jsonb_build_object('email', v_target_email), 'success'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Successfully promoted ' || v_target_email || ' to platform_super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Revoke execute from public, anon, and authenticated so PostgREST blocks direct HTTP calls
REVOKE EXECUTE ON FUNCTION public.promote_initial_super_admin(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_initial_super_admin(TEXT) TO postgres, service_role;

-- 12. MULTI-TENANT INSTRUCTOR INVITE REDEMPTION PROCEDURE
CREATE OR REPLACE FUNCTION public.redeem_instructor_invite(code_input TEXT)
RETURNS JSONB AS $$
DECLARE
    found_invite RECORD;
    target_user UUID;
    target_profile RECORD;
BEGIN
    target_user := auth.uid();
    IF target_user IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Authentication required.');
    END IF;

    SELECT * INTO found_invite FROM public.instructor_invites
    WHERE invite_code = trim(code_input) AND is_used = false AND expires_at > now();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired instructor invite code.');
    END IF;

    SELECT * INTO target_profile FROM public.profiles WHERE id = target_user;

    -- Mark invite code as used
    UPDATE public.instructor_invites
    SET is_used = true, used_by = target_user
    WHERE id = found_invite.id;

    -- Promote user profile and attach institution if invite is institution-specific
    UPDATE public.profiles
    SET role = 'instructor',
        institution_id = COALESCE(found_invite.institution_id, target_profile.institution_id),
        institution_code = COALESCE(
            (SELECT code FROM public.institutions WHERE id = found_invite.institution_id),
            target_profile.institution_code
        ),
        updated_at = now()
    WHERE id = target_user;

    -- Write audit log
    INSERT INTO public.audit_logs (
        actor_id, actor_name, actor_role, action, target_type, target_id, details, severity
    ) VALUES (
        target_user, COALESCE(target_profile.full_name, 'Instructor'), 'instructor',
        'Instructor Invite Code Redeemed', 'user', target_user::text,
        jsonb_build_object('invite_code', trim(code_input), 'institution_id', found_invite.institution_id),
        'success'
    );

    RETURN jsonb_build_object('success', true, 'message', 'Instructor privileges successfully activated.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.redeem_instructor_invite(TEXT) TO authenticated;

-- 13. ADMINISTRATIVE RECORD MUTATION RPCs
CREATE OR REPLACE FUNCTION public.admin_toggle_user_status(target_user_id UUID, new_status TEXT)
RETURNS JSONB AS $$
DECLARE
    actor_rec RECORD;
    target_rec RECORD;
BEGIN
    IF NOT (public.is_super_admin() OR public.is_institution_admin()) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Admin privileges required.');
    END IF;

    IF new_status NOT IN ('active', 'suspended') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid status. Must be active or suspended.');
    END IF;

    SELECT * INTO actor_rec FROM public.profiles WHERE id = auth.uid();
    SELECT * INTO target_rec FROM public.profiles WHERE id = target_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Target user profile not found.');
    END IF;

    -- Super admins cannot be suspended via this procedure
    IF target_rec.role::text = 'platform_super_admin' AND NOT public.is_super_admin() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Access denied: Cannot alter platform super admin status.');
    END IF;

    -- Cannot suspend yourself
    IF target_user_id = auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Operation denied: You cannot alter your own status.');
    END IF;

    -- Institution Admins can only modify users in their own institution
    IF public.is_institution_admin() AND NOT public.is_super_admin() THEN
        IF target_rec.institution_id IS DISTINCT FROM actor_rec.institution_id THEN
            RETURN jsonb_build_object('success', false, 'message', 'Access denied: User belongs to a different institution.');
        END IF;
    END IF;

    UPDATE public.profiles
    SET status = new_status, updated_at = now()
    WHERE id = target_user_id;

    INSERT INTO public.audit_logs (
        actor_id, actor_name, actor_role, action, target_type, target_id, details, severity
    ) VALUES (
        auth.uid(), COALESCE(actor_rec.full_name, 'Admin'), actor_rec.role::text,
        'User Status Toggled', 'user', target_user_id::text,
        jsonb_build_object('target_name', target_rec.full_name, 'new_status', new_status),
        CASE WHEN new_status = 'suspended' THEN 'warning' ELSE 'info' END
    );

    RETURN jsonb_build_object('success', true, 'message', 'User status updated to ' || new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.admin_toggle_user_status(UUID, TEXT) TO authenticated;

-- ============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- Drop all existing policies from 001 and 002 to ensure completely repeatable,
-- idempotent execution and prevent leaky OR-combinations.
-- ============================================================================

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Clean up any legacy or overlapping policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile basic info" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot elevate own role" ON public.profiles;
DROP POLICY IF EXISTS "Institution Admins view member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super Admins manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles scoped select policy" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Institution Admins update member profiles" ON public.profiles;

DROP POLICY IF EXISTS "Instructors can view invite codes" ON public.instructor_invites;
DROP POLICY IF EXISTS "Instructors can create invites" ON public.instructor_invites;
DROP POLICY IF EXISTS "Scoped view instructor invites" ON public.instructor_invites;
DROP POLICY IF EXISTS "Scoped create instructor invites" ON public.instructor_invites;

DROP POLICY IF EXISTS "Students can view published experiments" ON public.experiments;
DROP POLICY IF EXISTS "Instructors can create experiments" ON public.experiments;
DROP POLICY IF EXISTS "Instructors can update experiments" ON public.experiments;
DROP POLICY IF EXISTS "Instructors can delete experiments" ON public.experiments;
DROP POLICY IF EXISTS "Scoped view experiments" ON public.experiments;
DROP POLICY IF EXISTS "Scoped create experiments" ON public.experiments;
DROP POLICY IF EXISTS "Scoped update experiments" ON public.experiments;
DROP POLICY IF EXISTS "Scoped delete experiments" ON public.experiments;

DROP POLICY IF EXISTS "Students can view their own completions" ON public.experiment_completions;
DROP POLICY IF EXISTS "Students can insert their own completions" ON public.experiment_completions;
DROP POLICY IF EXISTS "Students can update their own completions" ON public.experiment_completions;
DROP POLICY IF EXISTS "Scoped view experiment completions" ON public.experiment_completions;
DROP POLICY IF EXISTS "Students insert own completions" ON public.experiment_completions;
DROP POLICY IF EXISTS "Students update own completions" ON public.experiment_completions;

DROP POLICY IF EXISTS "Students can view own troubleshooting sessions" ON public.troubleshooting_sessions;
DROP POLICY IF EXISTS "Students can create own troubleshooting sessions" ON public.troubleshooting_sessions;
DROP POLICY IF EXISTS "Scoped view troubleshooting sessions" ON public.troubleshooting_sessions;
DROP POLICY IF EXISTS "Students create own troubleshooting sessions" ON public.troubleshooting_sessions;

DROP POLICY IF EXISTS "Users can view messages for accessible sessions" ON public.troubleshooting_messages;
DROP POLICY IF EXISTS "Users can insert messages to their sessions" ON public.troubleshooting_messages;
DROP POLICY IF EXISTS "Scoped view troubleshooting messages" ON public.troubleshooting_messages;
DROP POLICY IF EXISTS "Scoped insert troubleshooting messages" ON public.troubleshooting_messages;

DROP POLICY IF EXISTS "View questions policy" ON public.student_questions;
DROP POLICY IF EXISTS "Students can ask questions" ON public.student_questions;
DROP POLICY IF EXISTS "Update questions policy" ON public.student_questions;
DROP POLICY IF EXISTS "Scoped view questions" ON public.student_questions;
DROP POLICY IF EXISTS "Scoped insert questions" ON public.student_questions;
DROP POLICY IF EXISTS "Scoped update questions" ON public.student_questions;

DROP POLICY IF EXISTS "View replies policy" ON public.question_replies;
DROP POLICY IF EXISTS "Insert replies policy" ON public.question_replies;
DROP POLICY IF EXISTS "Scoped view question replies" ON public.question_replies;
DROP POLICY IF EXISTS "Scoped insert question replies" ON public.question_replies;

DROP POLICY IF EXISTS "View tests policy" ON public.tests;
DROP POLICY IF EXISTS "Instructors manage tests" ON public.tests;
DROP POLICY IF EXISTS "Scoped view tests" ON public.tests;
DROP POLICY IF EXISTS "Scoped manage tests" ON public.tests;

DROP POLICY IF EXISTS "View test questions policy" ON public.test_questions;
DROP POLICY IF EXISTS "Instructors manage test questions" ON public.test_questions;
DROP POLICY IF EXISTS "Scoped view test questions" ON public.test_questions;
DROP POLICY IF EXISTS "Scoped manage test questions" ON public.test_questions;

DROP POLICY IF EXISTS "View submissions policy" ON public.test_submissions;
DROP POLICY IF EXISTS "Students can submit test attempts" ON public.test_submissions;
DROP POLICY IF EXISTS "Scoped view test submissions" ON public.test_submissions;
DROP POLICY IF EXISTS "Students submit test attempts" ON public.test_submissions;

DROP POLICY IF EXISTS "View answers policy" ON public.student_answers;
DROP POLICY IF EXISTS "Insert answers policy" ON public.student_answers;
DROP POLICY IF EXISTS "Scoped view student answers" ON public.student_answers;
DROP POLICY IF EXISTS "Students insert answers" ON public.student_answers;

DROP POLICY IF EXISTS "View approved institutions" ON public.institutions;
DROP POLICY IF EXISTS "Admins view own institution" ON public.institutions;
DROP POLICY IF EXISTS "Admins update own institution details" ON public.institutions;
DROP POLICY IF EXISTS "Super Admins manage institutions" ON public.institutions;

DROP POLICY IF EXISTS "Super Admins view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Institution Admins view own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users insert audit logs" ON public.audit_logs;

-- ============================================================================
-- Multi-Tenant RLS Policies
-- ============================================================================

-- A. INSTITUTIONS
CREATE POLICY "View approved institutions"
    ON public.institutions FOR SELECT
    TO authenticated, anon
    USING (status = 'approved' AND is_active = true);

CREATE POLICY "Admins view own institution"
    ON public.institutions FOR SELECT
    TO authenticated
    USING (
        id = public.current_user_institution_id() OR
        public.is_super_admin()
    );

CREATE POLICY "Admins update own institution details"
    ON public.institutions FOR UPDATE
    TO authenticated
    USING (id = public.current_user_institution_id() AND public.is_institution_admin())
    WITH CHECK (
        id = public.current_user_institution_id() AND
        status = (SELECT i.status FROM public.institutions i WHERE i.id = public.current_user_institution_id()) AND
        code = (SELECT i.code FROM public.institutions i WHERE i.id = public.current_user_institution_id())
    );

CREATE POLICY "Super Admins manage institutions"
    ON public.institutions FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- B. PROFILES
-- Scoped SELECT: Self, Super Admin, or same-institution peers/instructors
CREATE POLICY "Profiles scoped select policy"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id
        OR public.is_super_admin()
        OR (
            institution_id IS NOT NULL 
            AND institution_id = public.current_user_institution_id()
            AND (public.is_instructor() OR public.is_institution_admin())
        )
    );

-- Self UPDATE: User can update name/avatar, but CANNOT alter role, institution_id, or status
CREATE POLICY "Users update own profile fields"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
        AND institution_id IS NOT DISTINCT FROM (SELECT p.institution_id FROM public.profiles p WHERE p.id = auth.uid())
        AND status = (SELECT p.status FROM public.profiles p WHERE p.id = auth.uid())
    );

-- Super Admins have complete governance over profiles
CREATE POLICY "Super Admins manage all profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Institution Admins can update roster profiles in their own institution (cannot elevate to platform_super_admin)
CREATE POLICY "Institution Admins update member profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (
        public.is_institution_admin()
        AND institution_id = public.current_user_institution_id()
        AND role::text <> 'platform_super_admin'
    )
    WITH CHECK (
        institution_id = public.current_user_institution_id()
        AND role::text <> 'platform_super_admin'
    );

-- C. AUDIT LOGS
CREATE POLICY "Super Admins view all audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "Institution Admins view own audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (
        public.is_institution_admin() AND
        (details->>'institution_id')::text = public.current_user_institution_id()::text
    );

-- D. EXPERIMENTS
CREATE POLICY "Scoped view experiments"
    ON public.experiments FOR SELECT
    TO authenticated
    USING (
        public.is_super_admin()
        OR (
            (institution_id IS NULL OR institution_id = public.current_user_institution_id())
            AND (is_published = true OR public.is_instructor())
        )
    );

CREATE POLICY "Scoped create experiments"
    ON public.experiments FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_super_admin()
        OR (
            public.is_instructor()
            AND (institution_id IS NULL OR institution_id = public.current_user_institution_id())
        )
    );

CREATE POLICY "Scoped update experiments"
    ON public.experiments FOR UPDATE
    TO authenticated
    USING (
        public.is_super_admin()
        OR (
            public.is_instructor()
            AND (author_id = auth.uid() OR public.is_institution_admin())
            AND (institution_id IS NULL OR institution_id = public.current_user_institution_id())
        )
    )
    WITH CHECK (
        public.is_super_admin()
        OR (
            public.is_instructor()
            AND (institution_id IS NULL OR institution_id = public.current_user_institution_id())
        )
    );

CREATE POLICY "Scoped delete experiments"
    ON public.experiments FOR DELETE
    TO authenticated
    USING (
        public.is_super_admin()
        OR (
            public.is_instructor()
            AND (author_id = auth.uid() OR public.is_institution_admin())
            AND (institution_id IS NULL OR institution_id = public.current_user_institution_id())
        )
    );

-- E. EXPERIMENT COMPLETIONS
CREATE POLICY "Scoped view experiment completions"
    ON public.experiment_completions FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        OR public.is_super_admin()
        OR (
            public.is_instructor()
            AND EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = experiment_completions.student_id
                AND p.institution_id = public.current_user_institution_id()
            )
        )
    );

CREATE POLICY "Students insert own completions"
    ON public.experiment_completions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students update own completions"
    ON public.experiment_completions FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- F. TROUBLESHOOTING SESSIONS
CREATE POLICY "Scoped view troubleshooting sessions"
    ON public.troubleshooting_sessions FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        OR public.is_super_admin()
        OR (
            public.is_instructor()
            AND EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = troubleshooting_sessions.student_id
                AND p.institution_id = public.current_user_institution_id()
            )
        )
    );

CREATE POLICY "Students create own troubleshooting sessions"
    ON public.troubleshooting_sessions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Scoped view troubleshooting messages"
    ON public.troubleshooting_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.troubleshooting_sessions s
            WHERE s.id = troubleshooting_messages.session_id
            AND (
                s.student_id = auth.uid()
                OR public.is_super_admin()
                OR (
                    public.is_instructor()
                    AND EXISTS (
                        SELECT 1 FROM public.profiles p
                        WHERE p.id = s.student_id
                        AND p.institution_id = public.current_user_institution_id()
                    )
                )
            )
        )
    );

CREATE POLICY "Scoped insert troubleshooting messages"
    ON public.troubleshooting_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.troubleshooting_sessions s
            WHERE s.id = troubleshooting_messages.session_id
            AND (
                s.student_id = auth.uid()
                OR public.is_super_admin()
                OR (
                    public.is_instructor()
                    AND EXISTS (
                        SELECT 1 FROM public.profiles p
                        WHERE p.id = s.student_id
                        AND p.institution_id = public.current_user_institution_id()
                    )
                )
            )
        )
    );

-- G. TESTS
CREATE POLICY "Scoped view tests"
    ON public.tests FOR SELECT
    TO authenticated
    USING (
        public.is_super_admin()
        OR (
            (institution_id IS NULL OR institution_id = public.current_user_institution_id())
            AND (is_published = true OR public.is_instructor())
        )
    );

CREATE POLICY "Scoped manage tests"
    ON public.tests FOR ALL
    TO authenticated
    USING (
        public.is_super_admin()
        OR (
            public.is_instructor()
            AND (institution_id IS NULL OR institution_id = public.current_user_institution_id())
        )
    )
    WITH CHECK (
        public.is_super_admin()
        OR (
            public.is_instructor()
            AND (institution_id IS NULL OR institution_id = public.current_user_institution_id())
        )
    );

-- H. TEST QUESTIONS
CREATE POLICY "Scoped view test questions"
    ON public.test_questions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tests t
            WHERE t.id = test_questions.test_id
            AND (
                public.is_super_admin()
                OR (
                    (t.institution_id IS NULL OR t.institution_id = public.current_user_institution_id())
                    AND (t.is_published = true OR public.is_instructor())
                )
            )
        )
    );

CREATE POLICY "Scoped manage test questions"
    ON public.test_questions FOR ALL
    TO authenticated
    USING (
        public.is_super_admin()
        OR EXISTS (
            SELECT 1 FROM public.tests t
            WHERE t.id = test_questions.test_id
            AND public.is_instructor()
            AND (t.institution_id IS NULL OR t.institution_id = public.current_user_institution_id())
        )
    )
    WITH CHECK (
        public.is_super_admin()
        OR EXISTS (
            SELECT 1 FROM public.tests t
            WHERE t.id = test_questions.test_id
            AND public.is_instructor()
            AND (t.institution_id IS NULL OR t.institution_id = public.current_user_institution_id())
        )
    );

-- I. TEST SUBMISSIONS & ANSWERS
CREATE POLICY "Scoped view test submissions"
    ON public.test_submissions FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        OR public.is_super_admin()
        OR (
            public.is_instructor()
            AND EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = test_submissions.student_id
                AND p.institution_id = public.current_user_institution_id()
            )
        )
    );

CREATE POLICY "Students submit test attempts"
    ON public.test_submissions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Scoped view student answers"
    ON public.student_answers FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.test_submissions s
            WHERE s.id = student_answers.submission_id
            AND (
                s.student_id = auth.uid()
                OR public.is_super_admin()
                OR (
                    public.is_instructor()
                    AND EXISTS (
                        SELECT 1 FROM public.profiles p
                        WHERE p.id = s.student_id
                        AND p.institution_id = public.current_user_institution_id()
                    )
                )
            )
        )
    );

CREATE POLICY "Students insert answers"
    ON public.student_answers FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.test_submissions s
            WHERE s.id = student_answers.submission_id
            AND s.student_id = auth.uid()
        )
    );

-- J. STUDENT QUESTIONS
CREATE POLICY "Scoped view questions"
    ON public.student_questions FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        OR public.is_super_admin()
        OR (
            public.is_instructor()
            AND (
                institution_id = public.current_user_institution_id()
                OR EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = student_questions.student_id
                    AND p.institution_id = public.current_user_institution_id()
                )
            )
        )
    );

CREATE POLICY "Scoped insert questions"
    ON public.student_questions FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id = auth.uid()
        AND (institution_id IS NULL OR institution_id = public.current_user_institution_id())
    );

CREATE POLICY "Scoped update questions"
    ON public.student_questions FOR UPDATE
    TO authenticated
    USING (
        student_id = auth.uid()
        OR public.is_super_admin()
        OR (
            public.is_instructor()
            AND (
                institution_id = public.current_user_institution_id()
                OR EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = student_questions.student_id
                    AND p.institution_id = public.current_user_institution_id()
                )
            )
        )
    )
    WITH CHECK (
        student_id = auth.uid()
        OR public.is_super_admin()
        OR (
            public.is_instructor()
            AND (
                institution_id = public.current_user_institution_id()
                OR EXISTS (
                    SELECT 1 FROM public.profiles p
                    WHERE p.id = student_questions.student_id
                    AND p.institution_id = public.current_user_institution_id()
                )
            )
        )
    );

-- K. QUESTION REPLIES
CREATE POLICY "Scoped view question replies"
    ON public.question_replies FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.student_questions q
            WHERE q.id = question_replies.question_id
            AND (
                q.student_id = auth.uid()
                OR public.is_super_admin()
                OR (
                    public.is_instructor()
                    AND (
                        q.institution_id = public.current_user_institution_id()
                        OR EXISTS (
                            SELECT 1 FROM public.profiles p
                            WHERE p.id = q.student_id
                            AND p.institution_id = public.current_user_institution_id()
                        )
                    )
                )
            )
        )
    );

CREATE POLICY "Scoped insert question replies"
    ON public.question_replies FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.student_questions q
            WHERE q.id = question_replies.question_id
            AND (
                q.student_id = auth.uid()
                OR public.is_super_admin()
                OR (
                    public.is_instructor()
                    AND (
                        q.institution_id = public.current_user_institution_id()
                        OR EXISTS (
                            SELECT 1 FROM public.profiles p
                            WHERE p.id = q.student_id
                            AND p.institution_id = public.current_user_institution_id()
                        )
                    )
                )
            )
        )
    );

-- L. INSTRUCTOR INVITES
CREATE POLICY "Scoped view instructor invites"
    ON public.instructor_invites FOR SELECT
    TO authenticated
    USING (
        public.is_super_admin()
        OR (
            public.is_institution_admin()
            AND (institution_id IS NULL OR institution_id = public.current_user_institution_id())
        )
    );

CREATE POLICY "Scoped create instructor invites"
    ON public.instructor_invites FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_super_admin()
        OR (
            public.is_institution_admin()
            AND (institution_id = public.current_user_institution_id())
        )
    );
