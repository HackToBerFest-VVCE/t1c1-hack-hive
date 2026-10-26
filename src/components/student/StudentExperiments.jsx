import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Send,
  FileText,
  AlertCircle
} from 'lucide-react';
import { fetchExperiments, askGemmaAboutExperiment } from '../../lib/api';

export default function StudentExperiments() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Selected experiment details
  const [activeExperiment, setActiveExperiment] = useState(null);

  // Gemma Inquire state
  const [studentQuestion, setStudentQuestion] = useState('');
  const [inquiryResponse, setInquiryResponse] = useState(null);
  const [isInquiring, setIsInquiring] = useState(false);

  // Completion state
  const [completedIds, setCompletedIds] = useState(() => {
    const saved = localStorage.getItem('labsense_completed_experiments');
    return saved ? JSON.parse(saved) : [];
  });
  const [benchNotes, setBenchNotes] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchExperiments();
        setExperiments(data);
        if (data.length > 0) {
          setActiveExperiment(data[0]);
        }
      } catch (err) {
        console.error('Failed to load experiments:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleComplete = (expId) => {
    let next;
    if (completedIds.includes(expId)) {
      next = completedIds.filter((id) => id !== expId);
    } else {
      next = [...completedIds, expId];
    }
    setCompletedIds(next);
    localStorage.setItem('labsense_completed_experiments', JSON.stringify(next));
  };

  const handleAskGemma = async (e) => {
    e.preventDefault();
    if (!studentQuestion.trim() || !activeExperiment) return;

    setIsInquiring(true);
    setInquiryResponse(null);
    try {
      const res = await askGemmaAboutExperiment({
        experiment_title: activeExperiment.title,
        category: activeExperiment.category,
        student_question: studentQuestion.trim(),
        difficulty: activeExperiment.difficulty,
      });
      setInquiryResponse(res);
    } catch (err) {
      setInquiryResponse({
        explanation: `Error retrieving explanation: ${err.message}`,
        takeaways: [],
        safety_guideline: 'Verify connections before proceeding.',
      });
    } finally {
      setIsInquiring(false);
    }
  };

  const filteredExperiments = experiments.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || exp.category === selectedCategory;
    const matchesDiff = selectedDifficulty === 'All' || exp.difficulty === selectedDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  return (
    <div className="experiments-layout">
      {/* Sidebar: Filters & Experiment List */}
      <div className="experiments-sidebar card">
        <div className="card-header">
          <div className="card-title-group">
            <BookOpen className="card-title-icon" size={20} />
            <div>
              <h2 className="card-title">Laboratory Library</h2>
              <p className="card-subtitle">Browse bench procedures and reference parameters</p>
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Search bar */}
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <div className="filter-group">
            <label className="field-label-sm">Difficulty</label>
            <div className="filter-pills">
              {['All', 'Beginner', 'Intermediate'].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`pill-btn ${selectedDifficulty === d ? 'pill-btn-active' : ''}`}
                  onClick={() => setSelectedDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Experiment List */}
          <div className="experiment-list">
            {loading ? (
              <p className="empty-text">Loading published experiments...</p>
            ) : filteredExperiments.length === 0 ? (
              <p className="empty-text">No experiments match the filter criteria.</p>
            ) : (
              filteredExperiments.map((exp) => {
                const isCompleted = completedIds.includes(exp.id);
                const isSelected = activeExperiment?.id === exp.id;
                return (
                  <div
                    key={exp.id}
                    className={`experiment-list-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setActiveExperiment(exp);
                      setInquiryResponse(null);
                      setStudentQuestion('');
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="item-top">
                      <span className="item-category">{exp.category}</span>
                      <span className={`diff-tag diff-${exp.difficulty.toLowerCase()}`}>
                        {exp.difficulty}
                      </span>
                    </div>
                    <h3 className="item-title">{exp.title}</h3>
                    <div className="item-footer">
                      {isCompleted ? (
                        <span className="completed-badge">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : (
                        <span className="pending-badge">Pending</span>
                      )}
                      <ChevronRight size={16} className="item-chevron" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Column: Active Experiment Details */}
      <div className="experiment-details-col">
        {activeExperiment ? (
          <div className="card exp-detail-card">
            <div className="card-header exp-detail-header">
              <div>
                <div className="detail-tags">
                  <span className="item-category">{activeExperiment.category}</span>
                  <span className={`diff-tag diff-${activeExperiment.difficulty.toLowerCase()}`}>
                    {activeExperiment.difficulty}
                  </span>
                </div>
                <h1 className="exp-heading">{activeExperiment.title}</h1>
                <p className="exp-description">{activeExperiment.description}</p>
              </div>

              <button
                type="button"
                className={`btn ${completedIds.includes(activeExperiment.id) ? 'btn-success' : 'btn-outline'}`}
                onClick={() => handleToggleComplete(activeExperiment.id)}
              >
                <CheckCircle2 size={16} />
                <span>{completedIds.includes(activeExperiment.id) ? 'Completed' : 'Mark as Completed'}</span>
              </button>
            </div>

            <div className="card-body">
              {/* Circuit Schematic Diagram */}
              {activeExperiment.circuit_diagram_svg && (
                <div className="schematic-box">
                  <h3 className="subheading">Circuit Schematic & Node Labels</h3>
                  <div
                    className="schematic-svg-container"
                    dangerouslySetInnerHTML={{ __html: activeExperiment.circuit_diagram_svg }}
                  />
                </div>
              )}

              {/* Learning Objectives */}
              <div className="detail-section">
                <h3 className="subheading">Learning Objectives</h3>
                <ul className="bullet-list">
                  {activeExperiment.learning_objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              {/* Required Components */}
              <div className="detail-section">
                <h3 className="subheading">Required Laboratory Components</h3>
                <div className="components-checklist">
                  {activeExperiment.components_required.map((comp, i) => (
                    <div key={i} className="component-chip">
                      <CheckCircle2 size={14} className="text-blue" />
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Procedure */}
              <div className="detail-section">
                <h3 className="subheading">Step-by-Step Procedure</h3>
                <ol className="ordered-steps">
                  {activeExperiment.step_by_step_procedure.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Expected Bench Readings */}
              <div className="detail-section">
                <h3 className="subheading">Expected Bench Readings (Nominal Reference)</h3>
                <div className="readings-table-box">
                  <table className="readings-table">
                    <tbody>
                      {Object.entries(activeExperiment.expected_readings).map(([key, val]) => (
                        <tr key={key}>
                          <td className="reading-key">{key.replace(/_/g, ' ').toUpperCase()}</td>
                          <td className="reading-val">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Safety Instructions */}
              <div className="detail-section section-safety">
                <div className="safety-header">
                  <ShieldAlert size={18} className="text-danger" />
                  <h3 className="subheading text-danger">Safety Precautions & Component Limits</h3>
                </div>
                <ul className="safety-list">
                  {activeExperiment.safety_instructions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Ask Gemma About This Experiment */}
              <div className="gemma-inquiry-box card">
                <div className="inquiry-header">
                  <Sparkles size={18} className="text-blue" />
                  <div>
                    <h4 className="inquiry-title">Ask Gemma 4 About This Experiment</h4>
                    <p className="inquiry-desc">
                      Request custom explanations of the procedure, formulas, or troubleshooting hints adapted to your {activeExperiment.difficulty} level.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAskGemma} className="inquiry-form">
                  <div className="inquiry-input-row">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`e.g. Why does ${activeExperiment.title.split(' ')[0]} require this specific resistor?`}
                      value={studentQuestion}
                      onChange={(e) => setStudentQuestion(e.target.value)}
                      disabled={isInquiring}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isInquiring || !studentQuestion.trim()}
                    >
                      {isInquiring ? <Sparkles size={16} className="spin-icon" /> : <Send size={16} />}
                      <span>Explain</span>
                    </button>
                  </div>
                </form>

                {inquiryResponse && (
                  <div className="inquiry-result">
                    <div className="inquiry-result-badge">
                      <Sparkles size={14} className="text-blue" />
                      <span>Gemma 4 Explanation</span>
                    </div>
                    <p className="inquiry-text">{inquiryResponse.explanation}</p>
                    {inquiryResponse.takeaways?.length > 0 && (
                      <div className="inquiry-takeaways">
                        <strong>Key Takeaways:</strong>
                        <ul>
                          {inquiryResponse.takeaways.map((t, idx) => (
                            <li key={idx}>• {t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {inquiryResponse.safety_guideline && (
                      <div className="inquiry-safety">
                        <ShieldAlert size={14} className="text-amber" />
                        <span>{inquiryResponse.safety_guideline}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card empty-diagnosis-state">
            <BookOpen size={36} className="empty-icon" />
            <h3>Select an Experiment</h3>
            <p>Select any experiment from the left directory to review objectives and procedures.</p>
          </div>
        )}
      </div>
    </div>
  );
}
