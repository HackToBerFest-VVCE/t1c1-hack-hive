import React from 'react';
import { Cpu, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer({ onOpenGemmaArchitecture }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <Cpu size={22} className="footer-logo-icon" />
              <span className="footer-brand-name">LabSense AI</span>
            </div>
            <p className="footer-description">
              Multimodal electronics laboratory platform powered by Gemma 4. Helping engineering students understand circuits, troubleshoot faults, practice interactive simulations, and learn safely.
            </p>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Platform Features</h4>
            <ul className="footer-links">
              <li><span>Multimodal Circuit Diagnosis</span></li>
              <li><span>Student & Instructor Portals</span></li>
              <li><span>5 Educational Circuit Simulations</span></li>
              <li><span>Deterministic Assessment Grading</span></li>
              <li><span>Supabase Auth & Database Security</span></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Challenge Details</h4>
            <ul className="footer-links">
              <li><span><strong>Event:</strong> Hacktoberfest — VVCE Mysuru</span></li>
              <li><span><strong>Track:</strong> Best Use of Gemma 4</span></li>
              <li><span><strong>Model Target:</strong> gemma-4-31b-it</span></li>
              <li>
                <button
                  type="button"
                  className="btn-footer-link"
                  onClick={onOpenGemmaArchitecture}
                >
                  <Sparkles size={14} className="text-blue" />
                  <span>How We Use Gemma 4</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-disclaimer">
            <ShieldCheck size={16} className="disclaimer-icon" />
            <span>
              <strong>Laboratory Safety Notice:</strong> LabSense AI assists student learning and fault isolation. Always observe electronics laboratory safety protocols, power supply current compliance limits, and faculty guidelines when testing physical bench hardware.
            </span>
          </div>
          <p className="footer-copyright">
            © {currentYear} LabSense AI (Team Hack Hive) • Built for Hacktoberfest VVCE Mysuru
          </p>
        </div>
      </div>
    </footer>
  );
}
