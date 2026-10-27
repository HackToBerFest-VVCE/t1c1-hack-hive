-- ============================================================================
-- LabSense AI - Complete Supabase Database Schema & RLS Migrations
-- Migration: 001_initial_schema.sql
-- Role-based access control (Student, Instructor, Admin)
-- Strict RLS policies enforcing privacy and teaching scope
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'instructor', 'institution_admin', 'platform_super_admin', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE experiment_difficulty AS ENUM ('Beginner', 'Intermediate', 'Advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_status AS ENUM ('open', 'answered', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assessment_q_type AS ENUM ('mcq', 'short_answer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Mirrors auth.users with RBAC role)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. INSTRUCTOR INVITATION CODES TABLE (Secure server-side role promotion)
-- Students cannot assign themselves as instructor; they must provide a valid invite code
CREATE TABLE IF NOT EXISTS public.instructor_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    used_by UUID REFERENCES public.profiles(id),
    is_used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '30 days')
);

-- Pre-seed a default bootstrap instructor invite code for laboratory setup
INSERT INTO public.instructor_invites (invite_code, is_used)
VALUES ('LABSENSE-INST-2026', false)
ON CONFLICT (invite_code) DO NOTHING;

-- 5. EXPERIMENTS TABLE
CREATE TABLE IF NOT EXISTS public.experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty experiment_difficulty NOT NULL DEFAULT 'Beginner',
    description TEXT NOT NULL,
    learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
    components_required JSONB NOT NULL DEFAULT '[]'::jsonb,
    step_by_step_procedure JSONB NOT NULL DEFAULT '[]'::jsonb,
    expected_readings JSONB NOT NULL DEFAULT '{}'::jsonb,
    safety_instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    circuit_diagram_svg TEXT,
    simulation_config JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT false,
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_experiments_published ON public.experiments(is_published);
CREATE INDEX IF NOT EXISTS idx_experiments_category ON public.experiments(category);

-- 6. EXPERIMENT COMPLETIONS (Student progress tracking)
CREATE TABLE IF NOT EXISTS public.experiment_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bench_notes TEXT,
    measured_data JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_student_experiment UNIQUE (experiment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_completions_student ON public.experiment_completions(student_id);

-- 7. TROUBLESHOOTING SESSIONS (AI Multimodal Diagnostic History)
CREATE TABLE IF NOT EXISTS public.troubleshooting_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    experiment_type TEXT NOT NULL,
    problem_description TEXT NOT NULL,
    observed_symptoms TEXT,
    expected_behavior TEXT,
    supply_voltage NUMERIC,
    measured_voltage NUMERIC,
    measured_current NUMERIC,
    image_url TEXT,
    ai_report JSONB NOT NULL,
    model_identifier TEXT NOT NULL DEFAULT 'gemma-4-31b-it',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_troubleshoot_student ON public.troubleshooting_sessions(student_id);

-- 8. TROUBLESHOOTING MESSAGES (Follow-up interactive questions for active sessions)
CREATE TABLE IF NOT EXISTS public.troubleshooting_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.troubleshooting_sessions(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_troubleshoot_messages_session ON public.troubleshooting_messages(session_id);

-- 9. STUDENT QUESTIONS (Ask an Instructor)
CREATE TABLE IF NOT EXISTS public.student_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    experiment_id UUID REFERENCES public.experiments(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    circuit_image_url TEXT,
    status question_status NOT NULL DEFAULT 'open',
    assigned_instructor_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_questions_student ON public.student_questions(student_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.student_questions(status);

-- 10. QUESTION REPLIES (Conversation thread between student and instructor)
CREATE TABLE IF NOT EXISTS public.question_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.student_questions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_role user_role NOT NULL,
    content TEXT NOT NULL,
    is_ai_drafted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_replies_question ON public.question_replies(question_id);

-- 11. TESTS (Instructor Assessments)
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    experiment_id UUID REFERENCES public.experiments(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 20,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    is_published BOOLEAN NOT NULL DEFAULT false,
    results_visible_immediately BOOLEAN NOT NULL DEFAULT true,
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tests_published ON public.tests(is_published);

-- 12. TEST QUESTIONS
CREATE TABLE IF NOT EXISTS public.test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    question_type assessment_q_type NOT NULL DEFAULT 'mcq',
    prompt TEXT NOT NULL,
    options JSONB DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    marks INTEGER NOT NULL DEFAULT 1,
    explanation TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_test_questions_test ON public.test_questions(test_id);

-- 13. TEST SUBMISSIONS (Student Assessment Attempts)
CREATE TABLE IF NOT EXISTS public.test_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL DEFAULT 0,
    max_score NUMERIC NOT NULL DEFAULT 0,
    percentage NUMERIC NOT NULL DEFAULT 0,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.test_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_test ON public.test_submissions(test_id);

-- 14. STUDENT ANSWERS (Per-question answers and grading log)
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.test_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
    student_answer TEXT NOT NULL,
    is_correct BOOLEAN,
    marks_awarded NUMERIC NOT NULL DEFAULT 0,
    instructor_feedback TEXT
);

CREATE INDEX IF NOT EXISTS idx_student_answers_sub ON public.student_answers(submission_id);

-- ============================================================================
-- HELPER FUNCTIONS & DATABASE TRIGGERS
-- ============================================================================

-- A. Auto-create profile on auth.users registration (STRICT student role default)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'student' -- ALL self-registered users default strictly to student
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

-- B. Helper functions to check current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'instructor' OR role = 'institution_admin' OR role = 'platform_super_admin' OR role = 'admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- C. Secure RPC function to redeem instructor invite code
CREATE OR REPLACE FUNCTION public.redeem_instructor_invite(code_input TEXT)
RETURNS JSONB AS $$
DECLARE
    found_invite RECORD;
    target_user UUID;
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

    -- Update invite record
    UPDATE public.instructor_invites
    SET is_used = true, used_by = target_user
    WHERE id = found_invite.id;

    -- Promote user profile
    UPDATE public.profiles
    SET role = 'instructor', updated_at = now()
    WHERE id = target_user;

    RETURN jsonb_build_object('success', true, 'message', 'Instructor privileges successfully activated.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Idempotent definition with explicit DROP POLICY IF EXISTS
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.troubleshooting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.troubleshooting_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
-- Scoped select: users see own profile, instructors/admins see roster (No leaking open USING (true))
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR public.is_instructor());

-- Users can update only their own profile (and CANNOT change role column directly)
DROP POLICY IF EXISTS "Users can update their own profile basic info" ON public.profiles;
CREATE POLICY "Users can update their own profile basic info"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()));

-- 2. INSTRUCTOR INVITES POLICIES
-- Only instructors and admins can view invites
DROP POLICY IF EXISTS "Instructors can view invite codes" ON public.instructor_invites;
CREATE POLICY "Instructors can view invite codes"
    ON public.instructor_invites FOR SELECT
    TO authenticated
    USING (public.is_instructor());

-- Only instructors/admins can generate new invite codes
DROP POLICY IF EXISTS "Instructors can create invites" ON public.instructor_invites;
CREATE POLICY "Instructors can create invites"
    ON public.instructor_invites FOR INSERT
    TO authenticated
    WITH CHECK (public.is_instructor());

-- 3. EXPERIMENTS POLICIES
-- Students can only see published experiments
DROP POLICY IF EXISTS "Students can view published experiments" ON public.experiments;
CREATE POLICY "Students can view published experiments"
    ON public.experiments FOR SELECT
    TO authenticated
    USING (is_published = true OR public.is_instructor());

-- Only instructors can insert experiments
DROP POLICY IF EXISTS "Instructors can create experiments" ON public.experiments;
CREATE POLICY "Instructors can create experiments"
    ON public.experiments FOR INSERT
    TO authenticated
    WITH CHECK (public.is_instructor());

-- Only author or instructors can update experiments
DROP POLICY IF EXISTS "Instructors can update experiments" ON public.experiments;
CREATE POLICY "Instructors can update experiments"
    ON public.experiments FOR UPDATE
    TO authenticated
    USING (public.is_instructor())
    WITH CHECK (public.is_instructor());

-- Only author or instructors can delete experiments
DROP POLICY IF EXISTS "Instructors can delete experiments" ON public.experiments;
CREATE POLICY "Instructors can delete experiments"
    ON public.experiments FOR DELETE
    TO authenticated
    USING (public.is_instructor());

-- 4. EXPERIMENT COMPLETIONS POLICIES
-- Students can view and manage their own completions
DROP POLICY IF EXISTS "Students can view their own completions" ON public.experiment_completions;
CREATE POLICY "Students can view their own completions"
    ON public.experiment_completions FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.is_instructor());

DROP POLICY IF EXISTS "Students can insert their own completions" ON public.experiment_completions;
CREATE POLICY "Students can insert their own completions"
    ON public.experiment_completions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update their own completions" ON public.experiment_completions;
CREATE POLICY "Students can update their own completions"
    ON public.experiment_completions FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- 5. TROUBLESHOOTING SESSIONS POLICIES
-- Students can only view their own troubleshooting sessions
DROP POLICY IF EXISTS "Students can view own troubleshooting sessions" ON public.troubleshooting_sessions;
CREATE POLICY "Students can view own troubleshooting sessions"
    ON public.troubleshooting_sessions FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.is_instructor());

DROP POLICY IF EXISTS "Students can create own troubleshooting sessions" ON public.troubleshooting_sessions;
CREATE POLICY "Students can create own troubleshooting sessions"
    ON public.troubleshooting_sessions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

-- 6. TROUBLESHOOTING MESSAGES POLICIES
DROP POLICY IF EXISTS "Users can view messages for accessible sessions" ON public.troubleshooting_messages;
CREATE POLICY "Users can view messages for accessible sessions"
    ON public.troubleshooting_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.troubleshooting_sessions s
            WHERE s.id = troubleshooting_messages.session_id
            AND (s.student_id = auth.uid() OR public.is_instructor())
        )
    );

DROP POLICY IF EXISTS "Users can insert messages to their sessions" ON public.troubleshooting_messages;
CREATE POLICY "Users can insert messages to their sessions"
    ON public.troubleshooting_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.troubleshooting_sessions s
            WHERE s.id = troubleshooting_messages.session_id
            AND (s.student_id = auth.uid() OR public.is_instructor())
        )
    );

-- 7. STUDENT QUESTIONS POLICIES
-- Students can view their own questions; Instructors can view all questions
DROP POLICY IF EXISTS "View questions policy" ON public.student_questions;
CREATE POLICY "View questions policy"
    ON public.student_questions FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.is_instructor());

DROP POLICY IF EXISTS "Students can ask questions" ON public.student_questions;
CREATE POLICY "Students can ask questions"
    ON public.student_questions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Update questions policy" ON public.student_questions;
CREATE POLICY "Update questions policy"
    ON public.student_questions FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid() OR public.is_instructor())
    WITH CHECK (student_id = auth.uid() OR public.is_instructor());

-- 8. QUESTION REPLIES POLICIES
DROP POLICY IF EXISTS "View replies policy" ON public.question_replies;
CREATE POLICY "View replies policy"
    ON public.question_replies FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.student_questions q
            WHERE q.id = question_replies.question_id
            AND (q.student_id = auth.uid() OR public.is_instructor())
        )
    );

DROP POLICY IF EXISTS "Insert replies policy" ON public.question_replies;
CREATE POLICY "Insert replies policy"
    ON public.question_replies FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.student_questions q
            WHERE q.id = question_replies.question_id
            AND (q.student_id = auth.uid() OR public.is_instructor())
        )
    );

-- 9. TESTS POLICIES
-- Students can view published tests; Instructors can view all
DROP POLICY IF EXISTS "View tests policy" ON public.tests;
CREATE POLICY "View tests policy"
    ON public.tests FOR SELECT
    TO authenticated
    USING (is_published = true OR public.is_instructor());

DROP POLICY IF EXISTS "Instructors manage tests" ON public.tests;
CREATE POLICY "Instructors manage tests"
    ON public.tests FOR ALL
    TO authenticated
    USING (public.is_instructor())
    WITH CHECK (public.is_instructor());

-- 10. TEST QUESTIONS POLICIES
-- Students can see questions for published tests; Instructors can see all
DROP POLICY IF EXISTS "View test questions policy" ON public.test_questions;
CREATE POLICY "View test questions policy"
    ON public.test_questions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tests t
            WHERE t.id = test_questions.test_id
            AND (t.is_published = true OR public.is_instructor())
        )
    );

DROP POLICY IF EXISTS "Instructors manage test questions" ON public.test_questions;
CREATE POLICY "Instructors manage test questions"
    ON public.test_questions FOR ALL
    TO authenticated
    USING (public.is_instructor())
    WITH CHECK (public.is_instructor());

-- 11. TEST SUBMISSIONS POLICIES
-- Students can view own submissions; Instructors can view submissions for tests
DROP POLICY IF EXISTS "View submissions policy" ON public.test_submissions;
CREATE POLICY "View submissions policy"
    ON public.test_submissions FOR SELECT
    TO authenticated
    USING (student_id = auth.uid() OR public.is_instructor());

DROP POLICY IF EXISTS "Students can submit test attempts" ON public.test_submissions;
CREATE POLICY "Students can submit test attempts"
    ON public.test_submissions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

-- 12. STUDENT ANSWERS POLICIES
DROP POLICY IF EXISTS "View answers policy" ON public.student_answers;
CREATE POLICY "View answers policy"
    ON public.student_answers FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.test_submissions s
            WHERE s.id = student_answers.submission_id
            AND (s.student_id = auth.uid() OR public.is_instructor())
        )
    );

DROP POLICY IF EXISTS "Insert answers policy" ON public.student_answers;
CREATE POLICY "Insert answers policy"
    ON public.student_answers FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.test_submissions s
            WHERE s.id = student_answers.submission_id
            AND s.student_id = auth.uid()
        )
    );
