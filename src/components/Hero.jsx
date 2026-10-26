import React from 'react';
import { ArrowRight, HelpCircle, Activity, Zap, CheckCircle2, ShieldCheck, Sliders, GraduationCap } from 'lucide-react';

export default function Hero({
  onExploreTroubleshoot,
  onExploreExperiments,
  onOpenSimulations,
  onOpenHowItWorks
}) {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-indicator"></span>
            <span>Hacktoberfest VVCE Mysuru • Gemma 4 Track</span>
          </div>

          <h1 className="hero-title">
            Debug Your Circuits. <br />
            <span className="hero-title-highlight">Understand Every Fault.</span>
          </h1>

          <p className="hero-description">
            An AI-powered laboratory learning platform that helps engineering students investigate circuit faults, understand experimental results, and learn systematic troubleshooting.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onExploreTroubleshoot}
            >
              <span>Start Troubleshooting</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onExploreExperiments}
            >
              <GraduationCap size={18} />
              <span>Explore Experiments</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenSimulations}
            >
              <Sliders size={18} />
              <span>Simulations</span>
            </button>
            {onOpenHowItWorks && (
              <button
                type="button"
                className="btn btn-text-hero"
                onClick={onOpenHowItWorks}
              >
                <HelpCircle size={17} />
                <span>How It Works</span>
              </button>
            )}
          </div>
        </div>

        {/* Technical Circuit & Bench Illustration */}
        <div className="hero-illustration-wrapper" aria-hidden="true">
          <div className="circuit-card">
            <div className="circuit-card-header">
              <div className="circuit-status-pill">
                <span className="dot dot-live"></span>
                <span>Active Workbench Simulation</span>
              </div>
              <span className="circuit-code">EXP-01 // LED-RESISTOR</span>
            </div>

            <div className="circuit-diagram">
              {/* Circuit Schematic Graphic */}
              <svg className="schematic-svg" viewBox="0 0 360 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="benchGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="360" height="200" fill="url(#benchGrid)" />

                {/* Circuit Traces */}
                <path d="M 40 40 L 130 40" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="130" y="32" width="60" height="16" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="145" y1="32" x2="145" y2="48" stroke="#f59e0b" strokeWidth="2" />
                <line x1="155" y1="32" x2="155" y2="48" stroke="#ef4444" strokeWidth="2" />
                <line x1="165" y1="32" x2="165" y2="48" stroke="#10b981" strokeWidth="2" />
                <line x1="175" y1="32" x2="175" y2="48" stroke="#f59e0b" strokeWidth="2" />

                <path d="M 190 40 L 260 40 L 260 90" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

                {/* LED Symbol */}
                <polygon points="250,90 270,90 260,110" fill="#38bdf8" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="250" y1="110" x2="270" y2="110" stroke="#38bdf8" strokeWidth="2" />
                <path d="M 272 96 L 282 90" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 275 104 L 285 98" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />

                <path d="M 260 110 L 260 160 L 40 160 L 40 40" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />

                <circle cx="40" cy="100" r="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                <text x="35" y="96" fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="monospace">+</text>
                <text x="36" y="112" fill="#64748b" fontSize="11" fontWeight="700" fontFamily="monospace">-</text>

                <circle cx="130" cy="40" r="4" fill="#38bdf8" />
                <circle cx="190" cy="40" r="4" fill="#f43f5e" />
                <circle cx="260" cy="40" r="4" fill="#38bdf8" />
                <circle cx="260" cy="110" r="4" fill="#10b981" />

                <g transform="translate(195, 20)">
                  <rect width="72" height="22" rx="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
                  <text x="6" y="15" fill="#c7d2fe" fontSize="11" fontFamily="monospace">TP1: 1.84V</text>
                </g>

                <g transform="translate(70, 75)">
                  <rect width="76" height="22" rx="4" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
                  <text x="6" y="15" fill="#a7f3d0" fontSize="11" fontFamily="monospace">Vcc: 5.00V</text>
                </g>
              </svg>
            </div>

            {/* Circuit Telemetry Pill Cards */}
            <div className="telemetry-grid">
              <div className="telemetry-chip">
                <span className="telemetry-label">SUPPLY VOLTAGE</span>
                <span className="telemetry-value">5.0 V DC</span>
              </div>
              <div className="telemetry-chip">
                <span className="telemetry-label">MEASURED CURRENT</span>
                <span className="telemetry-value text-amber">18.4 mA</span>
              </div>
              <div className="telemetry-chip">
                <span className="telemetry-label">FORWARD DROP</span>
                <span className="telemetry-value">2.1 V</span>
              </div>
            </div>

            <div className="bench-inspection-note">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>Visual verification: Polarity correct, 220Ω series resistor validated</span>
            </div>
          </div>
        </div>

        {/* Safety and Platform Highlights Row */}
        <div className="hero-highlights-row">
          <div className="highlight-item">
            <ShieldCheck size={18} className="highlight-icon text-green" />
            <span>Hardware Safety First</span>
          </div>
          <div className="highlight-item">
            <Zap size={18} className="highlight-icon text-amber" />
            <span>Low-Voltage Bench Focus</span>
          </div>
          <div className="highlight-item">
            <Activity size={18} className="highlight-icon text-blue" />
            <span>Gemma 4 Multimodal Analysis</span>
          </div>
        </div>
      </div>
    </section>
  );
}
