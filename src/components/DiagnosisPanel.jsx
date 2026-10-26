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
  HelpCircle,
  BookOpen
} from 'lucide-react';

export default function DiagnosisPanel({ preparedExperiment, liveReport, isAnalyzing, onRunLiveAnalysis }) {
  const isSubmitted = !!preparedExperiment;

  return (
    <div className="diagnosis-panel card">
      <div className="card-header">
        <div className="card-title-group">
          <Cpu className="card-title-icon" size={20} />
          <div>
            <h2 className="card-title">Gemma 4 Diagnostic Output</h2>
            <p className="card-subtitle">Multimodal laboratory troubleshooting report & verification roadmap</p>
          </div>
        </div>

        <div className={`status-pill ${liveReport ? 'status-pill-ready' : isSubmitted ? 'status-pill-ready' : 'status-pill-idle'}`}>
          <span className={`dot ${liveReport || isSubmitted ? 'dot-active' : 'dot-idle'}`}></span>
          <span>{liveReport ? 'Live Gemma 4 Report' : isSubmitted ? 'Inputs Staged' : 'Awaiting Bench Data'}</span>
        </div>
      </div>

      <div className="card-body">
        {/* Loading Spinner */}
        {isAnalyzing && (
          <div className="analyzing-state">
            <div className="analyzing-spinner"></div>
            <h3 className="analyzing-title">Gemma 4 Multimodal Reasoning</h3>
            <p className="analyzing-desc">
              Perceiving component placement, cross-referencing multimeter telemetry, and synthesizing verification tests...
            </p>
          </div>
        )}

        {/* Live Gemma 4 Report */}
        {liveReport && !isAnalyzing && (
          <div className="live-report-container">
            <div className="report-meta-banner">
              <div className="meta-badge">
                <Sparkles size={14} className="text-blue" />
                <span>Model: <strong>{liveReport.model_identifier}</strong></span>
              </div>
              <div className="meta-badge">
                <span>Certainty: <strong>{liveReport.uncertainty_level}</strong></span>
              </div>
            </div>

            {/* Observations */}
            <div className="report-section-card">
              <div className="report-section-header">
                <div className="report-section-title">
                  <Eye size={18} className="text-blue" />
                  <h3>1. Circuit Observations & Physical Layout</h3>
                </div>
              </div>
              <p className="report-section-text">{liveReport.circuit_observations}</p>
            </div>

            {/* Faults */}
            <div className="report-section-card">
              <div className="report-section-header">
                <div className="report-section-title">
                  <AlertTriangle size={18} className="text-amber" />
                  <h3>2. Potential Root Causes</h3>
                </div>
              </div>
              <div className="faults-list">
                {liveReport.potential_faults.map((f, i) => (
                  <div key={i} className="fault-item">
                    <div className="fault-top">
                      <span className="fault-name">{f.fault}</span>
                      <span className={`likelihood-badge likelihood-${f.likelihood.toLowerCase()}`}>
                        {f.likelihood} Likelihood
                      </span>
                    </div>
                    <p className="fault-evidence">{f.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Tests */}
            <div className="report-section-card">
              <div className="report-section-header">
                <div className="report-section-title">
                  <CheckSquare size={18} className="text-green" />
                  <h3>3. Multimeter Verification Tests</h3>
                </div>
              </div>
              <div className="tests-table-wrapper">
                <table className="tests-table">
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>Diagnostic Action</th>
                      <th>Probe Points</th>
                      <th>Expected Reading</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveReport.verification_tests.map((vt) => (
                      <tr key={vt.step}>
                        <td className="step-num">{vt.step}</td>
                        <td>
                          <strong>{vt.test_description}</strong>
                          <p className="safety-subtext">{vt.safety_rule}</p>
                        </td>
                        <td className="mono-text">{vt.probe_points}</td>
                        <td className="nominal-text">{vt.expected_nominal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Corrective Steps */}
            <div className="report-section-card">
              <div className="report-section-header">
                <div className="report-section-title">
                  <Wrench size={18} className="text-blue" />
                  <h3>4. Actionable Corrective Steps</h3>
                </div>
              </div>
              <ol className="ordered-steps">
                {liveReport.corrective_steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </div>

            {/* Safety */}
            <div className="report-section-card section-safety">
              <div className="report-section-header">
                <div className="report-section-title">
                  <ShieldAlert size={18} className="text-danger" />
                  <h3>5. Bench Safety Precautions</h3>
                </div>
              </div>
              <ul className="safety-list">
                {liveReport.safety_precautions.map((safe, i) => (
                  <li key={i}>{safe}</li>
                ))}
              </ul>
            </div>

            {/* Theory */}
            <div className="report-section-card section-theory">
              <div className="report-section-header">
                <div className="report-section-title">
                  <BookOpen size={18} className="text-blue" />
                  <h3>6. Theoretical Electronics Principles</h3>
                </div>
              </div>
              <p className="report-section-text">{liveReport.concepts_explained}</p>
            </div>
          </div>
        )}

        {/* Staged Experiment Summary State (Awaiting AI inference) */}
        {!liveReport && isSubmitted && !isAnalyzing && (
          <div className="submission-status-card" role="region" aria-label="Prepared Experiment Summary">
            <div className="status-banner">
              <div className="status-banner-badge">
                <CheckCircle2 size={16} />
                <span>Inputs Prepared & Staged for Gemma 4</span>
              </div>
              <span className="timestamp-badge">Staged at {preparedExperiment.timestamp}</span>
            </div>

            <p className="status-banner-text">
              Hardware photograph and bench readings are packaged. Click <strong>Execute Live Gemma 4 Analysis</strong> to transmit the payload to the backend intelligence layer.
            </p>

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

              <div className="staged-item staged-fullwidth">
                <span className="staged-label">BENCH MEASUREMENTS</span>
                <div className="measurements-pill-row">
                  <span className="reading-chip">Supply: {preparedExperiment.measurements.supplyVoltage}</span>
                  <span className="reading-chip">Measured V: {preparedExperiment.measurements.measuredVoltage}</span>
                  <span className="reading-chip">Measured I: {preparedExperiment.measurements.measuredCurrent}</span>
                </div>
              </div>
            </div>

            {onRunLiveAnalysis && (
              <div className="execute-ai-row">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={onRunLiveAnalysis}
                >
                  <Sparkles size={18} />
                  <span>Execute Live Gemma 4 Diagnostic Analysis</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Initial Empty State */}
        {!liveReport && !isSubmitted && !isAnalyzing && (
          <div className="empty-diagnosis-state" role="status">
            <div className="empty-icon-wrapper">
              <Clock size={36} className="empty-icon" />
            </div>
            <h3 className="empty-title">Ready for Circuit Diagnostics</h3>
            <p className="empty-message">
              Upload your breadboard photo on the left, enter multimeter readings, and click <strong>Analyse Circuit</strong> to generate an 8-section fault report.
            </p>
            <div className="empty-hint-card">
              <Info size={16} className="empty-hint-icon" />
              <span>
                Use <strong>Load Sample Case</strong> on the left to immediately test the full diagnostic pipeline.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
