import React from 'react';
import { UploadCloud, Cpu, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Upload & Describe',
      status: 'Implemented in Milestone 1',
      statusType: 'active',
      icon: UploadCloud,
      summary: 'Upload a circuit photograph and describe the experiment problem.',
      details: [
        'Client-side image validation (JPEG, PNG, WebP up to 10 MB)',
        'Structured experiment classification (LED, Resistor, Arduino, Sensors)',
        'Problem description & observed symptoms capture',
        'Bench telemetry capture (Supply Voltage, Measured Voltage, Current)',
      ],
    },
    {
      step: '02',
      title: 'Multimodal Analysis',
      status: 'Planned for Milestone 2',
      statusType: 'planned',
      icon: Cpu,
      summary: 'The planned Gemma-powered engine will combine visual evidence, experimental readings, symptoms, and reference information.',
      details: [
        'Multimodal vision-language prompt engineering with Gemma 4',
        'Component & pinout detection on breadboards and breakout boards',
        'Polarity checking, connection continuity, and track verification',
        'Cross-referencing observed bench values against theoretical calculations',
      ],
    },
    {
      step: '03',
      title: 'Systematic Troubleshooting',
      status: 'Planned for Milestone 2',
      statusType: 'planned',
      icon: ShieldCheck,
      summary: 'The planned AI system will provide possible causes, verification tests, expected observations, corrective guidance, and safety precautions.',
      details: [
        'Ranked fault hypotheses with clear causality chains',
        'Step-by-step bench verification tests with probe locations',
        'Expected quantitative multimeter observations',
        'Laboratory safety precautions and component damage prevention',
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
            A transparent 3-step diagnostic framework designed to bridge physical bench experiments with multimodal AI reasoning.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((item) => {
            const IconComponent = item.icon;
            const isDone = item.statusType === 'active';
            return (
              <div key={item.step} className={`step-card ${isDone ? 'step-card-active' : 'step-card-planned'}`}>
                <div className="step-card-header">
                  <span className="step-number">{item.step}</span>
                  <span className={`step-status-tag ${isDone ? 'tag-live' : 'tag-planned'}`}>
                    {isDone ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
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

        <div className="hackathon-alignment-box">
          <div className="alignment-badge">Hackathon Context</div>
          <p className="alignment-text">
            <strong>Hacktoberfest VVCE Mysuru — Best Use of Gemma 4:</strong> LabSense AI focuses on solving the real educational challenge students face during electronics laboratory sessions. Today's frontend milestone establishes a robust, accessible foundation for the multimodal Gemma 4 inference pipeline.
          </p>
        </div>
      </div>
    </section>
  );
}
