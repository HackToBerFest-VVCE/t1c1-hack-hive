import React, { useState } from 'react';
import {
  X,
  Building2,
  UserPlus,
  LogIn,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Info,
  Copy,
  Check,
  HelpCircle,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onSelectPortal }) {
  const {
    role,
    profile,
    switchDemoRole,
    signIn,
    signUp,
    logout
  } = useAuth();

  // Active Screen: 'hub' | 'register-institution' | 'institution-result' | 'institution-admin' | 'signup' | 'login'
  const [screen, setScreen] = useState('hub');

  // Institution Registration Form State
  const [instForm, setInstForm] = useState({
    officialName: '',
    institutionType: 'Autonomous Engineering College',
    country: 'India',
    state: 'Karnataka',
    city: 'Mysuru',
    officialEmail: '',
    contactName: '',
    contactDesignation: 'Head of Laboratory / Faculty Coordinator',
    contactEmail: '',
    contactPhone: '',
    adminPassword: '',
    adminConfirmPassword: '',
  });

  // Generated sample code for demonstration
  const [generatedSampleCode, setGeneratedSampleCode] = useState('LSAI-VVCE-A7K2');
  const [copiedCode, setCopiedCode] = useState(false);

  // User Sign Up Form State
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // 'student' | 'instructor'
    institutionCode: '',
    idNumber: '',
  });

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Feedback, Errors & Loading States
  const [errors, setErrors] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState(false);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleCopyCode = (codeToCopy) => {
    navigator.clipboard?.writeText(codeToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 1. Institution Registration Handler
  const handleRegisterInstitution = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!instForm.officialName.trim()) {
      newErrors.officialName = 'Institution name is required.';
    }
    if (!instForm.country.trim()) {
      newErrors.country = 'Country is required.';
    }
    if (!instForm.state.trim()) {
      newErrors.state = 'State / Region is required.';
    }
    if (!instForm.city.trim()) {
      newErrors.city = 'City is required.';
    }
    if (!instForm.officialEmail.trim() || !validateEmail(instForm.officialEmail)) {
      newErrors.officialEmail = 'A valid official institution email is required.';
    }
    if (!instForm.contactName.trim()) {
      newErrors.contactName = 'Contact person name is required.';
    }
    if (!instForm.contactEmail.trim() || !validateEmail(instForm.contactEmail)) {
      newErrors.contactEmail = 'A valid contact email is required.';
    }
    if (!instForm.adminPassword) {
      newErrors.adminPassword = 'Administrator password is required.';
    } else if (instForm.adminPassword.length < 6) {
      newErrors.adminPassword = 'Password must be at least 6 characters.';
    }
    if (instForm.adminPassword !== instForm.adminConfirmPassword) {
      newErrors.adminConfirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    // Derive a readable illustrative sample code from institution name
    const words = instForm.officialName.trim().split(/\s+/);
    let initials = words.map(w => w[0].toUpperCase()).slice(0, 4).join('');
    if (initials.length < 3) initials = 'COL';
    const sampleCode = `LSAI-${initials}-A7K2`;
    setGeneratedSampleCode(sampleCode);

    setTimeout(() => {
      setSubmitting(false);
      setScreen('institution-result');
    }, 450);
  };

  // 2. User Sign Up Handler
  const handleUserSignUp = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!signupForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!signupForm.email.trim() || !validateEmail(signupForm.email)) {
      newErrors.email = 'A valid email address is required.';
    }
    if (!signupForm.password) {
      newErrors.password = 'Password is required.';
    } else if (signupForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!signupForm.institutionCode.trim()) {
      newErrors.institutionCode = 'Institution code is required. Ask your college administrator or register your institution.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // In demonstration mode, simulate local account creation
      await signUp(signupForm.email, signupForm.password, signupForm.fullName);
      switchDemoRole(signupForm.role);

      setStatusMsg({
        type: 'success',
        text: `Demonstration account created for ${signupForm.fullName} (${signupForm.role.toUpperCase()}) linked to institution code ${signupForm.institutionCode}. Redirecting to portal...`
      });

      setTimeout(() => {
        if (onSelectPortal) {
          onSelectPortal(signupForm.role);
        }
        onClose();
      }, 900);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. User Login Handler
  const handleUserLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!loginForm.email.trim() || !validateEmail(loginForm.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!loginForm.password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const res = await signIn(loginForm.email, loginForm.password);
      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: 'Demonstration login verified. Redirecting to your laboratory workspace...'
        });
        setTimeout(() => {
          if (onSelectPortal) {
            const em = loginForm.email.toLowerCase();
            let destRole = 'student';
            if (em.includes('super') || em.includes('sarah') || em.includes('platform')) {
              destRole = 'super_admin';
            } else if (em.includes('admin') || em.includes('gowda') || em.includes('dean') || em.includes('principal')) {
              destRole = 'institution_admin';
            } else if (em.includes('instructor') || em.includes('sharma') || em.includes('faculty')) {
              destRole = 'instructor';
            }
            onSelectPortal(destRole);
          }
          onClose();
        }, 700);
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Login failed.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Quick Persona Evaluators for all 4 roles
  const handleQuickEnterRole = (targetRole, portalId) => {
    switchDemoRole(targetRole);
    if (onSelectPortal) {
      onSelectPortal(portalId);
    }
    onClose();
  };

  const handleSignOut = async () => {
    await logout();
    setStatusMsg({ type: 'success', text: 'Signed out of demonstration session.' });
    setTimeout(() => {
      setStatusMsg(null);
      if (onSelectPortal) onSelectPortal('workbench');
      onClose();
    }, 500);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-window modal-window-lg account-access-modal">
        {/* Modal Top Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Sparkles size={22} className="text-blue" />
            </div>
            <div>
              <h3 className="modal-title">
                {screen === 'hub' && 'LabSense AI — Account Access'}
                {screen === 'register-institution' && 'Register Educational Institution'}
                {screen === 'institution-result' && 'Institution Registration Result'}
                {screen === 'institution-admin' && 'Institution Workspace Administration'}
                {screen === 'signup' && 'Create Your User Account'}
                {screen === 'login' && 'Log In to LabSense AI'}
              </h3>
              <p className="modal-subtitle">
                {screen === 'hub' && 'Choose your access path or manage institutional workspace enrollment'}
                {screen === 'register-institution' && 'Establish an institutional workspace for your college, university, or polytechnic'}
                {screen === 'institution-result' && 'Review your assigned sample institution code and workspace details'}
                {screen === 'institution-admin' && 'Manage your college workspace credentials and enrollment access'}
                {screen === 'signup' && 'Join your college laboratory workspace with an assigned institution code'}
                {screen === 'login' && 'Sign in to access your experimental workbench and curriculum records'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Demonstration Notice Banner */}
        <div className="demo-mode-banner">
          <Info size={18} className="text-blue shrink-0" />
          <div className="demo-mode-text">
            <strong>Frontend Demonstration Mode:</strong>
            <span>
              Real PostgreSQL persistence, unique code uniqueness constraints, and Supabase Auth are scheduled for the backend milestone. All forms provide working client validation and honest simulated flows.
            </span>
          </div>
        </div>

        {/* =========================================================================
            SCREEN 1: ACCOUNT ACCESS HUB (3 Options)
           ========================================================================= */}
        {screen === 'hub' && (
          <div className="account-hub-body">
            {/* Active Demonstration Persona Header */}
            <div className="active-persona-banner">
              <div className="active-persona-left">
                <div className="persona-avatar-box">
                  {role === 'platform_super_admin' ? (
                    <ShieldAlert size={22} className="text-amber" />
                  ) : role === 'institution_admin' ? (
                    <Building2 size={22} className="text-indigo" />
                  ) : role === 'instructor' ? (
                    <ShieldCheck size={22} className="text-emerald" />
                  ) : (
                    <GraduationCap size={22} className="text-blue" />
                  )}
                </div>
                <div>
                  <div className="persona-name-row">
                    <span className="persona-name">{profile?.full_name || 'Active User'}</span>
                    <span className={`persona-role-tag tag-${role}`}>
                      {role === 'platform_super_admin' ? 'Platform Super Admin' : role === 'institution_admin' ? 'Institution Admin' : role === 'instructor' ? 'Instructor' : 'Student'}
                    </span>
                  </div>
                  <span className="persona-institution">
                    {profile?.institution || 'Vidyavardhaka College of Engineering'}
                    {profile?.department ? ` • ${profile.department}` : ''}
                  </span>
                </div>
              </div>

              <div className="active-persona-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    const dest = role === 'platform_super_admin' ? 'super_admin' : role === 'institution_admin' ? 'institution_admin' : role === 'instructor' ? 'instructor' : 'student';
                    if (onSelectPortal) onSelectPortal(dest);
                    onClose();
                  }}
                >
                  <span>Open My Dashboard</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={handleSignOut}
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            <div className="hub-cards-grid">
              {/* Option A: Register Institution */}
              <div className="hub-card hub-card-institution">
                <div className="hub-card-header">
                  <div className="hub-icon-box bg-indigo">
                    <Building2 size={26} className="text-white" />
                  </div>
                  <span className="hub-tag tag-indigo">Institutional Workspace</span>
                </div>

                <h4 className="hub-card-title">Register Institution</h4>
                <p className="hub-card-description">
                  Register a college, university, or educational institution to establish its LabSense AI workspace and receive a unique institution code.
                </p>

                <ul className="hub-card-points">
                  <li>
                    <CheckCircle2 size={15} className="text-indigo" />
                    <span>Assigns unique code for students & faculty</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} className="text-indigo" />
                    <span>Centralized curriculum & experiment access</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} className="text-indigo" />
                    <span>Department lab inquiry & assessment tools</span>
                  </li>
                </ul>

                <button
                  type="button"
                  className="btn btn-indigo btn-block"
                  onClick={() => { setErrors({}); setScreen('register-institution'); }}
                >
                  <span>Register Institution</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Option B: Create a User Account (Sign Up) */}
              <div className="hub-card hub-card-user">
                <div className="hub-card-header">
                  <div className="hub-icon-box bg-blue">
                    <UserPlus size={26} className="text-white" />
                  </div>
                  <span className="hub-tag tag-blue">Students & Faculty</span>
                </div>

                <h4 className="hub-card-title">Create a User Account</h4>
                <p className="hub-card-description">
                  Join an existing institution as a student or instructor using the unique institution code provided by your college.
                </p>

                <ul className="hub-card-points">
                  <li>
                    <CheckCircle2 size={15} className="text-blue" />
                    <span>Multimodal AI circuit troubleshooting with Gemma 4</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} className="text-blue" />
                    <span>5 interactive physics circuit simulation models</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} className="text-blue" />
                    <span>Faculty experiment designer & student inquiry tools</span>
                  </li>
                </ul>

                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => { setErrors({}); setStatusMsg(null); setScreen('signup'); }}
                >
                  <span>Sign Up</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Option C: Existing User (Log In) */}
              <div className="hub-card hub-card-login">
                <div className="hub-card-header">
                  <div className="hub-icon-box bg-emerald">
                    <LogIn size={26} className="text-white" />
                  </div>
                  <span className="hub-tag tag-emerald">Returning Users</span>
                </div>

                <h4 className="hub-card-title">Existing User</h4>
                <p className="hub-card-description">
                  Access an existing LabSense AI account. Returning users do not need to enter an institution code on every login.
                </p>

                <ul className="hub-card-points">
                  <li>
                    <CheckCircle2 size={15} className="text-emerald" />
                    <span>Direct routing to Student or Instructor Portal</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} className="text-emerald" />
                    <span>Preserves diagnostic histories & lab submissions</span>
                  </li>
                  <li>
                    <CheckCircle2 size={15} className="text-emerald" />
                    <span>Quick demonstration persona shortcuts included</span>
                  </li>
                </ul>

                <button
                  type="button"
                  className="btn btn-emerald btn-block"
                  onClick={() => { setErrors({}); setStatusMsg(null); setScreen('login'); }}
                >
                  <span>Log In</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Direct Demonstration Shortcuts for All 4 Roles */}
            <div className="hub-quick-eval-row">
              <span className="eval-row-label">Direct Role Evaluation Shortcuts:</span>
              <div className="eval-row-buttons">
                <button
                  type="button"
                  className="btn-eval-pill"
                  onClick={() => handleQuickEnterRole('student', 'student')}
                >
                  <GraduationCap size={15} />
                  <span>Student (Alex Morgan)</span>
                </button>
                <button
                  type="button"
                  className="btn-eval-pill pill-instructor"
                  onClick={() => handleQuickEnterRole('instructor', 'instructor')}
                >
                  <ShieldCheck size={15} />
                  <span>Instructor (Dr. Sharma)</span>
                </button>
                <button
                  type="button"
                  className="btn-eval-pill pill-admin"
                  onClick={() => handleQuickEnterRole('institution_admin', 'institution_admin')}
                >
                  <Building2 size={15} />
                  <span>Institution Admin (Prof. Gowda)</span>
                </button>
                <button
                  type="button"
                  className="btn-eval-pill pill-superadmin"
                  onClick={() => handleQuickEnterRole('platform_super_admin', 'super_admin')}
                >
                  <ShieldAlert size={15} />
                  <span>Super Admin (Sarah Jenkins)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 2: REGISTER INSTITUTION FORM
           ========================================================================= */}
        {screen === 'register-institution' && (
          <div className="modal-sub-screen">
            <div className="screen-nav-bar">
              <button
                type="button"
                className="btn-screen-back"
                onClick={() => setScreen('hub')}
              >
                <ArrowLeft size={16} />
                <span>Back to Account Options</span>
              </button>
              <span className="screen-step-badge">Step 1 of 2: Institution Setup</span>
            </div>

            <form onSubmit={handleRegisterInstitution} className="institution-form">
              {/* Institution Identity Section */}
              <div className="form-section-card">
                <h4 className="form-section-title">
                  <Building2 size={18} className="text-indigo" />
                  <span>1. Official Institution Information</span>
                </h4>

                <div className="form-group">
                  <label className="field-label" htmlFor="inst-name">
                    Official Institution Name <span className="required-mark">*</span>
                  </label>
                  <input
                    id="inst-name"
                    type="text"
                    className={`form-control ${errors.officialName ? 'is-invalid' : ''}`}
                    placeholder="e.g. Vidyavardhaka College of Engineering"
                    value={instForm.officialName}
                    onChange={(e) => setInstForm({ ...instForm, officialName: e.target.value })}
                  />
                  {errors.officialName && <span className="field-error-text">{errors.officialName}</span>}
                </div>

                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label className="field-label" htmlFor="inst-type">
                      Institution Type <span className="required-mark">*</span>
                    </label>
                    <select
                      id="inst-type"
                      className="form-control"
                      value={instForm.institutionType}
                      onChange={(e) => setInstForm({ ...instForm, institutionType: e.target.value })}
                    >
                      <option value="Autonomous Engineering College">Autonomous Engineering College</option>
                      <option value="Affiliated University">Affiliated University</option>
                      <option value="Polytechnic / Technical Institute">Polytechnic / Technical Institute</option>
                      <option value="Research Institution / Other">Research Institution / Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="field-label" htmlFor="inst-email">
                      Official Institution Email Domain <span className="required-mark">*</span>
                    </label>
                    <input
                      id="inst-email"
                      type="email"
                      className={`form-control ${errors.officialEmail ? 'is-invalid' : ''}`}
                      placeholder="e.g. principal@vvce.ac.in"
                      value={instForm.officialEmail}
                      onChange={(e) => setInstForm({ ...instForm, officialEmail: e.target.value })}
                    />
                    {errors.officialEmail && <span className="field-error-text">{errors.officialEmail}</span>}
                  </div>
                </div>

                {/* Location Grid */}
                <div className="form-row form-row-3">
                  <div className="form-group">
                    <label className="field-label" htmlFor="inst-country">Country <span className="required-mark">*</span></label>
                    <input
                      id="inst-country"
                      type="text"
                      className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                      placeholder="e.g. India"
                      value={instForm.country}
                      onChange={(e) => setInstForm({ ...instForm, country: e.target.value })}
                    />
                    {errors.country && <span className="field-error-text">{errors.country}</span>}
                  </div>

                  <div className="form-group">
                    <label className="field-label" htmlFor="inst-state">State / Region <span className="required-mark">*</span></label>
                    <input
                      id="inst-state"
                      type="text"
                      className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                      placeholder="e.g. Karnataka"
                      value={instForm.state}
                      onChange={(e) => setInstForm({ ...instForm, state: e.target.value })}
                    />
                    {errors.state && <span className="field-error-text">{errors.state}</span>}
                  </div>

                  <div className="form-group">
                    <label className="field-label" htmlFor="inst-city">City <span className="required-mark">*</span></label>
                    <input
                      id="inst-city"
                      type="text"
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      placeholder="e.g. Mysuru"
                      value={instForm.city}
                      onChange={(e) => setInstForm({ ...instForm, city: e.target.value })}
                    />
                    {errors.city && <span className="field-error-text">{errors.city}</span>}
                  </div>
                </div>
              </div>

              {/* Primary Contact Person Section */}
              <div className="form-section-card">
                <h4 className="form-section-title">
                  <User size={18} className="text-blue" />
                  <span>2. Primary Contact & Lab Coordinator</span>
                </h4>

                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label className="field-label" htmlFor="contact-name">
                      Contact Person's Full Name <span className="required-mark">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      className={`form-control ${errors.contactName ? 'is-invalid' : ''}`}
                      placeholder="e.g. Dr. B. Sadashive Gowda"
                      value={instForm.contactName}
                      onChange={(e) => setInstForm({ ...instForm, contactName: e.target.value })}
                    />
                    {errors.contactName && <span className="field-error-text">{errors.contactName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="field-label" htmlFor="contact-desig">
                      Designation <span className="required-mark">*</span>
                    </label>
                    <input
                      id="contact-desig"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Principal / Lab Director"
                      value={instForm.contactDesignation}
                      onChange={(e) => setInstForm({ ...instForm, contactDesignation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label className="field-label" htmlFor="contact-email">
                      Contact Email Address <span className="required-mark">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      className={`form-control ${errors.contactEmail ? 'is-invalid' : ''}`}
                      placeholder="e.g. hod.ece@vvce.ac.in"
                      value={instForm.contactEmail}
                      onChange={(e) => setInstForm({ ...instForm, contactEmail: e.target.value })}
                    />
                    {errors.contactEmail && <span className="field-error-text">{errors.contactEmail}</span>}
                  </div>

                  <div className="form-group">
                    <label className="field-label" htmlFor="contact-phone">
                      Contact Phone Number <span className="optional-tag">(Optional)</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      className="form-control"
                      placeholder="e.g. +91 821 249 2221"
                      value={instForm.contactPhone}
                      onChange={(e) => setInstForm({ ...instForm, contactPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Administrator Account Details */}
              <div className="form-section-card">
                <h4 className="form-section-title">
                  <Lock size={18} className="text-emerald" />
                  <span>3. Workspace Administrator Account Password</span>
                </h4>
                <p className="section-instruction-note">
                  The primary contact person will be provisioned as the initial workspace administrator to manage the unique code and faculty access.
                </p>

                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label className="field-label" htmlFor="admin-pw">
                      Admin Account Password <span className="required-mark">*</span>
                    </label>
                    <input
                      id="admin-pw"
                      type="password"
                      className={`form-control ${errors.adminPassword ? 'is-invalid' : ''}`}
                      placeholder="Minimum 6 characters"
                      value={instForm.adminPassword}
                      onChange={(e) => setInstForm({ ...instForm, adminPassword: e.target.value })}
                    />
                    {errors.adminPassword && <span className="field-error-text">{errors.adminPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label className="field-label" htmlFor="admin-pw-confirm">
                      Confirm Password <span className="required-mark">*</span>
                    </label>
                    <input
                      id="admin-pw-confirm"
                      type="password"
                      className={`form-control ${errors.adminConfirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Re-enter password"
                      value={instForm.adminConfirmPassword}
                      onChange={(e) => setInstForm({ ...instForm, adminConfirmPassword: e.target.value })}
                    />
                    {errors.adminConfirmPassword && <span className="field-error-text">{errors.adminConfirmPassword}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-action-row">
                <button
                  type="submit"
                  className="btn btn-indigo"
                  disabled={submitting}
                >
                  <Building2 size={16} />
                  <span>{submitting ? 'Registering Workspace...' : 'Register Institution'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setScreen('hub')}
                >
                  <span>Cancel / Return</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            SCREEN 3: INSTITUTION REGISTRATION RESULT (Demonstration)
           ========================================================================= */}
        {screen === 'institution-result' && (
          <div className="modal-sub-screen">
            <div className="registration-result-box">
              <div className="result-status-pill">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>Demonstration Pre-Registration Recorded • Not Stored in Database</span>
              </div>

              <h4 className="result-institution-title">
                {instForm.officialName || 'Vidyavardhaka College of Engineering'}
              </h4>
              <p className="result-institution-meta">
                {instForm.institutionType} • {instForm.city}, {instForm.state}, {instForm.country}
              </p>

              {/* Sample Assigned Unique Code Card */}
              <div className="institution-code-display-card">
                <div className="code-card-header">
                  <span className="code-card-label">SAMPLE ASSIGNED INSTITUTION CODE (DEMONSTRATION ONLY)</span>
                  <span className="code-format-hint">Format: LSAI-[PREFIX]-[HASH]</span>
                </div>

                <div className="code-box-row">
                  <span className="institution-code-text">{generatedSampleCode}</span>
                  <button
                    type="button"
                    className="btn btn-copy-code"
                    onClick={() => handleCopyCode(generatedSampleCode)}
                    title="Copy sample code"
                  >
                    {copiedCode ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
                    <span>{copiedCode ? 'Copied Sample Code!' : 'Copy Code'}</span>
                  </button>
                </div>

                <p className="code-distribution-instruction">
                  <strong>How this works:</strong> Share this unique code with your department students and faculty instructors. When creating their LabSense AI accounts, entering this code associates them with your institutional workspace.
                </p>
              </div>

              {/* Future Production Requirements Notice */}
              <div className="future-backend-notice-box">
                <h5 className="notice-box-title">
                  <Info size={16} className="text-blue" />
                  <span>Future Production & Database Integration Notice</span>
                </h5>
                <p className="notice-box-desc">
                  In the upcoming backend milestone, institution codes will be generated securely on the server with database uniqueness constraints, verified institutional domain matching, and code revocation/rotation controls. No real database records were created during this frontend demonstration.
                </p>
              </div>

              {/* Next Steps Buttons */}
              <div className="result-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setScreen('institution-admin')}
                >
                  <Building2 size={16} />
                  <span>Preview Institution Administration</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSignupForm({ ...signupForm, institutionCode: generatedSampleCode });
                    setScreen('signup');
                  }}
                >
                  <UserPlus size={16} />
                  <span>Sign Up User with this Code</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setScreen('hub')}
                >
                  <span>Return to Account Access</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 4: INSTITUTION ADMINISTRATOR PREVIEW (Demonstration)
           ========================================================================= */}
        {screen === 'institution-admin' && (
          <div className="modal-sub-screen">
            <div className="screen-nav-bar">
              <button
                type="button"
                className="btn-screen-back"
                onClick={() => setScreen('hub')}
              >
                <ArrowLeft size={16} />
                <span>Back to Account Options</span>
              </button>
              <span className="screen-step-badge">Demonstration Admin Preview</span>
            </div>

            <div className="admin-preview-container">
              {/* Institution Overview Header */}
              <div className="admin-header-card">
                <div className="admin-title-row">
                  <div>
                    <h4 className="admin-inst-name">
                      {instForm.officialName || 'Vidyavardhaka College of Engineering (VVCE)'}
                    </h4>
                    <span className="admin-inst-subtitle">
                      Department of Electronics & Communication Engineering • Mysuru, Karnataka
                    </span>
                  </div>
                  <span className="status-pill status-pill-ready">Demonstration Workspace</span>
                </div>

                {/* Code Panel */}
                <div className="admin-code-panel">
                  <div className="code-meta-col">
                    <span className="panel-col-label">ACTIVE INSTITUTION ACCESS CODE</span>
                    <span className="panel-code-large">{generatedSampleCode}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-copy-code"
                    onClick={() => handleCopyCode(generatedSampleCode)}
                  >
                    {copiedCode ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
                    <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="code-management-actions-row">
                  <button
                    type="button"
                    className="btn-action-ghost"
                    onClick={() => alert('Future backend capability: Server-side code rotation will revoke the old code and generate a new key for term enrollment transitions.')}
                    title="Planned future feature"
                  >
                    <RotateCcw size={14} />
                    <span>Rotate Institution Code (Planned Backend Feature)</span>
                  </button>
                  <button
                    type="button"
                    className="btn-action-ghost text-red"
                    onClick={() => alert('Future backend capability: Immediate access revocation freezes non-authenticated student enrollments.')}
                    title="Planned future feature"
                  >
                    <X size={14} />
                    <span>Revoke Access (Planned Backend Feature)</span>
                  </button>
                </div>
              </div>

              {/* Access Tier Guidelines */}
              <div className="admin-guidelines-grid">
                <div className="guideline-card">
                  <div className="guideline-icon bg-blue">
                    <GraduationCap size={20} className="text-white" />
                  </div>
                  <h5 className="guideline-title">Student Onboarding Protocol</h5>
                  <p className="guideline-desc">
                    Distribute the assigned institution code to lab batches. Students enter this code during account sign-up to unlock your college's circuit experiments and submit physical diagnostic runs.
                  </p>
                </div>

                <div className="guideline-card">
                  <div className="guideline-icon bg-emerald">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <h5 className="guideline-title">Instructor Approval Notice</h5>
                  <p className="guideline-desc">
                    Instructor privileges are never granted solely by entering the code. Faculty sign-ups require institutional administrator confirmation before experiment authoring and gradebook privileges are unlocked.
                  </p>
                </div>
              </div>

              {/* Bottom Navigation Actions */}
              <div className="form-action-row mt-3">
                <button
                  type="button"
                  className="btn btn-indigo"
                  onClick={() => handleQuickEnterRole('institution_admin', 'institution_admin')}
                >
                  <Building2 size={16} />
                  <span>Open Institution Admin Console</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleQuickEnterRole('student', 'student')}
                >
                  <GraduationCap size={16} />
                  <span>Explore Student View</span>
                </button>
                <button
                  type="button"
                  className="btn btn-emerald"
                  onClick={() => handleQuickEnterRole('instructor', 'instructor')}
                >
                  <ShieldCheck size={16} />
                  <span>Explore Instructor View</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setScreen('hub')}
                >
                  <span>Return to Account Hub</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 5: STUDENT AND INSTRUCTOR SIGN UP
           ========================================================================= */}
        {screen === 'signup' && (
          <div className="modal-sub-screen">
            <div className="screen-nav-bar">
              <button
                type="button"
                className="btn-screen-back"
                onClick={() => setScreen('hub')}
              >
                <ArrowLeft size={16} />
                <span>Back to Account Options</span>
              </button>
              <span className="screen-step-badge">New User Registration</span>
            </div>

            {statusMsg && (
              <div className={`modal-alert ${statusMsg.type === 'error' ? 'modal-alert-error' : 'modal-alert-success'}`}>
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Role Selection Tabs */}
            <div className="signup-role-tabs">
              <button
                type="button"
                className={`signup-role-tab ${signupForm.role === 'student' ? 'active-student' : ''}`}
                onClick={() => setSignupForm({ ...signupForm, role: 'student' })}
              >
                <GraduationCap size={18} />
                <span>Sign Up as Student</span>
              </button>
              <button
                type="button"
                className={`signup-role-tab ${signupForm.role === 'instructor' ? 'active-instructor' : ''}`}
                onClick={() => setSignupForm({ ...signupForm, role: 'instructor' })}
              >
                <ShieldCheck size={18} />
                <span>Sign Up as Instructor</span>
              </button>
            </div>

            {/* Role-Specific Explanation Banner */}
            <div className={`role-notice-banner ${signupForm.role === 'instructor' ? 'notice-instructor' : 'notice-student'}`}>
              <Info size={17} className="shrink-0" />
              <span>
                {signupForm.role === 'student' ? (
                  <>
                    <strong>Student Access:</strong> Your account will be associated with your college workspace. You can explore lab experiments, troubleshoot circuit faults, and track curriculum milestones.
                  </>
                ) : (
                  <>
                    <strong>Instructor Access & Approval Notice:</strong> In production, instructor accounts require administrator verification or institutional credential review before experiment authoring is enabled. (Never granted solely on selected role or code).
                  </>
                )}
              </span>
            </div>

            <form onSubmit={handleUserSignUp} className="user-auth-form">
              <div className="form-group">
                <label className="field-label" htmlFor="user-fullname">
                  Full Name <span className="required-mark">*</span>
                </label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    id="user-fullname"
                    type="text"
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    placeholder="e.g. Maya Patel"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                  />
                </div>
                {errors.fullName && <span className="field-error-text">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="user-email">
                  Email Address <span className="required-mark">*</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="user-email"
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="e.g. maya@vvce.ac.in"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </div>
                {errors.email && <span className="field-error-text">{errors.email}</span>}
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="field-label" htmlFor="user-pw">
                    Password <span className="required-mark">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="user-pw"
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Minimum 6 characters"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    />
                  </div>
                  {errors.password && <span className="field-error-text">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="user-pw-confirm">
                    Confirm Password <span className="required-mark">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="user-pw-confirm"
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Re-enter password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    />
                  </div>
                  {errors.confirmPassword && <span className="field-error-text">{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* Institution Code Field with Guidance */}
              <div className="form-group institution-code-group">
                <div className="field-label-group">
                  <label className="field-label" htmlFor="user-inst-code">
                    Institution Code <span className="required-mark">*</span>
                  </label>
                  <button
                    type="button"
                    className="btn-field-help"
                    onClick={() => setScreen('register-institution')}
                  >
                    <HelpCircle size={14} />
                    <span>Need to register your institution?</span>
                  </button>
                </div>

                <div className="input-with-icon">
                  <Building2 size={18} className="input-icon" />
                  <input
                    id="user-inst-code"
                    type="text"
                    className={`form-control code-input-mono ${errors.institutionCode ? 'is-invalid' : ''}`}
                    placeholder="e.g. LSAI-VVCE-A7K2"
                    value={signupForm.institutionCode}
                    onChange={(e) => setSignupForm({ ...signupForm, institutionCode: e.target.value.toUpperCase() })}
                  />
                </div>
                <span className="field-sub-instruction">
                  Enter the institution code provided by your college to join its LabSense AI workspace.
                </span>
                {errors.institutionCode && <span className="field-error-text">{errors.institutionCode}</span>}
              </div>

              {/* Optional Student / Staff ID */}
              <div className="form-group">
                <label className="field-label" htmlFor="user-roll">
                  {signupForm.role === 'student' ? 'Student USN / Roll Number' : 'Faculty / Staff ID'} <span className="optional-tag">(Optional)</span>
                </label>
                <input
                  id="user-roll"
                  type="text"
                  className="form-control"
                  placeholder={signupForm.role === 'student' ? 'e.g. 4VV21EC042' : 'e.g. FAC-ECE-108'}
                  value={signupForm.idNumber}
                  onChange={(e) => setSignupForm({ ...signupForm, idNumber: e.target.value })}
                />
              </div>

              <div className="form-action-row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  <UserPlus size={16} />
                  <span>{submitting ? 'Creating Account...' : `Sign Up as ${signupForm.role === 'student' ? 'Student' : 'Instructor'}`}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setScreen('login')}
                >
                  <span>Already have an account? Log In</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            SCREEN 6: EXISTING USER LOGIN
           ========================================================================= */}
        {screen === 'login' && (
          <div className="modal-sub-screen">
            <div className="screen-nav-bar">
              <button
                type="button"
                className="btn-screen-back"
                onClick={() => setScreen('hub')}
              >
                <ArrowLeft size={16} />
                <span>Back to Account Options</span>
              </button>
              <span className="screen-step-badge">Existing Account Access</span>
            </div>

            {statusMsg && (
              <div className={`modal-alert ${statusMsg.type === 'error' ? 'modal-alert-error' : 'modal-alert-success'}`}>
                <span>{statusMsg.text}</span>
              </div>
            )}

            {forgotPasswordMsg && (
              <div className="modal-alert modal-alert-info">
                <span>
                  <strong>Password Recovery in Demonstration Mode:</strong> Password reset requests will be delivered via verified institutional email once backend Supabase Auth is enabled. For immediate testing, use the demonstration personas below.
                </span>
              </div>
            )}

            <form onSubmit={handleUserLogin} className="user-auth-form">
              <div className="form-group">
                <label className="field-label" htmlFor="login-email">
                  Email Address <span className="required-mark">*</span>
                </label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="e.g. alex.student@labsense.edu or dr.sharma@labsense.edu"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>
                {errors.email && <span className="field-error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <div className="field-label-group">
                  <label className="field-label" htmlFor="login-pw">
                    Password <span className="required-mark">*</span>
                  </label>
                  <button
                    type="button"
                    className="btn-field-help"
                    onClick={() => setForgotPasswordMsg(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="login-pw"
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>
                {errors.password && <span className="field-error-text">{errors.password}</span>}
              </div>

              <span className="existing-user-note">
                Existing users do not need to re-enter their institution code on every login.
              </span>

              <div className="form-action-row">
                <button
                  type="submit"
                  className="btn btn-emerald"
                  disabled={submitting}
                >
                  <LogIn size={16} />
                  <span>{submitting ? 'Authenticating...' : 'Log In'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setScreen('signup')}
                >
                  <span>New user? Sign Up</span>
                </button>
              </div>

              {/* Instant Evaluation Shortcuts for all 4 roles */}
              <div className="login-quick-eval-box">
                <span className="quick-eval-header">Quick Evaluation Personas:</span>
                <div className="quick-eval-grid">
                  <button
                    type="button"
                    className="btn-eval-shortcut"
                    onClick={() => handleQuickEnterRole('student', 'student')}
                  >
                    <GraduationCap size={16} className="text-blue" />
                    <div className="eval-shortcut-text">
                      <span className="eval-name">Alex Morgan</span>
                      <span className="eval-role">Student • 3rd Year ECE, VVCE</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-eval-shortcut"
                    onClick={() => handleQuickEnterRole('instructor', 'instructor')}
                  >
                    <ShieldCheck size={16} className="text-emerald" />
                    <div className="eval-shortcut-text">
                      <span className="eval-name">Dr. K. S. Sharma</span>
                      <span className="eval-role">Instructor • ECE Lab Coordinator</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-eval-shortcut"
                    onClick={() => handleQuickEnterRole('institution_admin', 'institution_admin')}
                  >
                    <Building2 size={16} className="text-indigo" />
                    <div className="eval-shortcut-text">
                      <span className="eval-name">Prof. B. S. Gowda</span>
                      <span className="eval-role">Institution Admin • VVCE Principal</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-eval-shortcut"
                    onClick={() => handleQuickEnterRole('platform_super_admin', 'super_admin')}
                  >
                    <ShieldAlert size={16} className="text-amber" />
                    <div className="eval-shortcut-text">
                      <span className="eval-name">Sarah Jenkins</span>
                      <span className="eval-role">Super Admin • Platform Operations</span>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
