import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { verifyInstructorInvite } from '../lib/api';

const AuthContext = createContext(null);

const DEFAULT_DEMO_STUDENT = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alex.student@labsense.edu',
  user_metadata: { full_name: 'Darshan R' },
};

const DEFAULT_DEMO_STUDENT_PROFILE = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alex.student@labsense.edu',
  full_name: 'Darshan R',
  role: 'student',
  avatar_url: null,
  institution: 'Vidyavardhaka College of Engineering',
  institution_code: 'LSAI-VVCE-A7K2',
  department: 'Electronics & Communication Engineering',
  usn: '4VV21EC042',
  semester: '6th Semester',
  enrolled_subjects: [
    'Analog Electronics Lab (21EC32)',
    'Digital System Design Lab (21EC33)',
    'Microcontroller & Embedded Systems (21EC42)'
  ]
};

const DEFAULT_DEMO_INSTRUCTOR_PROFILE = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'dr.sharma@labsense.edu',
  full_name: 'Dr. Chethan M S',
  role: 'instructor',
  avatar_url: null,
  institution: 'Vidyavardhaka College of Engineering',
  institution_code: 'LSAI-VVCE-A7K2',
  department: 'Electronics & Communication Engineering',
  staff_id: 'VVCE-FAC-ECE-108',
  designation: 'Associate Professor & Lab Coordinator',
  assigned_subjects: [
    'Analog Electronics Lab (21EC32)',
    'Digital System Design Lab (21EC33)'
  ]
};

const DEFAULT_DEMO_INSTITUTION_ADMIN_PROFILE = {
  id: '00000000-0000-0000-0000-000000000003',
  email: 'admin.vvce@labsense.edu',
  full_name: 'Prof. Chinmayi D A',
  role: 'institution_admin',
  avatar_url: null,
  institution: 'Vidyavardhaka College of Engineering',
  institution_code: 'LSAI-VVCE-A7K2',
  department: 'Office of Academic Dean & Labs',
  designation: 'Principal & Institutional Workspace Admin',
  active_code: 'LSAI-VVCE-A7K2',
  student_count: 842,
  faculty_count: 28,
  active_labs: 6
};

const DEFAULT_DEMO_SUPER_ADMIN_PROFILE = {
  id: '00000000-0000-0000-0000-000000000004',
  email: 'superadmin@labsense.io',
  full_name: 'Harshith T S',
  role: 'platform_super_admin',
  avatar_url: null,
  institution: 'LabSense AI Platform Operations',
  institution_code: 'GLOBAL-SUPER-ROOT',
  department: 'Global Engineering & Platform Governance',
  designation: 'Platform Super Administrator',
  total_institutions: 14,
  total_students: 12840,
  total_instructors: 486
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('labsense_local_session');
      return saved ? JSON.parse(saved).user : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('labsense_local_session');
      return saved ? JSON.parse(saved).profile : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Initialize Supabase session if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const checkSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Session retrieval error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        localStorage.removeItem('labsense_local_session');
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        return data;
      }

      // Safe fallback from authenticated user metadata if profiles table is RLS-restricted
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user && userData.user.id === userId) {
        const meta = userData.user.user_metadata || {};
        const fallbackProfile = {
          id: userData.user.id,
          email: userData.user.email,
          full_name: meta.full_name || (userData.user.email ? userData.user.email.split('@')[0] : 'Student'),
          role: meta.role || 'student',
          institution_id: meta.institution_id || '00000000-0000-0000-0000-000000000100',
          institution_code: meta.institution_code || 'LSAI-VVCE-A7K2',
          institution: meta.institution || 'Vidyavardhaka College of Engineering',
          department: meta.department || 'Electronics & Communication Engineering',
          usn: meta.usn || '4VV21EC042',
          semester: meta.semester || '6th Semester',
          status: 'active',
        };
        setProfile(fallbackProfile);
        return fallbackProfile;
      }
      return null;
    } catch (err) {
      console.warn('Profile fetch warning:', err);
      return null;
    }
  };

  // Student or Instructor Sign Up
  const signUp = async (email, password, fullName, targetRole = 'student', institutionCode = '', idNumber = '') => {
    setAuthError(null);
    setLoading(true);
    try {
      const codeUpper = (institutionCode || '').trim().toUpperCase();

      if (isSupabaseConfigured && supabase) {
        // 1. Validate institution code against registered approved institutions
        let institutionId = null;
        let institutionName = 'Vidyavardhaka College of Engineering';

        if (codeUpper) {
          const { data: inst, error: instErr } = await supabase
            .from('institutions')
            .select('id, name, code, status, is_active')
            .eq('code', codeUpper)
            .eq('status', 'approved')
            .eq('is_active', true)
            .maybeSingle();

          if (instErr || !inst) {
            throw new Error(`Invalid or unapproved institution code "${codeUpper}". Please verify with your college coordinator.`);
          }
          institutionId = inst.id;
          institutionName = inst.name;
        }

        // 2. Real Supabase Auth signUp
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: targetRole,
              institution_code: codeUpper,
              institution_id: institutionId,
              institution: institutionName,
              usn: targetRole === 'student' ? (idNumber || '').trim() : undefined,
              staff_id: targetRole === 'instructor' ? (idNumber || '').trim() : undefined,
            },
          },
        });

        if (error) throw error;

        // Check if an existing account with identities exists
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          throw new Error('An account with this email address already exists. Please log in instead.');
        }

        const needsEmailConfirmation = Boolean(data.user && !data.session && !data.user.confirmed_at);

        let fetchedP = null;
        if (data.session && data.user) {
          setUser(data.user);
          fetchedP = await fetchProfile(data.user.id);
        }

        return {
          success: true,
          user: data.user,
          session: data.session,
          profile: fetchedP,
          needsEmailConfirmation,
          institutionName,
        };
      } else {
        // Local demonstration mode registration
        const newDemo = {
          id: `local-${Date.now()}`,
          email,
          user_metadata: { full_name: fullName, role: targetRole, institution_code: codeUpper },
        };
        const newProfile = {
          id: newDemo.id,
          email,
          full_name: fullName,
          role: targetRole,
          institution: 'Vidyavardhaka College of Engineering',
          institution_code: codeUpper || 'LSAI-VVCE-A7K2',
          department: 'Electronics & Communication Engineering',
          ...(targetRole === 'student' ? {
            usn: idNumber || '4VV21EC042',
            semester: '6th Semester',
            enrolled_subjects: ['Analog Electronics Lab (21EC32)', 'Digital System Design Lab (21EC33)']
          } : {
            staff_id: idNumber || 'VVCE-FAC-NEW',
            designation: 'Assistant Professor (Pending Verification)',
            assigned_subjects: ['Analog Electronics Lab (21EC32)']
          })
        };
        setUser(newDemo);
        setProfile(newProfile);
        try {
          localStorage.setItem('labsense_local_session', JSON.stringify({ user: newDemo, profile: newProfile }));
        } catch (e) {
          console.warn('Storage save warning:', e);
        }
        return { success: true, user: newDemo, profile: newProfile, needsEmailConfirmation: false };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign In
  const signIn = async (email, password) => {
    setAuthError(null);
    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setUser(data.user);
          const fetchedP = await fetchProfile(data.user.id);
          return { success: true, user: data.user, session: data.session, profile: fetchedP };
        }
        return { success: false, error: 'Authentication failed. No user returned.' };
      } else {
        // Local mode demo login
        const em = email.toLowerCase();
        let targetUser = null;
        let targetProfile = null;

        if (em.includes('super') || em.includes('sarah') || em.includes('harshith') || em.includes('platform')) {
          targetUser = { id: DEFAULT_DEMO_SUPER_ADMIN_PROFILE.id, email, user_metadata: { full_name: 'Harshith T S' } };
          targetProfile = DEFAULT_DEMO_SUPER_ADMIN_PROFILE;
        } else if (em.includes('admin') || em.includes('gowda') || em.includes('chinmayi') || em.includes('dean') || em.includes('principal')) {
          targetUser = { id: DEFAULT_DEMO_INSTITUTION_ADMIN_PROFILE.id, email, user_metadata: { full_name: 'Prof. Chinmayi D A' } };
          targetProfile = DEFAULT_DEMO_INSTITUTION_ADMIN_PROFILE;
        } else if (em.includes('instructor') || em.includes('sharma') || em.includes('chethan') || em.includes('faculty')) {
          targetUser = { id: DEFAULT_DEMO_INSTRUCTOR_PROFILE.id, email, user_metadata: { full_name: 'Dr. Chethan M S' } };
          targetProfile = DEFAULT_DEMO_INSTRUCTOR_PROFILE;
        } else {
          targetUser = { ...DEFAULT_DEMO_STUDENT, email };
          targetProfile = { ...DEFAULT_DEMO_STUDENT_PROFILE, email };
        }

        setUser(targetUser);
        setProfile(targetProfile);
        try {
          localStorage.setItem('labsense_local_session', JSON.stringify({ user: targetUser, profile: targetProfile }));
        } catch (e) {
          console.warn('Storage save warning:', e);
        }
        return { success: true };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    try {
      localStorage.removeItem('labsense_local_session');
    } catch (e) {
      console.warn('Storage clear warning:', e);
    }
    setUser(null);
    setProfile(null);
  };

  // Secure Instructor Role Elevation
  const redeemInstructorCode = async (inviteCode) => {
    try {
      // 1. Verify code via backend API
      const res = await verifyInstructorInvite(inviteCode);
      if (!res.valid) {
        return { success: false, message: res.message };
      }

      // 2. If Supabase is active, call DB RPC
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.rpc('redeem_instructor_invite', {
          code_input: inviteCode,
        });
        if (error) throw error;
        if (!data?.success) {
          return { success: false, message: data?.message || 'Code redemption rejected.' };
        }
        await fetchProfile(user.id);
      } else {
        // Local state upgrade
        const updatedProfile = {
          ...(profile || DEFAULT_DEMO_INSTRUCTOR_PROFILE),
          role: 'instructor',
          full_name: profile?.full_name?.startsWith('Dr.') ? profile.full_name : `Prof. ${profile?.full_name || 'Instructor'}`,
        };
        setProfile(updatedProfile);
        try {
          localStorage.setItem('labsense_local_session', JSON.stringify({ user, profile: updatedProfile }));
        } catch (e) {
          console.warn('Storage save warning:', e);
        }
      }

      return { success: true, message: 'Instructor privileges successfully activated!' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Demo Switcher for fast hackathon testing across all 4 roles
  const switchDemoRole = (targetRole) => {
    let targetUser = null;
    let targetProfile = null;

    if (targetRole === 'platform_super_admin' || targetRole === 'super_admin') {
      targetUser = { id: DEFAULT_DEMO_SUPER_ADMIN_PROFILE.id, email: 'superadmin@labsense.io', user_metadata: { full_name: 'Harshith T S' } };
      targetProfile = DEFAULT_DEMO_SUPER_ADMIN_PROFILE;
    } else if (targetRole === 'institution_admin' || targetRole === 'admin') {
      targetUser = { id: DEFAULT_DEMO_INSTITUTION_ADMIN_PROFILE.id, email: 'admin.vvce@labsense.edu', user_metadata: { full_name: 'Prof. Chinmayi D A' } };
      targetProfile = DEFAULT_DEMO_INSTITUTION_ADMIN_PROFILE;
    } else if (targetRole === 'instructor') {
      targetUser = { id: DEFAULT_DEMO_INSTRUCTOR_PROFILE.id, email: 'dr.sharma@labsense.edu', user_metadata: { full_name: 'Dr. Chethan M S' } };
      targetProfile = DEFAULT_DEMO_INSTRUCTOR_PROFILE;
    } else {
      targetUser = DEFAULT_DEMO_STUDENT;
      targetProfile = DEFAULT_DEMO_STUDENT_PROFILE;
    }

    setUser(targetUser);
    setProfile(targetProfile);
    try {
      localStorage.setItem('labsense_local_session', JSON.stringify({ user: targetUser, profile: targetProfile }));
    } catch (e) {
      console.warn('Storage save warning:', e);
    }
  };

  const currentRole = profile?.role || null;
  const isAuthenticated = Boolean(user && profile);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: currentRole,
        isAuthenticated,
        isStudent: currentRole === 'student',
        isInstructor: currentRole === 'instructor' || currentRole === 'institution_admin' || currentRole === 'platform_super_admin' || currentRole === 'admin',
        isInstructorOnly: currentRole === 'instructor',
        isInstitutionAdmin: currentRole === 'institution_admin',
        isSuperAdmin: currentRole === 'platform_super_admin',
        loading,
        authError,
        isSupabaseConfigured,
        signIn,
        signUp,
        logout,
        redeemInstructorCode,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
