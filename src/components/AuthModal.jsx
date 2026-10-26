import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Mail,
  Lock,
  User,
  Info,
  LogOut
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

  const [showManualForm, setShowManualForm] = useState(false);
  const [formMode, setFormMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [formMsg, setFormMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectStudent = () => {
    switchDemoRole('student');
    if (onSelectPortal) {
      onSelectPortal('student');
    }
    onClose();
  };

  const handleSelectInstructor = () => {
    switchDemoRole('instructor');
    if (onSelectPortal) {
      onSelectPortal('instructor');
    }
    onClose();
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setFormMsg(null);
    setSubmitting(true);

    try {
      if (formMode === 'signin') {
        const res = await signIn(email, password);
        if (res.success) {
          setFormMsg({ type: 'success', text: 'Simulated sign in successful! Session activated.' });
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setFormMsg({ type: 'error', text: res.error || 'Sign in failed.' });
        }
      } else {
        const res = await signUp(email, password, fullName);
        if (res.success) {
          setFormMsg({ type: 'success', text: 'Student demo account created and activated!' });
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setFormMsg({ type: 'error', text: res.error || 'Registration failed.' });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-window modal-window-lg role-selection-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Sparkles size={24} className="text-blue" />
            </div>
            <div>
              <h3 className="modal-title">LabSense AI — Role Selection</h3>
              <p className="modal-subtitle">
                Explore the platform through distinct student and instructor experiences
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

        {/* Demo Mode Notice Banner */}
        <div className="demo-mode-banner">
          <Info size={18} className="text-blue shrink-0" />
          <div className="demo-mode-text">
            <strong>Frontend Demonstration Access:</strong>
            <span>
              Real Supabase Auth and PostgreSQL database migrations are configured for the upcoming backend milestone. Select a demo persona below to explore each portal interface and evaluate features.
            </span>
          </div>
        </div>

        <div className="role-selection-body">
          {/* Main 2-Card Selection */}
          <div className="role-cards-grid">
            {/* Card 1: Student Access */}
            <div className={`role-card role-card-student ${role === 'student' ? 'role-card-active' : ''}`}>
              <div className="role-card-top">
                <div className="role-icon-box bg-blue">
                  <GraduationCap size={28} className="text-white" />
                </div>
                <div className="role-card-header-text">
                  <div className="role-title-row">
                    <h4 className="role-card-title">Student Access</h4>
                    {role === 'student' && (
                      <span className="active-pill">Current Role</span>
                    )}
                  </div>
                  <span className="demo-persona-tag">Demo: Alex Morgan (3rd Year ECE)</span>
                </div>
              </div>

              <p className="role-card-description">
                Troubleshoot circuits, explore experiments, run simulations, and take assessments.
              </p>

              <ul className="role-features-list">
                <li>
                  <CheckCircle2 size={16} className="text-blue" />
                  <span>AI-assisted circuit fault troubleshooting with Gemma 4</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="text-blue" />
                  <span>Curated laboratory experiments with step-by-step procedures</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="text-blue" />
                  <span>5 interactive circuit simulations with real-time calculations</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="text-blue" />
                  <span>Self-paced practical assessments with instant grading</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="text-blue" />
                  <span>Direct question tickets to faculty lab instructors</span>
                </li>
              </ul>

              <button
                type="button"
                className="btn btn-primary btn-block role-action-btn"
                onClick={handleSelectStudent}
              >
                <span>Enter as Student (Alex Morgan)</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Card 2: Instructor Access */}
            <div className={`role-card role-card-instructor ${role === 'instructor' ? 'role-card-active' : ''}`}>
              <div className="role-card-top">
                <div className="role-icon-box bg-emerald">
                  <ShieldCheck size={28} className="text-white" />
                </div>
                <div className="role-card-header-text">
                  <div className="role-title-row">
                    <h4 className="role-card-title">Instructor Access</h4>
                    {role === 'instructor' && (
                      <span className="active-pill pill-emerald">Current Role</span>
                    )}
                  </div>
                  <span className="demo-persona-tag">Demo: Dr. K. S. Sharma (Lab Coordinator)</span>
                </div>
              </div>

              <p className="role-card-description">
                Design experiments, answer student questions, and create assessments.
              </p>

              <ul className="role-features-list">
                <li>
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Design and publish structured laboratory experiments</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Manage student troubleshooting questions with AI reply co-pilot</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Create objective tests and automated grading rubrics</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Inspect cohort completion metrics and student diagnostic runs</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Preview and validate physics circuit simulations</span>
                </li>
              </ul>

              <button
                type="button"
                className="btn btn-emerald btn-block role-action-btn"
                onClick={handleSelectInstructor}
              >
                <span>Enter as Instructor (Dr. Sharma)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Active Session & Manual Sign-in Toggle */}
          <div className="modal-footer-section">
            <div className="active-session-indicator">
              <span>Active Demo Session: <strong>{profile?.full_name}</strong> ({role.toUpperCase()})</span>
            </div>

            <button
              type="button"
              className="btn-toggle-manual"
              onClick={() => setShowManualForm(!showManualForm)}
            >
              {showManualForm ? 'Hide Credential Form' : 'Simulated Email Sign-In / Register'}
            </button>
          </div>

          {/* Optional Manual Credential Form for Evaluation */}
          {showManualForm && (
            <div className="manual-auth-drawer">
              <div className="modal-tabs">
                <button
                  type="button"
                  className={`modal-tab ${formMode === 'signin' ? 'active' : ''}`}
                  onClick={() => { setFormMode('signin'); setFormMsg(null); }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`modal-tab ${formMode === 'signup' ? 'active' : ''}`}
                  onClick={() => { setFormMode('signup'); setFormMsg(null); }}
                >
                  Register New Student
                </button>
              </div>

              {formMsg && (
                <div className={`modal-alert ${formMsg.type === 'error' ? 'modal-alert-error' : 'modal-alert-success'}`}>
                  <span>{formMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleManualSubmit} className="modal-form">
                {formMode === 'signup' && (
                  <div className="form-group">
                    <label className="field-label" htmlFor="manual-name">Full Name</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input
                        id="manual-name"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Maya Patel"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="field-label" htmlFor="manual-email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="manual-email"
                      type="email"
                      className="form-control"
                      placeholder="e.g. student@labsense.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="manual-password">Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="manual-password"
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={submitting}
                >
                  {submitting ? 'Authenticating...' : formMode === 'signin' ? 'Simulate Sign In' : 'Create Demo Account'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
