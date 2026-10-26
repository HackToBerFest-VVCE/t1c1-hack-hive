import React from 'react';
import { UploadCloud, Cpu, CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function HowItWorks({ onOpenArchitecture }) {
  const steps = [
    {
      step: '01',
      title: 'Perception & Telemetry',
      status: 'Active Multimodal Ingestion',
      statusType: 'active',
      icon: UploadCloud,
      summary: 'Upload bench circuit photos, specify experiment classification, and enter multimeter telemetry.',
      details: [
        'Client-side image validation (JPEG, PNG, WebP up to 10 MB)',
        'Bench telemetry capture: Supply Voltage, Measured Voltage, and Loop Current',
        'Distinguishes valid zero readings (0.0 V) from unmeasured inputs',
        'Captures user-described symptoms and unexpected behavior',
      ],
    },
    {
      step: '02',
      title: 'Gemma 4 Multimodal Reasoning',
      status: 'Live Intelligence Layer',
      statusType: 'active',
      icon: Cpu,
      summary: 'Gemma 4 (gemma-4-31b-it) analyzes circuit imagery alongside multimeter readings through the secure FastAPI backend.',
      details: [
        'Multimodal vision-language prompt engineering with validated JSON schemas',
        'Visual breadboard coordinate and component pinout recognition',
        'Correlates observed voltages with physical semiconductor physics',
        'Separates confirmed empirical facts from diagnostic hypotheses',
      ],
    },
    {
      step: '03',
      title: 'Systematic Guidance & Tutoring',
      status: 'Structured Educational Output',
      statusType: 'active',
      icon: ShieldCheck,
      summary: 'Delivers an 8-section actionable troubleshooting report and interactive multi-turn session tutoring.',
      details: [
        'Ranked fault hypotheses with explicit likelihood ratings and evidence',
        'Step-by-step multimeter verification tests with exact probe placements',
        'Actionable corrective wiring procedures and crucial safety alerts',
        'Interactive follow-up questions preserving full session context',
      ],
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="section-container">
        <div className="section-header text-center">
          <div className="section-badge">
            <Zap size={14} />
            <span>Workflow & Architecture</span>
          </div>
          <h2 className="section-heading">How LabSense AI Works</h2>
          <p className="section-subheading">
            A transparent 3-step diagnostic framework designed to bridge physical workbench experiments with multimodal Gemma 4 reasoning.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.step} className="step-card step-card-active">
                <div className="step-card-header">
                  <span className="step-number">{item.step}</span>
                  <span className="step-status-tag tag-live">
                    <CheckCircle2 size={12} />
                    <span>{item.status}</span>
                  </span>
                </div>

                <div className="step-icon-wrapper">
                  <IconComponent size={24} className="step-icon" />
                </div>

                <h3 className="step-title">{item.title}</h3>
                <p className="step-summary">{item.summary}</p>

                <ul className="step-details-list">
                  {item.details.map((detail, idx) => (
                    <li key={idx} className="step-detail-item">
                      <span className="detail-bullet">›</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {onOpenArchitecture && (
          <div className="architecture-callout-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenArchitecture}
            >
              <Sparkles size={18} />
              <span>Deep Dive: Read the Gemma 4 AI Architecture</span>
            </button>
          </div>
        )}

        <div className="hackathon-alignment-box">
          <div className="alignment-badge">Hackathon Challenge Focus</div>
          <p className="alignment-text">
            <strong>Hacktoberfest VVCE Mysuru — Best Use of Gemma 4:</strong> LabSense AI demonstrates authentic, substantial use of Gemma 4
            for multimodal circuit understanding, evidence-based troubleshooting, simulation tutoring, and instructor co-pilot assistance,
            backed by deterministic electrical math and Supabase database security.
          </p>
        </div>
      </div>
    </section>
  );
}
