import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckSquare,
  Eye,
  Search,
  Activity,
  Wrench,
  ShieldAlert,
  BookOpen,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileText
} from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { analyzeCircuit, sendFollowUp } from '../../lib/api';

const EXPERIMENT_TYPES = [
  'LED & Series Resistor',
  'Inverting Op-Amp',
  '555 Timer Astable Multivibrator',
  'Full-Wave Bridge Rectifier',
  'BJT Common Emitter Amplifier',
  'R-C Low Pass Filter',
  'Voltage Regulator 7805',
  'Voltage Divider Network',
  'Arduino & Sensor Interfacing',
  'Custom Breadboard Circuit',
];

export default function StudentTroubleshoot() {
  // Form State
  const [circuitImage, setCircuitImage] = useState(null);
  const [experimentType, setExperimentType] = useState('LED & Series Resistor');
  const [problemDescription, setProblemDescription] = useState('');
  const [observedSymptoms, setObservedSymptoms] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [supplyVoltage, setSupplyVoltage] = useState('5.0');
  const [measuredVoltage, setMeasuredVoltage] = useState('0.04');
  const [measuredCurrent, setMeasuredCurrent] = useState('0.0');
  const [errors, setErrors] = useState({});

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Follow-up Chat State
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);

  // Validation
  const validateForm = () => {
    const errs = {};
    if (!problemDescription.trim() || problemDescription.trim().length < 10) {
      errs.problemDescription = 'Please describe the fault or symptom (minimum 10 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setReport(null);
    setChatHistory([]);

    try {
      // Convert image to base64 if available
      let imageBase64 = null;
      let mimeType = 'image/jpeg';
      if (circuitImage?.file) {
        mimeType = circuitImage.file.type || 'image/jpeg';
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result;
            const b64 = result.split(',')[1];
            resolve(b64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(circuitImage.file);
        });
      }

      const payload = {
        experiment_type: experimentType,
        problem_description: problemDescription.trim(),
        observed_symptoms: observedSymptoms.trim() || '',
        expected_behavior: expectedBehavior.trim() || '',
        measurements: {
          supply_voltage: supplyVoltage ? parseFloat(supplyVoltage) : null,
          measured_voltage: measuredVoltage ? parseFloat(measuredVoltage) : null,
          measured_current: measuredCurrent ? parseFloat(measuredCurrent) : null,
        },
        image_base64: imageBase64,
        image_mime_type: mimeType,
      };

      const result = await analyzeCircuit(payload);
      setReport(result);
    } catch (err) {
      console.error('Diagnosis failed:', err);
      setAnalysisError(err.message || 'Diagnostic request failed. Please check the backend connection and try again.');
      setReport(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpQuestion.trim() || !report) return;

    const userMsg = followUpQuestion.trim();
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setFollowUpQuestion('');
    setIsSendingFollowUp(true);

    try {
      const payload = {
        experiment_type: experimentType,
        problem_description: problemDescription,
        initial_report_summary: report?.circuit_observations || 'Circuit bench troubleshooting report',
        student_question: userMsg,
        previous_messages: chatHistory.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
      };

      const reply = await sendFollowUp(payload);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: reply.reply,
          suggestedChecks: reply.suggested_next_checks || [],
          model: reply.model_identifier,
        },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          isError: true,
          text: `Inference error: ${err.message || 'Unable to reach Gemma 4 tutor. Please retry.'}`,
        },
      ]);
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  const handleLoadSample = () => {
    setExperimentType('LED Circuit');
    setProblemDescription('The indicator LED fails to illuminate when the 5V bench power supply is engaged.');
    setObservedSymptoms('Resistor R1 is slightly warm. Measured voltage across the LED leads is only 0.04V.');
    setExpectedBehavior('Red 5mm LED should glow continuously with ~1.9V forward drop and ~14mA loop current.');
    setSupplyVoltage('5.0');
    setMeasuredVoltage('0.04');
    setMeasuredCurrent('0.0');

    // Create a mock circuit image payload for instant evaluation
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('Sample Circuit: Breadboard LED & 220Ω', 30, 150);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(200, 200, 15, 0, 2 * Math.PI);
    ctx.fill();

    canvas.toBlob((blob) => {
      const file = new File([blob], 'sample_circuit_bench.jpg', { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(file);
      setCircuitImage({
        file,
        name: 'sample_circuit_bench.jpg',
        sizeFormatted: '18.4 KB',
        previewUrl,
      });
      setErrors({});
    }, 'image/jpeg');
  };

  const handleReset = () => {
    setCircuitImage(null);
    setProblemDescription('');
    setObservedSymptoms('');
    setExpectedBehavior('');
    setSupplyVoltage('');
    setMeasuredVoltage('');
    setMeasuredCurrent('');
    setReport(null);
    setChatHistory([]);
    setAnalysisError(null);
    setErrors({});
  };

  return (
    <div className="troubleshoot-layout">
      {/* Workbench Input Form */}
      <div className="troubleshoot-form-col">
        <form className="experiment-form card" onSubmit={handleSubmit} noValidate>
          <div className="card-header">
            <div className="card-title-group">
              <FileText className="card-title-icon" size={20} />
              <div>
                <h2 className="card-title">Circuit Diagnostic Bench</h2>
                <p className="card-subtitle">Upload hardware imagery and bench measurements for Gemma 4 multimodal analysis</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-text-action"
              onClick={handleLoadSample}
              title="Populate test case"
            >
              <Sparkles size={14} />
              <span>Load Sample Case</span>
            </button>
          </div>

          <div className="card-body">
            {/* 1. Circuit Photo */}
            <ImageUpload
              selectedImage={circuitImage}
              onImageChange={(img) => {
                setCircuitImage(img);
                if (img) setErrors((prev) => ({ ...prev, circuitImage: null }));
              }}
              validationError={errors.circuitImage}
            />

            {/* 2. Category */}
            <div className="form-group">
              <label className="field-label" htmlFor="ts-category">
                Experiment Category <span className="required-mark">*</span>
              </label>
              <div className="select-wrapper">
                <select
                  id="ts-category"
                  value={experimentType}
                  onChange={(e) => setExperimentType(e.target.value)}
                  className="form-control form-select"
                >
                  {EXPERIMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Problem Description */}
            <div className="form-group">
              <div className="field-label-group">
                <label className="field-label" htmlFor="ts-problem">
                  Problem Description <span className="required-mark">*</span>
                </label>
                <span className="char-count">{problemDescription.length} chars</span>
              </div>
              <textarea
                id="ts-problem"
                rows={3}
                value={problemDescription}
                onChange={(e) => {
                  setProblemDescription(e.target.value);
                  if (e.target.value.trim().length >= 10) {
                    setErrors((prev) => ({ ...prev, problemDescription: null }));
                  }
                }}
                placeholder="e.g. LED does not illuminate when 5V bench supply is engaged. Jumper wires have been reseated."
                className={`form-control form-textarea ${errors.problemDescription ? 'input-error' : ''}`}
              />
              {errors.problemDescription && (
                <div className="field-error-message" role="alert">
                  <AlertTriangle size={14} />
                  <span>{errors.problemDescription}</span>
                </div>
              )}
            </div>

            {/* 4. Observed Symptoms */}
            <div className="form-group">
              <label className="field-label" htmlFor="ts-symptoms">
                Observed Physical Symptoms <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="ts-symptoms"
                rows={2}
                value={observedSymptoms}
                onChange={(e) => setObservedSymptoms(e.target.value)}
                placeholder="e.g. Resistor warm to the touch, power supply indicator flickers, erratic readings."
                className="form-control form-textarea"
              />
            </div>

            {/* 5. Expected Behavior */}
            <div className="form-group">
              <label className="field-label" htmlFor="ts-expected">
                Expected Circuit Behavior <span className="optional-tag">(Optional)</span>
              </label>
              <textarea
                id="ts-expected"
                rows={2}
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="e.g. LED should glow bright red with approximately 2.0V forward voltage drop."
                className="form-control form-textarea"
              />
            </div>

            {/* 6. Bench Measurements */}
            <div className="measurements-section">
              <div className="measurements-header">
                <div className="measurements-title-group">
                  <Activity size={18} className="measurements-icon" />
                  <div>
                    <h3 className="measurements-title">Bench Multimeter Telemetry</h3>
                    <p className="measurements-subtitle">Supply actual bench readings to corroborate multimodal visual clues.</p>
                  </div>
                </div>
              </div>

              <div className="measurements-grid">
                <div className="measurement-field">
                  <label className="measurement-label" htmlFor="m-supply">Supply Voltage</label>
                  <div className="input-with-unit">
                    <input
                      id="m-supply"
                      type="number"
                      step="0.01"
                      value={supplyVoltage}
                      onChange={(e) => setSupplyVoltage(e.target.value)}
                      placeholder="5.0"
                      className="form-control measurement-input"
                    />
                    <span className="unit-badge">V</span>
                  </div>
                </div>

                <div className="measurement-field">
                  <label className="measurement-label" htmlFor="m-voltage">Measured Voltage</label>
                  <div className="input-with-unit">
                    <input
                      id="m-voltage"
                      type="number"
                      step="0.01"
                      value={measuredVoltage}
                      onChange={(e) => setMeasuredVoltage(e.target.value)}
                      placeholder="0.04"
                      className="form-control measurement-input"
                    />
                    <span className="unit-badge">V</span>
                  </div>
                </div>

                <div className="measurement-field">
                  <label className="measurement-label" htmlFor="m-current">Measured Current</label>
                  <div className="input-with-unit">
                    <input
                      id="m-current"
                      type="number"
                      step="0.1"
                      value={measuredCurrent}
                      onChange={(e) => setMeasuredCurrent(e.target.value)}
                      placeholder="0.0"
                      className="form-control measurement-input"
                    />
                    <span className="unit-badge">mA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-submit-analyse"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles size={18} className="spin-icon" />
                    <span>Analyzing with Gemma 4...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>Run Multimodal Diagnosis</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isAnalyzing}
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Structured Diagnostic Results Column */}
      <div className="troubleshoot-results-col">
        <div className="card results-card">
          <div className="card-header">
            <div className="card-title-group">
              <Cpu className="card-title-icon" size={20} />
              <div>
                <h2 className="card-title">Gemma 4 Diagnostic Report</h2>
                <p className="card-subtitle">
                  {report ? `Model: ${report.model_identifier}` : 'Structured laboratory fault analysis'}
                </p>
              </div>
            </div>

            <div className={`status-pill ${report ? 'status-pill-ready' : 'status-pill-idle'}`}>
              <span className={`dot ${report ? 'dot-active' : 'dot-idle'}`}></span>
              <span>{report ? 'Diagnosis Complete' : 'Awaiting Analysis'}</span>
            </div>
          </div>

          <div className="card-body">
            {analysisError && (
              <div className="modal-alert modal-alert-error" role="alert">
                <AlertTriangle size={18} />
                <span>{analysisError}</span>
              </div>
            )}

            {!report && !isAnalyzing && (
              <div className="empty-diagnosis-state" role="status">
                <div className="empty-icon-wrapper">
                  <Clock size={36} className="empty-icon" />
                </div>
                <h3 className="empty-title">Workbench Ready</h3>
                <p className="empty-message">
                  Upload a circuit photograph, specify bench telemetry, and click <strong>Run Multimodal Diagnosis</strong> to synthesize an evidence-based report.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="analyzing-state">
                <div className="analyzing-spinner"></div>
                <h3 className="analyzing-title">Gemma 4 Reasoning in Progress</h3>
                <p className="analyzing-desc">
                  Inspecting breadboard coordinates, validating semiconductor junction bias, and correlating voltage readings...
                </p>
              </div>
            )}

            {report && (
              <div className="report-container">
                {/* AI Model Badge */}
                <div className="report-meta-banner">
                  <div className={`meta-badge ${report.is_live_ai ? 'meta-badge-live' : 'meta-badge-fallback'}`}>
                    <Sparkles size={14} className={report.is_live_ai ? "text-emerald" : "text-amber"} />
                    <span>Source: <strong>{report.is_live_ai ? 'Live Gemma 4 AI' : 'Offline Heuristic Fallback'}</strong></span>
                  </div>
                  <div className="meta-badge">
                    <span>Intelligence: <strong>{report.model_identifier}</strong></span>
                  </div>
                  <div className="meta-badge">
                    <span>Certainty: <strong>{report.uncertainty_level}</strong></span>
                  </div>
                </div>

                {/* Section 1: Circuit Observations */}
                <div className="report-section-card">
                  <div className="report-section-header">
                    <div className="report-section-title">
                      <Eye size={18} className="text-blue" />
                      <h3>1. Circuit Observations & Physical Layout</h3>
                    </div>
                  </div>
                  <p className="report-section-text">{report.circuit_observations}</p>
                </div>

                {/* Section 2: Potential Faults */}
                <div className="report-section-card">
                  <div className="report-section-header">
                    <div className="report-section-title">
                      <AlertTriangle size={18} className="text-amber" />
                      <h3>2. Hypothesized Faults & Likelihood</h3>
                    </div>
                  </div>
                  <div className="faults-list">
                    {report.potential_faults.map((f, i) => (
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

                {/* Section 3: Supporting Evidence */}
                <div className="report-section-card">
                  <div className="report-section-header">
                    <div className="report-section-title">
                      <Search size={18} className="text-blue" />
                      <h3>3. Correlated Telemetry & Physical Clues</h3>
                    </div>
                  </div>
                  <ul className="bullet-list">
                    {report.supporting_evidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                {/* Section 4: Missing Information */}
                {report.missing_information?.length > 0 && (
                  <div className="report-section-card">
                    <div className="report-section-header">
                      <div className="report-section-title">
                        <HelpCircle size={18} className="text-slate" />
                        <h3>4. Missing Data & Clarification Needs</h3>
                      </div>
                    </div>
                    <ul className="bullet-list">
                      {report.missing_information.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 5: Verification Tests */}
                <div className="report-section-card">
                  <div className="report-section-header">
                    <div className="report-section-title">
                      <CheckSquare size={18} className="text-green" />
                      <h3>5. Recommended Multimeter Verification Tests</h3>
                    </div>
                  </div>
                  <div className="tests-table-wrapper">
                    <table className="tests-table">
                      <thead>
                        <tr>
                          <th>Step</th>
                          <th>Diagnostic Action</th>
                          <th>Probe Placement</th>
                          <th>Nominal Reading</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.verification_tests.map((vt) => (
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

                {/* Section 6: Expected Observations */}
                <div className="report-section-card">
                  <div className="report-section-header">
                    <div className="report-section-title">
                      <Activity size={18} className="text-blue" />
                      <h3>6. Expected Post-Resolution Behavior</h3>
                    </div>
                  </div>
                  <p className="report-section-text">{report.expected_observations}</p>
                </div>

                {/* Section 7: Corrective Steps */}
                <div className="report-section-card">
                  <div className="report-section-header">
                    <div className="report-section-title">
                      <Wrench size={18} className="text-blue" />
                      <h3>7. Actionable Wiring & Repair Procedure</h3>
                    </div>
                  </div>
                  <ol className="ordered-steps">
                    {report.corrective_steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Section 8: Safety Precautions */}
                <div className="report-section-card section-safety">
                  <div className="report-section-header">
                    <div className="report-section-title">
                      <ShieldAlert size={18} className="text-danger" />
                      <h3>8. Laboratory Safety Precautions</h3>
                    </div>
                  </div>
                  <ul className="safety-list">
                    {report.safety_precautions.map((safe, i) => (
                      <li key={i}>{safe}</li>
                    ))}
                  </ul>
                </div>

                {/* Section 9: Theory & Concept Explanation */}
                <div className="report-section-card section-theory">
                  <div className="report-section-header">
                    <div className="report-section-title">
                      <BookOpen size={18} className="text-blue" />
                      <h3>9. Electronics Principles & Theory</h3>
                    </div>
                  </div>
                  <p className="report-section-text">{report.concepts_explained}</p>
                </div>

                {/* Multi-Turn Follow-Up Q&A Panel */}
                <div className="follow-up-box card">
                  <div className="follow-up-header">
                    <MessageSquare size={18} className="text-blue" />
                    <div>
                      <h4 className="follow-up-title">Ask Gemma 4 a Follow-Up Question</h4>
                      <p className="follow-up-desc">
                        Preserve this troubleshooting session's context to ask about specific test probes or unexpected multimeter readings.
                      </p>
                    </div>
                  </div>

                  {/* Chat Conversation Stream */}
                  {(chatHistory.length > 0 || isSendingFollowUp) && (
                    <div className="chat-stream">
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`chat-bubble chat-${msg.sender} ${msg.isError ? 'chat-bubble-error' : ''}`}>
                          <div className="chat-bubble-author">
                            {msg.sender === 'user' ? 'You' : `Gemma 4 Tutor ${msg.model ? `(${msg.model})` : ''}`}
                          </div>
                          <p className="chat-bubble-text">{msg.text}</p>
                          {msg.suggestedChecks && msg.suggestedChecks.length > 0 && (
                            <ul className="chat-checks">
                              {msg.suggestedChecks.map((sc, i) => (
                                <li key={i}>• {sc}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}

                      {isSendingFollowUp && (
                        <div className="chat-bubble chat-assistant chat-loading">
                          <div className="chat-bubble-author">Gemma 4 Tutor</div>
                          <div className="chat-loading-row">
                            <Sparkles size={16} className="spin-icon text-cyan" />
                            <span>Gemma 4 is analyzing your follow-up inquiry...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Follow-Up Input */}
                  <form onSubmit={handleFollowUpSubmit} className="follow-up-form">
                    <div className="follow-up-input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. How do I switch my multimeter to diode test mode?"
                        value={followUpQuestion}
                        onChange={(e) => setFollowUpQuestion(e.target.value)}
                        disabled={isSendingFollowUp}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSendingFollowUp || !followUpQuestion.trim()}
                      >
                        {isSendingFollowUp ? (
                          <Sparkles size={16} className="spin-icon" />
                        ) : (
                          <Send size={16} />
                        )}
                        <span>Ask</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
