import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu,
  Menu,
  X,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  Building2,
  User,
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  Mail,
  BookOpen,
  Info,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Header({ currentView, onViewChange, onOpenGemmaArchitecture }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTarget, setActiveTarget] = useState('home');

  const dropdownRef = useRef(null);
  const { profile, role, isAuthenticated, logout } = useAuth();

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (viewId, scrollTarget = null, targetKey = null) => {
    setActiveTarget(targetKey || viewId);
    onViewChange(viewId);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);

    if (scrollTarget) {
      setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectPortalFromModal = (portalId) => {
    onViewChange(portalId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToDashboard = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    const targetPortal =
      role === 'platform_super_admin' ? 'super_admin' :
      role === 'institution_admin' ? 'institution_admin' :
      role === 'instructor' ? 'instructor' : 'student';
    onViewChange(targetPortal);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    onViewChange('workbench');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          {/* Left: Brand Logo & Name */}
          <button
            type="button"
            className="brand-logo"
            onClick={() => handleNavClick('workbench', null, 'home')}
            aria-label="LabSense AI Home"
          >
            <div className="logo-icon-wrapper">
              <Cpu className="logo-icon" size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-name">LabSense<span className="brand-accent"> AI</span></span>
              <span className="brand-tagline">Multimodal Lab Platform</span>
            </div>
          </button>

          {/* Centre: Desktop Navigation Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-link ${currentView === 'workbench' && activeTarget === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick('workbench', null, 'home')}
            >
              Home
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'workbench' && activeTarget === 'bench' ? 'active' : ''}`}
              onClick={() => handleNavClick('workbench', 'workspace', 'bench')}
            >
              Diagnostic Bench
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'student' ? 'active' : ''}`}
              onClick={() => handleNavClick('student', null, 'experiments')}
            >
              Experiments
            </button>
            <button
              type="button"
              className={`nav-link ${currentView === 'simulations' ? 'active' : ''}`}
              onClick={() => handleNavClick('simulations', null, 'simulations')}
            >
              Simulations
            </button>
            <button
              type="button"
              className="nav-link nav-link-special"
              onClick={onOpenGemmaArchitecture}
              title="Inspect Gemma 4 AI Architecture"
            >
              <Sparkles size={16} />
              <span>How It Works</span>
            </button>
          </nav>

          {/* Right: Account Access / Authenticated User Profile */}
          <div className="header-actions">
            {!isAuthenticated ? (
              /* Logged-Out State: Exact "Log In / Sign Up" button */
              <button
                type="button"
                className="btn-header-auth"
                onClick={() => setAuthModalOpen(true)}
                aria-label="Open Account Access, Sign Up, or Log In"
              >
                <User size={16} className="auth-btn-icon" />
                <span>Log In / Sign Up</span>
              </button>
            ) : (
              /* Logged-In State: User Profile Button with Role Icon, Name, Badge & Dropdown Arrow */
              <div className="header-profile-menu-container" ref={dropdownRef}>
                <button
                  type="button"
                  className={`btn-header-profile ${profileDropdownOpen ? 'active' : ''}`}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  aria-label={`User Profile menu for ${profile?.full_name || 'User'}`}
                >
                  {/* Role-Specific Icon */}
                  <span className={`profile-btn-icon-box icon-${role}`}>
                    {role === 'platform_super_admin' ? (
                      <ShieldAlert size={16} className="role-icon-superadmin" />
                    ) : role === 'institution_admin' ? (
                      <Building2 size={16} className="role-icon-admin" />
                    ) : role === 'instructor' ? (
                      <ShieldCheck size={16} className="role-icon-instructor" />
                    ) : (
                      <GraduationCap size={16} className="role-icon-student" />
                    )}
                  </span>

                  {/* User's Name */}
                  <span className="profile-btn-name">{profile?.full_name}</span>

                  {/* Role-Specific Badge */}
                  <span className={`header-badge header-badge-${role}`}>
                    {role === 'platform_super_admin' ? 'Super Admin' :
                     role === 'institution_admin' ? 'Institution Admin' :
                     role === 'instructor' ? 'Instructor' : 'Student'}
                  </span>

                  {/* Dropdown Arrow */}
                  <ChevronDown
                    size={15}
                    className={`header-profile-arrow ${profileDropdownOpen ? 'open' : ''}`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="header-profile-dropdown" role="menu">
                    <div className="dropdown-user-header">
                      <div className={`dropdown-user-avatar avatar-${role}`}>
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
                      <div className="dropdown-user-meta">
                        <span className="dropdown-user-name">{profile?.full_name}</span>
                        <span className="dropdown-user-email">{profile?.email}</span>
                        <span className={`dropdown-role-pill pill-${role}`}>
                          {role === 'platform_super_admin' ? 'Platform Super Admin' :
                           role === 'institution_admin' ? 'Institution Admin' :
                           role === 'instructor' ? 'Faculty Instructor' : 'Student'}
                        </span>
                      </div>
                    </div>

                    {/* Prominent College Display (Required for Institution Admin) */}
                    {(profile?.institution || role === 'institution_admin') && (
                      <div className="dropdown-institution-row">
                        <Building2 size={14} className="text-indigo shrink-0" />
                        <div className="dropdown-inst-text">
                          <span className="dropdown-inst-label">COLLEGE / INSTITUTION</span>
                          <span className="dropdown-inst-name">
                            {profile?.institution || 'Vidyavardhaka College of Engineering'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="dropdown-menu-list">
                      <button
                        type="button"
                        className="dropdown-menu-item"
                        role="menuitem"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setShowProfileModal(true);
                        }}
                      >
                        <User size={16} className="item-icon" />
                        <span>My Profile</span>
                      </button>

                      <button
                        type="button"
                        className="dropdown-menu-item"
                        role="menuitem"
                        onClick={handleGoToDashboard}
                      >
                        <LayoutDashboard size={16} className="item-icon" />
                        <span>My Dashboard</span>
                      </button>

                      <button
                        type="button"
                        className="dropdown-menu-item"
                        role="menuitem"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setShowSettingsModal(true);
                        }}
                      >
                        <Settings size={16} className="item-icon" />
                        <span>Account Settings</span>
                      </button>

                      <div className="dropdown-menu-divider" />

                      <button
                        type="button"
                        className="dropdown-menu-item dropdown-item-logout"
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} className="item-icon" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
            <nav className="mobile-nav">
              <button
                type="button"
                className={`mobile-nav-link ${currentView === 'workbench' && activeTarget === 'home' ? 'active' : ''}`}
                onClick={() => handleNavClick('workbench', null, 'home')}
              >
                Home
              </button>
              <button
                type="button"
                className={`mobile-nav-link ${currentView === 'workbench' && activeTarget === 'bench' ? 'active' : ''}`}
                onClick={() => handleNavClick('workbench', 'workspace', 'bench')}
              >
                Diagnostic Bench
              </button>
              <button
                type="button"
                className={`mobile-nav-link ${currentView === 'student' ? 'active' : ''}`}
                onClick={() => handleNavClick('student', null, 'experiments')}
              >
                Experiments
              </button>
              <button
                type="button"
                className={`mobile-nav-link ${currentView === 'simulations' ? 'active' : ''}`}
                onClick={() => handleNavClick('simulations', null, 'simulations')}
              >
                Simulations
              </button>
              <button
                type="button"
                className="mobile-nav-link mobile-nav-link-special"
                onClick={() => { setMobileMenuOpen(false); onOpenGemmaArchitecture(); }}
              >
                <Sparkles size={16} />
                <span>How It Works</span>
              </button>

              {/* Mobile Auth / Profile Section */}
              {!isAuthenticated ? (
                <div className="mobile-auth-section">
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }}
                  >
                    <User size={16} />
                    <span>Log In / Sign Up</span>
                  </button>
                </div>
              ) : (
                <div className="mobile-profile-card">
                  <div className="mobile-profile-header">
                    <div className={`mobile-avatar-box avatar-${role}`}>
                      {role === 'platform_super_admin' ? (
                        <ShieldAlert size={20} className="text-amber" />
                      ) : role === 'institution_admin' ? (
                        <Building2 size={20} className="text-indigo" />
                      ) : role === 'instructor' ? (
                        <ShieldCheck size={20} className="text-emerald" />
                      ) : (
                        <GraduationCap size={20} className="text-blue" />
                      )}
                    </div>
                    <div className="mobile-profile-info">
                      <span className="mobile-name">{profile?.full_name}</span>
                      <span className={`header-badge header-badge-${role}`}>
                        {role === 'platform_super_admin' ? 'Super Admin' :
                         role === 'institution_admin' ? 'Institution Admin' :
                         role === 'instructor' ? 'Instructor' : 'Student'}
                      </span>
                      {(profile?.institution || role === 'institution_admin') && (
                        <span className="mobile-inst">
                          {profile?.institution || 'Vidyavardhaka College of Engineering'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mobile-profile-actions">
                    <button
                      type="button"
                      className="mobile-profile-action-btn"
                      onClick={handleGoToDashboard}
                    >
                      <LayoutDashboard size={15} />
                      <span>My Dashboard</span>
                    </button>
                    <button
                      type="button"
                      className="mobile-profile-action-btn"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowProfileModal(true);
                      }}
                    >
                      <User size={15} />
                      <span>My Profile</span>
                    </button>
                    <button
                      type="button"
                      className="mobile-profile-action-btn mobile-logout-btn"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Role Selection & Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSelectPortal={handleSelectPortalFromModal}
      />

      {/* My Profile Modal Dialog */}
      {showProfileModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-window modal-window-md">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <User size={20} className="text-blue" />
                </div>
                <div>
                  <h3 className="modal-title">My Account Profile</h3>
                  <p className="modal-subtitle">Verified institutional account credentials and permissions</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="profile-modal-body">
              <div className="profile-overview-card">
                <div className={`profile-big-avatar avatar-${role}`}>
                  {role === 'platform_super_admin' ? (
                    <ShieldAlert size={32} className="text-amber" />
                  ) : role === 'institution_admin' ? (
                    <Building2 size={32} className="text-indigo" />
                  ) : role === 'instructor' ? (
                    <ShieldCheck size={32} className="text-emerald" />
                  ) : (
                    <GraduationCap size={32} className="text-blue" />
                  )}
                </div>
                <div>
                  <h4 className="profile-big-name">{profile?.full_name}</h4>
                  <span className="profile-big-email">{profile?.email}</span>
                  <div className="profile-tags-row mt-1">
                    <span className={`header-badge header-badge-${role}`}>
                      {role === 'platform_super_admin' ? 'Platform Super Admin' :
                       role === 'institution_admin' ? 'Institution Admin' :
                       role === 'instructor' ? 'Certified Instructor' : 'Enrolled Student'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="detail-item">
                  <span className="detail-label">INSTITUTION</span>
                  <span className="detail-value">{profile?.institution || 'Vidyavardhaka College of Engineering'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">INSTITUTION CODE</span>
                  <span className="detail-value font-mono">{profile?.institution_code || 'LSAI-VVCE-A7K2'}</span>
                </div>

                {role === 'student' && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">STUDENT USN</span>
                      <span className="detail-value font-mono">{profile?.usn || '4VV21EC042'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">SEMESTER</span>
                      <span className="detail-value">{profile?.semester || '6th Semester'}</span>
                    </div>
                  </>
                )}

                {role === 'instructor' && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">STAFF ID</span>
                      <span className="detail-value font-mono">{profile?.staff_id || 'VVCE-FAC-ECE-108'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">DESIGNATION</span>
                      <span className="detail-value">{profile?.designation || 'Associate Professor & Lab Coordinator'}</span>
                    </div>
                  </>
                )}

                {role === 'institution_admin' && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">ADMINISTRATIVE TITLE</span>
                      <span className="detail-value">{profile?.designation || 'Principal & Institutional Admin'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">COLLEGE SCOPE</span>
                      <span className="detail-value">Vidyavardhaka College of Engineering (VVCE)</span>
                    </div>
                  </>
                )}

                {role === 'platform_super_admin' && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">GOVERNANCE LEVEL</span>
                      <span className="detail-value">Root Platform Administrator</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">PLATFORM JURISDICTION</span>
                      <span className="detail-value">Global Multi-College Scope</span>
                    </div>
                  </>
                )}
              </div>

              <div className="profile-security-notice">
                <Info size={16} className="text-blue shrink-0" />
                <p>
                  Role permissions and institutional affiliations are securely managed by backend database access policies. Client-side modifications cannot elevate access privileges.
                </p>
              </div>

              <div className="modal-actions-right mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowProfileModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowProfileModal(false);
                    handleGoToDashboard();
                  }}
                >
                  <LayoutDashboard size={15} />
                  <span>Open My Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings Modal Dialog */}
      {showSettingsModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-window modal-window-md">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <Settings size={20} className="text-cyan" />
                </div>
                <div>
                  <h3 className="modal-title">Account Settings</h3>
                  <p className="modal-subtitle">Preferences and session security settings</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowSettingsModal(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="settings-modal-body">
              <div className="settings-section">
                <h5 className="settings-section-title">Interface Preferences</h5>
                <div className="settings-option-row">
                  <div>
                    <strong>Color Theme</strong>
                    <p className="text-muted text-sm">LabSense AI Dark Navy & High-Contrast Cyan</p>
                  </div>
                  <span className="status-pill status-pill-ready">Active</span>
                </div>
              </div>

              <div className="settings-section mt-3">
                <h5 className="settings-section-title">Session & Security</h5>
                <div className="settings-option-row">
                  <div>
                    <strong>Authentication Engine</strong>
                    <p className="text-muted text-sm">Local Demonstration Mode (Offline / Sandbox)</p>
                  </div>
                  <span className="status-pill status-pill-ready">Active Session</span>
                </div>

                <div className="settings-option-row mt-2">
                  <div>
                    <strong>Password Management</strong>
                    <p className="text-muted text-sm">Institutional single sign-on / magic link password recovery</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => alert('Demonstration note: In production with Supabase Auth enabled, password reset links will be delivered to your official email.')}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="modal-actions-right mt-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSettingsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
