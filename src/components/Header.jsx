import React, { useState } from 'react';
import { Cpu, Menu, X, Sparkles } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <a 
          href="#hero" 
          className="brand-logo"
          onClick={(e) => scrollToSection(e, 'hero')}
          aria-label="LabSense AI Home"
        >
          <div className="logo-icon-wrapper">
            <Cpu className="logo-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-name">LabSense<span className="brand-accent"> AI</span></span>
            <span className="brand-tagline">Gemma-Powered Lab Assistant</span>
          </div>
        </a>

        <div className="header-badge" title="Gemma 4 integration planned for Milestone 2">
          <Sparkles size={14} className="badge-sparkle" />
          <span>Gemma 4 Challenge Prototype</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <a 
            href="#hero" 
            className="nav-link"
            onClick={(e) => scrollToSection(e, 'hero')}
          >
            Home
          </a>
          <a 
            href="#workspace" 
            className="nav-link"
            onClick={(e) => scrollToSection(e, 'workspace')}
          >
            Troubleshoot
          </a>
          <a 
            href="#how-it-works" 
            className="nav-link"
            onClick={(e) => scrollToSection(e, 'how-it-works')}
          >
            How It Works
          </a>
        </nav>

        {/* Mobile menu button */}
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

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
          <nav className="mobile-nav">
            <a 
              href="#hero" 
              className="mobile-nav-link"
              onClick={(e) => scrollToSection(e, 'hero')}
            >
              Home
            </a>
            <a 
              href="#workspace" 
              className="mobile-nav-link"
              onClick={(e) => scrollToSection(e, 'workspace')}
            >
              Troubleshoot
            </a>
            <a 
              href="#how-it-works" 
              className="mobile-nav-link"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
            >
              How It Works
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
