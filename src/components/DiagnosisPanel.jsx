import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Eye, 
  AlertTriangle, 
  Search, 
  CheckSquare, 
  Activity, 
  Wrench, 
  ShieldAlert, 
  Info, 
  Sparkles,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

const PLANNED_SECTIONS = [
  {
    id: 'observations',
    title: 'Circuit Observations',
    icon: Eye,
    description: 'Visual pinout inspection, component orientation, breadboard track continuity, and color code decoding by Gemma 4 vision.',
    plannedBadge: 'Planned Gemma 4 Output',
  },
  {
    id: 'faults',
    title: 'Potential Faults',
    icon: AlertTriangle,
    description: 'Ranked hypothesis list of root causes (e.g., reversed polarity, missing ground reference, cold solder joint, burnt current-limiting resistor).',
    plannedBadge: 'Planned Gemma 4 Output',
  },
  {
    id: 'evidence',
    title: 'Supporting Evidence',
    icon: Search,
    description: 'Correlating visual anomalies with uploaded bench measurements and user-described symptoms.',
    plannedBadge: 'Planned Gemma 4 Output',
  },
  {
    id: 'tests',
    title: 'Verification Tests',
    icon: CheckSquare,
    description: 'Guided multimeter probe steps, diode test checks, continuity measurements, and oscilloscope test points.',
    plannedBadge: 'Planned Gemma 4 Output',
  },
  {
    id: 'expected',
    title: 'Expected Observations',
    icon: Activity,
    description: 'Nominal readings, expected voltage drops across junctions, and reference LED illumination states upon test execution.',
    plannedBadge: 'Planned Gemma 4 Output',
  },
  {
    id: 'corrective',
    title: 'Corrective Steps',
    icon: Wrench,
    description: 'Actionable wiring alterations, component replacement steps, or breadboard re-routing guidance.',
    plannedBadge: 'Planned Gemma 4 Output',
  },
  {
    id: 'safety',
    title: 'Safety Precautions',
    icon: ShieldAlert,
    description: 'Thermal warnings for hot components, short-circuit hazards, bench power current limits, and device protection guidelines.',
    plannedBadge: 'Planned Gemma 4 Output',
  },
];

export default function DiagnosisPanel({ preparedExperiment }) {
  const isSubmitted = !!preparedExperiment;

  return (
    <div className="diagnosis-panel card">
      <div className="card-header">
        <div className="card-title-group">
          <Cpu className="card-title-icon" size={20} />
          <div>
            <h2 className="card-title">Diagnosis Results Panel</h2>
            <p className="card-subtitle">AI-assisted laboratory troubleshooting report & verification roadmap</p>
          </div>
        </div>

        <div className={`status-pill ${isSubmitted ? 'status-pill-ready' : 'status-pill-idle'}`}>
          <span className={`dot ${isSubmitted ? 'dot-active' : 'dot-idle'}`}></span>
          <span>{isSubmitted ? 'Inputs Prepared for AI' : 'Awaiting Inputs'}</span>
        </div>
      </div>

      <div className="card-body">
        {/* Honest Notice & Status State */}
        {!isSubmitted ? (
          /* Initial Empty State */
          <div className="empty-diagnosis-state" role="status">
            <div className="empty-icon-wrapper">
              <Clock size={36} className="empty-icon" />
            </div>
            <h3 className="empty-title">Ready for Circuit Diagnostics</h3>
            <p className="empty-message">
              Your troubleshooting report will appear here once Gemma 4 integration is enabled.
            </p>
            <div className="empty-hint-card">
              <Info size={16} className="empty-hint-icon" />
              <span>
                Upload your circuit photo on the left and click <strong>Analyse Circuit</strong> to validate and stage your experiment data.
              </span>
            </div>
          </div>
        ) : (
          /* Prepared Submission Summary State */
          <div className="submission-status-card" role="region" aria-label="Prepared Experiment Summary">
            <div className="status-banner">
              <div className="status-banner-badge">
                <CheckCircle2 size={16} />
                <span>Inputs Prepared & Validated Locally</span>
              </div>
              <span className="timestamp-badge">Staged at {preparedExperiment.timestamp}</span>
            </div>

            <p className="status-banner-text">
              Circuit imagery and experiment observations have been validated on the client and packaged for future Gemma 4 Multimodal analysis. 
              <strong> Actual AI inference has not yet been connected in this development milestone.</strong>
            </p>

            {/* Structured Staging Summary */}
            <div className="staged-details-grid">
              <div className="staged-item">
                <span className="staged-label">CIRCUIT IMAGE</span>
                <div className="staged-image-preview">
                  {preparedExperiment.image && (
                    <img 
                      src={preparedExperiment.image.previewUrl} 
                      alt="Thumbnail of prepared circuit" 
                      className="staged-thumbnail"
                    />
                  )}
                  <div className="staged-image-meta">
                    <span className="staged-filename">{preparedExperiment.image?.name}</span>
                    <span className="staged-filesize">{preparedExperiment.image?.sizeFormatted}</span>
                  </div>
                </div>
              </div>

              <div className="staged-item">
                <span className="staged-label">EXPERIMENT TYPE</span>
                <span className="staged-value-tag">{preparedExperiment.experimentType}</span>
              </div>

              <div className="staged-item staged-fullwidth">
                <span className="staged-label">PROBLEM STATEMENT</span>
                <p className="staged-text">{preparedExperiment.problemDescription}</p>
              </div>

              {preparedExperiment.observedSymptoms !== 'None reported' && (
                <div className="staged-item staged-fullwidth">
                  <span className="staged-label">OBSERVED SYMPTOMS</span>
                  <p className="staged-text">{preparedExperiment.observedSymptoms}</p>
                </div>
              )}

              <div className="staged-item staged-fullwidth">
                <span className="staged-label">BENCH MEASUREMENTS</span>
                <div className="measurements-pill-row">
                  <span className="reading-chip">Supply: {preparedExperiment.measurements.supplyVoltage}</span>
                  <span className="reading-chip">Measured V: {preparedExperiment.measurements.measuredVoltage}</span>
                  <span className="reading-chip">Measured I: {preparedExperiment.measurements.measuredCurrent}</span>
                </div>
              </div>
            </div>

            <div className="pipeline-notice">
              <Sparkles size={16} className="pipeline-icon" />
              <span>
                <strong>Next Milestone Pipeline:</strong> Multimodal prompt payload is ready to be dispatched to the Gemma 4 Vision-Language API endpoint.
              </span>
            </div>
          </div>
        )}

        {/* Planned Report Blueprint Sections */}
        <div className="report-blueprint-container">
          <div className="blueprint-header">
            <Layers size={16} />
            <h3 className="blueprint-title">Planned Troubleshooting Report Architecture</h3>
          </div>
          <p className="blueprint-subtitle">
            The Gemma 4 Multimodal integration will systematically populate each of the 7 diagnostic sections below:
          </p>

          <div className="planned-sections-list">
            {PLANNED_SECTIONS.map((section, idx) => {
              const IconComp = section.icon;
              return (
                <div key={section.id} className="planned-section-card">
                  <div className="section-card-top">
                    <div className="section-number-pill">0{idx + 1}</div>
                    <div className="section-card-heading">
                      <div className="section-title-wrapper">
                        <IconComp size={16} className="section-icon" />
                        <h4 className="section-title">{section.title}</h4>
                      </div>
                      <span className="planned-tag">{section.plannedBadge}</span>
                    </div>
                  </div>
                  <p className="section-description">{section.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
