import React, { useState } from 'react';
import {
  FileCheck,
  PlusCircle,
  Sparkles,
  Save,
  Edit3,
  Clock,
  CheckCircle2,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { draftAssessmentQuestions } from '../../lib/api';

const INITIAL_TESTS = [
  {
    id: 't-1',
    title: 'Practical Assessment: Diode Characteristics & Voltage Limits',
    duration_minutes: 15,
    max_attempts: 3,
    is_published: true,
    questions_count: 3,
  },
  {
    id: 't-2',
    title: 'Quiz: Ohm\'s Law & Maximum Resistor Power Dissipation',
    duration_minutes: 20,
    max_attempts: 2,
    is_published: false,
    questions_count: 2,
  },
];

export default function InstructorTests() {
  const [tests, setTests] = useState(INITIAL_TESTS);
  const [isCreating, setIsCreating] = useState(false);

  // New Test State
  const [testTitle, setTestTitle] = useState('');
  const [duration, setDuration] = useState(15);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState([]);

  // AI Authoring Assistant
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiTopic, setAiTopic] = useState('Semiconductor Diodes & Voltage Limits');

  const handleStartCreate = () => {
    setTestTitle('');
    setDuration(15);
    setMaxAttempts(3);
    setIsPublished(false);
    setQuestions([]);
    setIsCreating(true);
  };

  const handleGenerateQuestions = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await draftAssessmentQuestions({
        topic: aiTopic,
        difficulty: 'Beginner',
        count: 2,
      });

      setQuestions((prev) => [...prev, ...res.questions]);
    } catch (err) {
      alert(`AI Authoring error: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveTest = (e) => {
    e.preventDefault();
    if (!testTitle.trim()) return;

    const newTest = {
      id: `t-${Date.now()}`,
      title: testTitle.trim(),
      duration_minutes: duration,
      max_attempts: maxAttempts,
      is_published: isPublished,
      questions_count: questions.length,
    };

    setTests([newTest, ...tests]);
    setIsCreating(false);
  };

  const handleTogglePublish = (id) => {
    setTests(tests.map((t) => (t.id === id ? { ...t, is_published: !t.is_published } : t)));
  };

  return (
    <div className="instructor-tests-layout">
      {/* Header bar */}
      <div className="section-toolbar card">
        <div className="toolbar-info">
          <FileCheck size={20} className="text-blue" />
          <div>
            <h2 className="toolbar-title">Assessment & Test Designer</h2>
            <p className="toolbar-subtitle">Author timed laboratory assessments with objective deterministic grading</p>
          </div>
        </div>

        {!isCreating && (
          <button type="button" className="btn btn-primary" onClick={handleStartCreate}>
            <PlusCircle size={16} />
            <span>Create New Test</span>
          </button>
        )}
      </div>

      {isCreating ? (
        /* Test Creator Form */
        <div className="card test-creator-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Author Laboratory Assessment</h3>
              <p className="card-subtitle">Define objective questions, duration limits, and automated grading criteria</p>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSaveTest} className="test-builder-form">
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="field-label" htmlFor="at-title">Assessment Title *</label>
                  <input
                    id="at-title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Diode Forward Characteristics Quiz"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="field-label">Publication Status</label>
                  <div className="checkbox-row" style={{ marginTop: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="at-publish"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    <label htmlFor="at-publish" className="field-label">
                      Publish Test (Students can only attempt published tests)
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="field-label" htmlFor="at-duration">Duration Limit (Minutes)</label>
                  <input
                    id="at-duration"
                    type="number"
                    min="5"
                    max="120"
                    className="form-control"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="at-attempts">Max Allowed Attempts</label>
                  <input
                    id="at-attempts"
                    type="number"
                    min="1"
                    max="10"
                    className="form-control"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              {/* Gemma 4 Authoring Assistant Box */}
              <div className="ai-authoring-box card">
                <div className="ai-authoring-header">
                  <Sparkles size={18} className="text-blue" />
                  <div>
                    <h4 className="box-title">Gemma 4 Assessment Authoring Assistant</h4>
                    <p className="box-desc">
                      Let Gemma 4 draft laboratory questions, multiple-choice options, and theoretical explanations based on syllabus topics.
                    </p>
                  </div>
                </div>

                <div className="ai-authoring-row">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Specify circuit topic (e.g. Ohm's Law, Op-Amps, Diodes)"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleGenerateQuestions}
                    disabled={isGeneratingAi}
                  >
                    <Sparkles size={16} className={isGeneratingAi ? 'spin-icon' : ''} />
                    <span>{isGeneratingAi ? 'Drafting...' : 'Generate Questions'}</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="questions-designer-section">
                <h4 className="detail-subheading">Assessment Questions ({questions.length})</h4>
                {questions.map((q, idx) => (
                  <div key={idx} className="designer-q-item">
                    <div className="q-item-top">
                      <span className="q-number-pill">Q0{idx + 1} ({q.question_type.toUpperCase()})</span>
                      <span className="q-marks-pill">{q.marks} Marks</span>
                    </div>
                    <p className="q-item-prompt"><strong>{q.prompt}</strong></p>
                    {q.options?.length > 0 && (
                      <ul className="q-item-options">
                        {q.options.map((opt, i) => (
                          <li key={i} className={opt === q.correct_answer ? 'correct-option' : ''}>
                            {opt} {opt === q.correct_answer && '✓ (Correct Key)'}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="q-item-expl"><em>Explanation:</em> {q.explanation}</p>
                  </div>
                ))}

                {questions.length === 0 && (
                  <p className="empty-text">No questions added yet. Use Gemma AI above or add manually.</p>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Save Assessment</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Tests Table */
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Test Title</th>
                    <th>Duration</th>
                    <th>Questions</th>
                    <th>Attempts Allowed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.title}</strong></td>
                      <td>{t.duration_minutes} mins</td>
                      <td>{t.questions_count} questions</td>
                      <td>{t.max_attempts} attempts</td>
                      <td>
                        <button
                          type="button"
                          className={`status-toggle-btn ${t.is_published ? 'btn-pub-active' : 'btn-pub-draft'}`}
                          onClick={() => handleTogglePublish(t.id)}
                        >
                          {t.is_published ? 'Published' : 'Draft (Hidden)'}
                        </button>
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
