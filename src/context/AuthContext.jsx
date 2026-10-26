import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { verifyInstructorInvite } from '../lib/api';

const AuthContext = createContext(null);

const DEFAULT_DEMO_STUDENT = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alex.student@labsense.edu',
  user_metadata: { full_name: 'Alex Morgan' },
};

const DEFAULT_DEMO_STUDENT_PROFILE = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alex.student@labsense.edu',
  full_name: 'Alex Morgan',
  role: 'student',
  avatar_url: null,
};

const DEFAULT_DEMO_INSTRUCTOR_PROFILE = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'dr.sharma@labsense.edu',
  full_name: 'Dr. K. S. Sharma',
  role: 'instructor',
  avatar_url: null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_DEMO_STUDENT);
  const [profile, setProfile] = useState(DEFAULT_DEMO_STUDENT_PROFILE);
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
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Profile fetch warning:', err);
    }
  };

  // Student Sign Up
  const signUp = async (email, password, fullName) => {
    setAuthError(null);
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        return { success: true, user: data.user };
      } else {
        // Local mode registration
        const newDemo = {
          id: `local-${Date.now()}`,
          email,
          user_metadata: { full_name: fullName },
        };
        const newProfile = {
          id: newDemo.id,
          email,
          full_name: fullName,
          role: 'student', // ALWAYS student initially
        };
        setUser(newDemo);
        setProfile(newProfile);
        return { success: true, user: newDemo };
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
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setUser(data.user);
        await fetchProfile(data.user.id);
        return { success: true };
      } else {
        // Local mode demo login
        if (email.includes('instructor') || email.includes('sharma')) {
          setUser({ ...DEFAULT_DEMO_STUDENT, email, user_metadata: { full_name: 'Dr. K. S. Sharma' } });
          setProfile(DEFAULT_DEMO_INSTRUCTOR_PROFILE);
        } else {
          setUser({ ...DEFAULT_DEMO_STUDENT, email });
          setProfile({ ...DEFAULT_DEMO_STUDENT_PROFILE, email });
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
    setUser(DEFAULT_DEMO_STUDENT);
    setProfile(DEFAULT_DEMO_STUDENT_PROFILE);
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
        setProfile((prev) => ({
          ...prev,
          role: 'instructor',
          full_name: prev?.full_name?.startsWith('Dr.') ? prev.full_name : `Prof. ${prev?.full_name || 'Instructor'}`,
        }));
      }

      return { success: true, message: 'Instructor privileges successfully activated!' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Demo Switcher for fast hackathon testing
  const switchDemoRole = (targetRole) => {
    if (targetRole === 'instructor') {
      setUser({ ...DEFAULT_DEMO_STUDENT, email: 'dr.sharma@labsense.edu' });
      setProfile(DEFAULT_DEMO_INSTRUCTOR_PROFILE);
    } else {
      setUser(DEFAULT_DEMO_STUDENT);
      setProfile(DEFAULT_DEMO_STUDENT_PROFILE);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || 'student',
        isInstructor: profile?.role === 'instructor' || profile?.role === 'admin',
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
