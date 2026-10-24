import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <Cpu size={20} className="footer-logo-icon" />
              <span className="footer-brand-name">LabSense AI</span>
            </div>
            <p className="footer-description">
              An AI-assisted electronics laboratory troubleshooting companion designed to help engineering students systematically diagnose circuit faults, understand unexpected readings, and master practical electronics.
            </p>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Milestone 1 Scope</h4>
            <ul className="footer-links">
              <li><span>Client-side Circuit Image Ingestion</span></li>
              <li><span>Laboratory Symptom & Measurement Staging</span></li>
              <li><span>Diagnostic Report Blueprint Interface</span></li>
              <li><span>Local Input Validation & Safety Guidance</span></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Challenge Details</h4>
            <ul className="footer-links">
              <li><span><strong>Event:</strong> Hacktoberfest — VVCE Mysuru</span></li>
              <li><span><strong>Challenge:</strong> Best Use of Gemma 4</span></li>
              <li><span><strong>Model Target:</strong> Gemma 4 Multimodal</span></li>
              <li><span><strong>Scope:</strong> Low-voltage educational circuits</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-disclaimer">
            <ShieldCheck size={16} className="disclaimer-icon" />
            <span>
              <strong>Educational Prototype Notice:</strong> LabSense AI is an experimental educational prototype developed for Hacktoberfest at VVCE Mysuru. Always observe electronics lab bench safety protocols, power limits, and instructor instructions when working with physical hardware.
            </span>
          </div>
          <p className="footer-copyright">
            © {currentYear} LabSense AI • Built with React & Vite
          </p>
        </div>
      </div>
    </footer>
  );
}
