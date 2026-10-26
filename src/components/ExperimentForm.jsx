import React, { useState } from 'react';
import { Play, RotateCcw, HelpCircle, FileText, Activity, AlertCircle, Sparkles } from 'lucide-react';
import ImageUpload from './ImageUpload';

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

export default function ExperimentForm({ onSubmitExperiment, onReset, isPrepared }) {
  const [circuitImage, setCircuitImage] = useState(null);
  const [experimentType, setExperimentType] = useState('LED & Series Resistor');
  const [problemDescription, setProblemDescription] = useState('');
  const [observedSymptoms, setObservedSymptoms] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');

  // Optional measurements
  const [supplyVoltage, setSupplyVoltage] = useState('');
  const [measuredVoltage, setMeasuredVoltage] = useState('');
  const [measuredCurrent, setMeasuredCurrent] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  const validateNumericField = (value, fieldName, unit) => {
    if (value === '' || value === null || value === undefined) {
      return null; // Blank optional fields are valid
    }
    const num = Number(value.trim());
    if (isNaN(num)) {
      return `${fieldName} must be a valid number (e.g., 5.0 or 0).`;
    }
    if (num < 0) {
      return `${fieldName} cannot be negative for typical low-voltage bench tests.`;
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Image check
    if (!circuitImage) {
      newErrors.circuitImage = 'A circuit photograph is required for multimodal analysis.';
    }

    // 2. Problem description check
    if (!problemDescription.trim()) {
      newErrors.problemDescription = 'Please describe the circuit issue or unexpected symptom.';
    } else if (problemDescription.trim().length < 10) {
      newErrors.problemDescription = 'Please provide a more descriptive problem statement (minimum 10 characters).';
    }

    // 3. Optional measurements check (must allow zero, reject invalid strings/negatives)
    const supplyErr = validateNumericField(supplyVoltage, 'Supply voltage', 'V');
    if (supplyErr) newErrors.supplyVoltage = supplyErr;

    const voltageErr = validateNumericField(measuredVoltage, 'Measured voltage', 'V');
    if (voltageErr) newErrors.measuredVoltage = voltageErr;

    const currentErr = validateNumericField(measuredCurrent, 'Measured current', 'mA');
    if (currentErr) newErrors.measuredCurrent = currentErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare clean experiment payload
    const payload = {
      image: circuitImage,
      experimentType,
      problemDescription: problemDescription.trim(),
      observedSymptoms: observedSymptoms.trim() || 'None reported',
      expectedBehavior: expectedBehavior.trim() || 'Standard circuit reference behavior',
      measurements: {
        supplyVoltage: supplyVoltage.trim() !== '' ? `${Number(supplyVoltage.trim())} V` : 'Omitted / Not measured',
        measuredVoltage: measuredVoltage.trim() !== '' ? `${Number(measuredVoltage.trim())} V` : 'Omitted / Not measured',
        measuredCurrent: measuredCurrent.trim() !== '' ? `${Number(measuredCurrent.trim())} mA` : 'Omitted / Not measured',
        rawSupply: supplyVoltage.trim() !== '' ? Number(supplyVoltage.trim()) : null,
        rawVoltage: measuredVoltage.trim() !== '' ? Number(measuredVoltage.trim()) : null,
        rawCurrent: measuredCurrent.trim() !== '' ? Number(measuredCurrent.trim()) : null,
      },
      timestamp: new Date().toLocaleTimeString(),
    };

    onSubmitExperiment(payload);
  };

  const handleResetForm = () => {
    setCircuitImage(null);
    setExperimentType('LED & Series Resistor');
    setProblemDescription('');
    setObservedSymptoms('');
    setExpectedBehavior('');
    setSupplyVoltage('');
    setMeasuredVoltage('');
    setMeasuredCurrent('');
    setErrors({});
    if (onReset) onReset();
  };

  // Quick Demo Helper for Hackathon Evaluation
  const handleLoadSampleData = () => {
    setExperimentType('LED & Series Resistor');
    setProblemDescription('The red indicator LED does not turn on when the 5V bench supply is engaged. Breadboard connections have been checked.');
    setObservedSymptoms('Resistor R1 feels warm to the touch. Multimeter across the LED leads registers 0.04V instead of the expected forward bias.');
    setExpectedBehavior('Red 5mm LED should illuminate with ~1.8V to 2.1V forward voltage drop and 15-20mA current through the 220-ohm resistor.');
    setSupplyVoltage('5.0');
    setMeasuredVoltage('0.04');
    setMeasuredCurrent('0.0');
    setErrors((prev) => {
      const next = { ...prev };
      delete next.problemDescription;
      delete next.supplyVoltage;
      delete next.measuredVoltage;
      delete next.measuredCurrent;
      return next;
    });
  };

  return (
    <form className="experiment-form card" onSubmit={handleSubmit} noValidate>
      <div className="card-header">
        <div className="card-title-group">
          <FileText className="card-title-icon" size={20} />
          <div>
            <h2 className="card-title">Circuit Troubleshooting Workbench</h2>
            <p className="card-subtitle">Supply circuit imagery and bench observations for diagnostic staging</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-text-action"
          onClick={handleLoadSampleData}
          title="Populate test data for evaluation"
        >
          <Sparkles size={14} />
          <span>Load Sample Case</span>
        </button>
      </div>

      <div className="card-body">
        {/* Section 1: Circuit Photograph */}
        <ImageUpload
          selectedImage={circuitImage}
          onImageChange={(img) => {
            setCircuitImage(img);
            if (img && errors.circuitImage) {
              setErrors((prev) => ({ ...prev, circuitImage: null }));
            }
          }}
          validationError={errors.circuitImage}
        />

        {/* Section 2: Experiment Type */}
        <div className="form-group">
          <label className="field-label" htmlFor="experiment-type-select">
            Experiment Type <span className="required-mark" aria-hidden="true">*</span>
          </label>
          <div className="select-wrapper">
            <select
              id="experiment-type-select"
              value={experimentType}
              onChange={(e) => setExperimentType(e.target.value)}
              className="form-control form-select"
            >
              {EXPERIMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <span className="field-hint">Select the laboratory category matching your setup.</span>
        </div>

        {/* Section 3: Problem Description (Required) */}
        <div className="form-group">
          <div className="field-label-group">
            <label className="field-label" htmlFor="problem-description-input">
              Problem Description <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <span className="char-count">{problemDescription.length} chars</span>
          </div>
          <textarea
            id="problem-description-input"
            rows={3}
            value={problemDescription}
            onChange={(e) => {
              setProblemDescription(e.target.value);
              if (errors.problemDescription && e.target.value.trim().length >= 10) {
                setErrors((prev) => ({ ...prev, problemDescription: null }));
              }
            }}
            placeholder="e.g. LED does not light up when the switch is closed. Breadboard power rail connected to 5V."
            className={`form-control form-textarea ${errors.problemDescription ? 'input-error' : ''}`}
            aria-required="true"
            aria-invalid={errors.problemDescription ? 'true' : 'false'}
          />
          {errors.problemDescription && (
            <div className="field-error-message" role="alert">
              <AlertCircle size={15} className="error-icon" />
              <span>{errors.problemDescription}</span>
            </div>
          )}
        </div>

        {/* Section 4: Observed Symptoms (Optional) */}
        <div className="form-group">
          <label className="field-label" htmlFor="observed-symptoms-input">
            Observed Symptoms <span className="optional-tag">(Optional)</span>
          </label>
          <textarea
            id="observed-symptoms-input"
            rows={2}
            value={observedSymptoms}
            onChange={(e) => setObservedSymptoms(e.target.value)}
            placeholder="e.g. Component feels hot to the touch, power supply voltage drops immediately, erratic multimeter reading."
            className="form-control form-textarea"
          />
        </div>

        {/* Section 5: Expected Behavior (Optional) */}
        <div className="form-group">
          <label className="field-label" htmlFor="expected-behavior-input">
            Expected Behaviour or Reference Observations <span className="optional-tag">(Optional)</span>
          </label>
          <textarea
            id="expected-behavior-input"
            rows={2}
            value={expectedBehavior}
            onChange={(e) => setExpectedBehavior(e.target.value)}
            placeholder="e.g. LED should glow green continuously with ~20mA forward current as per lab manual experiment 3."
            className="form-control form-textarea"
          />
        </div>

        {/* Section 6: Experimental Measurements (Optional Numerics) */}
        <div className="measurements-section">
          <div className="measurements-header">
            <div className="measurements-title-group">
              <Activity size={18} className="measurements-icon" />
              <div>
                <h3 className="measurements-title">Bench Measurements</h3>
                <p className="measurements-subtitle">Optional multimeter readings. Zero (0) is treated as a valid reading.</p>
              </div>
            </div>
          </div>

          <div className="measurements-grid">
            {/* Supply Voltage */}
            <div className="measurement-field">
              <label className="measurement-label" htmlFor="supply-voltage-input">
                Supply Voltage
              </label>
              <div className="input-with-unit">
                <input
                  id="supply-voltage-input"
                  type="text"
                  inputMode="decimal"
                  value={supplyVoltage}
                  onChange={(e) => {
                    setSupplyVoltage(e.target.value);
                    if (errors.supplyVoltage) {
                      setErrors((prev) => ({ ...prev, supplyVoltage: null }));
                    }
                  }}
                  placeholder="e.g. 5.0"
                  className={`form-control measurement-input ${errors.supplyVoltage ? 'input-error' : ''}`}
                />
                <span className="unit-badge">V</span>
              </div>
              {errors.supplyVoltage && (
                <div className="field-error-message measurement-err" role="alert">
                  <AlertCircle size={13} className="error-icon" />
                  <span>{errors.supplyVoltage}</span>
                </div>
              )}
            </div>

            {/* Measured Voltage */}
            <div className="measurement-field">
              <label className="measurement-label" htmlFor="measured-voltage-input">
                Measured Voltage
              </label>
              <div className="input-with-unit">
                <input
                  id="measured-voltage-input"
                  type="text"
                  inputMode="decimal"
                  value={measuredVoltage}
                  onChange={(e) => {
                    setMeasuredVoltage(e.target.value);
                    if (errors.measuredVoltage) {
                      setErrors((prev) => ({ ...prev, measuredVoltage: null }));
                    }
                  }}
                  placeholder="e.g. 1.85"
                  className={`form-control measurement-input ${errors.measuredVoltage ? 'input-error' : ''}`}
                />
                <span className="unit-badge">V</span>
              </div>
              {errors.measuredVoltage && (
                <div className="field-error-message measurement-err" role="alert">
                  <AlertCircle size={13} className="error-icon" />
                  <span>{errors.measuredVoltage}</span>
                </div>
              )}
            </div>

            {/* Measured Current */}
            <div className="measurement-field">
              <label className="measurement-label" htmlFor="measured-current-input">
                Measured Current
              </label>
              <div className="input-with-unit">
                <input
                  id="measured-current-input"
                  type="text"
                  inputMode="decimal"
                  value={measuredCurrent}
                  onChange={(e) => {
                    setMeasuredCurrent(e.target.value);
                    if (errors.measuredCurrent) {
                      setErrors((prev) => ({ ...prev, measuredCurrent: null }));
                    }
                  }}
                  placeholder="e.g. 20.0"
                  className={`form-control measurement-input ${errors.measuredCurrent ? 'input-error' : ''}`}
                />
                <span className="unit-badge">mA</span>
              </div>
              {errors.measuredCurrent && (
                <div className="field-error-message measurement-err" role="alert">
                  <AlertCircle size={13} className="error-icon" />
                  <span>{errors.measuredCurrent}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Action Footer */}
      <div className="card-footer">
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-submit-analyse"
            aria-label="Analyse Circuit"
          >
            <Play size={18} />
            <span>Analyse Circuit</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetForm}
            aria-label="Reset workspace fields"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>

        <p className="form-disclaimer">
          Milestone 1 validates and prepares laboratory inputs locally. AI inference via Gemma 4 is scheduled for Milestone 2.
        </p>
      </div>
    </form>
  );
}
