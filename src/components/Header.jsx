import React, { useState } from 'react';
import {
  Cpu,
  Menu,
  X,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  User,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Header({ currentView, onViewChange, onOpenGemmaArchitecture }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState('home');
  const { profile, role, isInstructor } = useAuth();

  const handleNavClick = (viewId, scrollTarget = null, targetKey = null) => {
    setActiveTarget(targetKey || viewId);
    onViewChange(viewId);
    setMobileMenuOpen(false);

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

          {/* Right: One Clear Login / Profile Action */}
          <div className="header-actions">
            <button
              type="button"
              className="btn-header-profile"
              onClick={() => setAuthModalOpen(true)}
              title={`Signed in as ${profile?.full_name || 'User'} (${role}). Click to switch role or explore portals.`}
            >
              <div className={`avatar-pill ${isInstructor ? 'avatar-instructor' : 'avatar-student'}`}>
                {isInstructor ? <ShieldCheck size={16} /> : <GraduationCap size={16} />}
              </div>
              <div className="profile-text-group">
                <span className="profile-name">
                  {profile?.full_name ? profile.full_name.split(' ')[0] : 'Role Access'}
                </span>
                <span className="profile-role-sub">
                  {isInstructor ? 'Instructor' : 'Student'}
                </span>
              </div>
              <ChevronDown size={14} className="profile-chevron" />
            </button>

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

              <div className="mobile-auth-section">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }}
                >
                  <User size={16} />
                  <span>Switch Role / Portal Access</span>
                </button>
              </div>
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
    </>
  );
}
