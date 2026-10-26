import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  Edit3,
  Eye,
  Trash2,
  Save,
  ShieldAlert,
  Sliders,
  Send
} from 'lucide-react';

const INITIAL_INSTRUCTOR_EXPERIMENTS = [
  {
    id: 'exp-1',
    title: 'LED Forward Characteristics & Current Limiting',
    category: 'Diodes & LEDs',
    difficulty: 'Beginner',
    is_published: true,
    description: 'Investigate the forward voltage drop and operating current of a standard 5mm red LED.',
    procedure: '1. Insert 220Ω resistor into breadboard.\n2. Connect LED anode to resistor and cathode to GND.\n3. Measure voltage drop across LED.',
    expected_readings: 'V_led: 1.9V, Current: 14mA at 5V supply.',
    safety_instructions: 'Never connect LED directly across 5V without series resistor.',
  },
  {
    id: 'exp-2',
    title: 'BJT NPN Transistor as a Saturated Switch',
    category: 'Transistors',
    difficulty: 'Intermediate',
    is_published: false,
    description: 'Drive a high-current load using a 2N2222 NPN transistor operated in saturation mode.',
    procedure: '1. Wire collector to LED/load with 150Ω resistor.\n2. Connect emitter to GND.\n3. Apply base drive through 10kΩ resistor.',
    expected_readings: 'Vce(sat) < 0.2V, Base current ~0.4mA.',
    safety_instructions: 'Ensure base current does not exceed maximum rating of transistor base-emitter junction.',
  },
];

export default function InstructorExperiments() {
  const [experiments, setExperiments] = useState(INITIAL_INSTRUCTOR_EXPERIMENTS);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExp, setEditingExp] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Diodes & LEDs');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [description, setDescription] = useState('');
  const [procedure, setProcedure] = useState('');
  const [expectedReadings, setExpectedReadings] = useState('');
  const [safetyInstructions, setSafetyInstructions] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // Gemma Co-Pilot Drafting
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleStartCreate = () => {
    setEditingExp(null);
    setTitle('');
    setCategory('Diodes & LEDs');
    setDifficulty('Beginner');
    setDescription('');
    setProcedure('');
    setExpectedReadings('');
    setSafetyInstructions('');
    setIsPublished(false);
    setIsEditing(true);
  };

  const handleStartEdit = (exp) => {
    setEditingExp(exp);
    setTitle(exp.title);
    setCategory(exp.category);
    setDifficulty(exp.difficulty);
    setDescription(exp.description);
    setProcedure(exp.procedure);
    setExpectedReadings(exp.expected_readings);
    setSafetyInstructions(exp.safety_instructions);
    setIsPublished(exp.is_published);
    setIsEditing(true);
  };

  const handleSaveExperiment = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    if (editingExp) {
      // Update existing
      setExperiments(experiments.map((item) =>
        item.id === editingExp.id
          ? {
              ...item,
              title,
              category,
              difficulty,
              description,
              procedure,
              expected_readings: expectedReadings,
              safety_instructions: safetyInstructions,
              is_published: isPublished,
            }
          : item
      ));
    } else {
      // Create new
      const newEntry = {
        id: `exp-${Date.now()}`,
        title,
        category,
        difficulty,
        description,
        procedure,
        expected_readings: expectedReadings,
        safety_instructions: safetyInstructions,
        is_published: isPublished,
      };
      setExperiments([newEntry, ...experiments]);
    }
    setIsEditing(false);
  };

  // Gemma 4 AI Assistant for Procedure & Safety
  const handleAiDraftContent = () => {
    if (!title.trim()) {
      alert('Please enter an experiment title first so Gemma 4 can generate relevant laboratory content.');
      return;
    }
    setIsGeneratingAi(true);
    setTimeout(() => {
      setProcedure(
        `1. Place components on breadboard per reference schematic for ${title}.\n` +
        `2. Connect DC bench power supply with current compliance set to 50mA.\n` +
        `3. Verify probe calibration with multimeter in DC Volts mode.\n` +
        `4. Measure voltage across active nodes and record in laboratory notebook.\n` +
        `5. Power off supply before altering circuit connections.`
      );
      setSafetyInstructions(
        `• De-energize circuit before inserting or removing components.\n` +
        `• Double check polarity of polarized components to prevent thermal breakdown.\n` +
        `• Ensure multimeter is not connected in current mode across supply terminals.`
      );
      setExpectedReadings(`Nominal bench voltage: 5.0V DC. Operating current: 10mA - 20mA.`);
      setIsGeneratingAi(false);
    }, 700);
  };

  const handleTogglePublish = (expId) => {
    setExperiments(experiments.map((item) =>
      item.id === expId ? { ...item, is_published: !item.is_published } : item
    ));
  };

  return (
    <div className="instructor-experiments-layout">
      {/* Header bar */}
      <div className="section-toolbar card">
        <div className="toolbar-info">
          <BookOpen size={20} className="text-blue" />
          <div>
            <h2 className="toolbar-title">Laboratory Experiment Designer</h2>
            <p className="toolbar-subtitle">Create, preview, and publish structured laboratory modules for students</p>
          </div>
        </div>

        {!isEditing && (
          <button type="button" className="btn btn-primary" onClick={handleStartCreate}>
            <PlusCircle size={16} />
            <span>Create New Experiment</span>
          </button>
        )}
      </div>

      {isEditing ? (
        /* Edit / Create Form */
        <div className="card exp-editor-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">{editingExp ? 'Edit Laboratory Experiment' : 'Author New Experiment'}</h3>
              <p className="card-subtitle">Saved drafts remain private until marked as Published.</p>
            </div>

            <button
              type="button"
              className="btn btn-text-action"
              onClick={handleAiDraftContent}
              disabled={isGeneratingAi}
            >
              <Sparkles size={16} />
              <span>{isGeneratingAi ? 'Drafting with Gemma 4...' : 'Gemma AI Assistant: Draft Content'}</span>
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSaveExperiment} className="exp-form">
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="field-label" htmlFor="exp-title">Experiment Title *</label>
                  <input
                    id="exp-title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Diode Forward Characteristics"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="exp-cat">Category *</label>
                  <select
                    id="exp-cat"
                    className="form-control form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Diodes & LEDs">Diodes & LEDs</option>
                    <option value="Resistor Networks">Resistor Networks</option>
                    <option value="Transistors">Transistors</option>
                    <option value="Analog Fundamentals">Analog Fundamentals</option>
                    <option value="Sensors & Interfacing">Sensors & Interfacing</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="field-label" htmlFor="exp-diff">Difficulty Level</label>
                  <select
                    id="exp-diff"
                    className="form-control form-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="field-label">Publication Status</label>
                  <div className="checkbox-row" style={{ marginTop: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="publish-toggle"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    <label htmlFor="publish-toggle" className="field-label">
                      Publish to Student Library (Students can only view published experiments)
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="exp-desc">Experiment Summary & Objectives *</label>
                <textarea
                  id="exp-desc"
                  rows={2}
                  className="form-control form-textarea"
                  placeholder="Outline the core practical concepts students will explore..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="exp-proc">Step-by-Step Laboratory Procedure</label>
                <textarea
                  id="exp-proc"
                  rows={5}
                  className="form-control form-textarea form-control-mono"
                  placeholder="1. Insert component... 2. Power on supply..."
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="field-label" htmlFor="exp-readings">Expected Bench Readings</label>
                  <textarea
                    id="exp-readings"
                    rows={3}
                    className="form-control form-textarea"
                    placeholder="e.g. V_led = 1.9V, I = 14mA"
                    value={expectedReadings}
                    onChange={(e) => setExpectedReadings(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="exp-safe">Safety Precautions</label>
                  <textarea
                    id="exp-safe"
                    rows={3}
                    className="form-control form-textarea"
                    placeholder="e.g. Thermal cautions, short-circuit limits..."
                    value={safetyInstructions}
                    onChange={(e) => setSafetyInstructions(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Save Experiment</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Experiments Table List */
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Experiment Title</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {experiments.map((exp) => (
                    <tr key={exp.id}>
                      <td>
                        <strong>{exp.title}</strong>
                        <p className="table-subtext">{exp.description}</p>
                      </td>
                      <td>{exp.category}</td>
                      <td>
                        <span className={`diff-tag diff-${exp.difficulty.toLowerCase()}`}>
                          {exp.difficulty}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${exp.is_published ? 'btn-pub-active' : 'btn-pub-draft'}`}
                          onClick={() => handleTogglePublish(exp.id)}
                          title="Click to toggle publication"
                        >
                          {exp.is_published ? 'Published' : 'Draft (Hidden)'}
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons-row">
                          <button
                            type="button"
                            className="btn-action-icon"
                            onClick={() => handleStartEdit(exp)}
                            title="Edit Experiment"
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
