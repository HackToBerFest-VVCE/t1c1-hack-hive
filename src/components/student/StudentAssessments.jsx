import React, { useState } from 'react';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { gradeSubmission } from '../../lib/api';

const BENCHMARK_TESTS = [
  {
    id: 'test-1',
    title: 'Practical Assessment: Diode Characteristics & Voltage Limits',
    description: 'Verify your understanding of semiconductor diode knee thresholds, current-limiting calculations, and safe bench operation.',
    duration_minutes: 15,
    max_attempts: 3,
    questions: [
      {
        id: 'q1',
        question_type: 'mcq',
        prompt: 'A standard red 5mm LED is powered from a 5.0V DC supply in series with a 220-Ohm resistor. If the forward voltage drop of the LED is 1.9V, what is the expected current through the circuit?',
        options: ['14.1 mA', '22.7 mA', '8.6 mA', '31.2 mA'],
        correct_answer: '14.1 mA',
        marks: 2,
        explanation: 'By KVL: V_resistor = 5.0V - 1.9V = 3.1V. By Ohm\'s Law: I = 3.1V / 220Ω = 14.09 mA ≈ 14.1 mA.',
      },
      {
        id: 'q2',
        question_type: 'mcq',
        prompt: 'What occurs if an LED is accidentally connected in reverse polarity across a 5V bench supply with a 220-Ohm series resistor?',
        options: [
          'The LED conducts maximum current and burns out immediately',
          'The LED is reverse-biased, conducts virtually zero current (~leakage only), and remains dark',
          'The series resistor absorbs all voltage and reaches 100°C',
          'The LED illuminates with half normal intensity'
        ],
        correct_answer: 'The LED is reverse-biased, conducts virtually zero current (~leakage only), and remains dark',
        marks: 2,
        explanation: 'A reverse-biased diode has very high impedance below its peak inverse breakdown voltage. Almost zero current flows, so the LED is off and no heating occurs.',
      },
      {
        id: 'q3',
        question_type: 'short_answer',
        prompt: 'Explain why a series current-limiting resistor is mandatory when connecting an LED to an ideal voltage source greater than its forward knee voltage.',
        options: [],
        correct_answer: 'Diodes have exponential I-V characteristics with minimal dynamic resistance once forward biased. Without a series resistor, excessive current will flow, causing immediate thermal runaway and junction burnout.',
        marks: 3,
        explanation: 'The exponential diode equation means tiny voltage increases cause massive current surges beyond the knee threshold. The resistor provides essential negative feedback setting safe loop current.',
      },
    ],
  },
];

export default function StudentAssessments() {
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleStartTest = (test) => {
    setActiveTest(test);
    setAnswers({});
    setTestResult(null);
  };

  const handleSelectAnswer = (qId, answer) => {
    setAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    if (!activeTest) return;

    setIsSubmitting(true);
    try {
      const submissionItems = activeTest.questions.map((q) => ({
        question_id: q.id,
        question_type: q.question_type,
        student_answer: answers[q.id] || '',
        correct_answer: q.correct_answer,
        marks: q.marks,
        explanation: q.explanation,
      }));

      const result = await gradeSubmission(submissionItems);
      setTestResult(result);
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assessments-container">
      {!activeTest ? (
        /* Test Library List */
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <FileCheck className="card-title-icon" size={20} />
              <div>
                <h2 className="card-title">Laboratory Practical Assessments</h2>
                <p className="card-subtitle">Complete instructor-published tests to evaluate your circuit comprehension</p>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="tests-grid">
              {BENCHMARK_TESTS.map((test) => (
                <div key={test.id} className="test-card">
                  <div className="test-card-top">
                    <span className="test-tag">Active Assessment</span>
                    <div className="test-time">
                      <Clock size={14} />
                      <span>{test.duration_minutes} mins</span>
                    </div>
                  </div>
                  <h3 className="test-title">{test.title}</h3>
                  <p className="test-desc">{test.description}</p>
                  <div className="test-footer">
                    <span className="question-count-pill">{test.questions.length} Questions</span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleStartTest(test)}
                    >
                      <span>Start Assessment</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Test Taking View */
        <div className="card test-session-card">
          <div className="card-header">
            <div>
              <span className="test-tag">Assessment in Progress</span>
              <h2 className="card-title">{activeTest.title}</h2>
              <p className="card-subtitle">{activeTest.description}</p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTest(null)}
            >
              Exit to Test List
            </button>
          </div>

          <div className="card-body">
            {testResult ? (
              /* Results Summary State */
              <div className="test-results-summary">
                <div className="score-hero">
                  <div className="score-badge">
                    <span className="score-num">{testResult.percentage}%</span>
                    <span className="score-label">Final Score</span>
                  </div>
                  <div className="score-meta">
                    <h3>Assessment Complete</h3>
                    <p>
                      You scored <strong>{testResult.total_score}</strong> out of <strong>{testResult.max_score}</strong> total marks.
                      Objective multiple-choice questions have been deterministically graded on the server.
                    </p>
                  </div>
                </div>

                <div className="question-results-list">
                  <h4 className="subheading">Question Review & Explanations</h4>
                  {activeTest.questions.map((q, idx) => {
                    const res = testResult.results.find((r) => r.question_id === q.id);
                    const isCorrect = res?.is_correct;
                    return (
                      <div key={q.id} className={`q-review-item ${isCorrect ? 'q-correct' : 'q-incorrect'}`}>
                        <div className="q-review-header">
                          <span className="q-num">Q0{idx + 1}</span>
                          <span className="q-status-tag">
                            {isCorrect ? (
                              <><CheckCircle2 size={14} /> Correct (+{res?.marks_awarded} marks)</>
                            ) : (
                              <><XCircle size={14} /> Incorrect (0 marks)</>
                            )}
                          </span>
                        </div>
                        <p className="q-prompt">{q.prompt}</p>
                        <div className="q-answer-compare">
                          <div>
                            <strong>Your Answer:</strong> <span>{answers[q.id] || '(No answer provided)'}</span>
                          </div>
                          <div>
                            <strong>Correct Solution:</strong> <span>{q.correct_answer}</span>
                          </div>
                        </div>
                        <p className="q-explanation">
                          <strong>Theoretical Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="results-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setAnswers({});
                      setTestResult(null);
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>Retake Assessment</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setActiveTest(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Test Questions Form */
              <form onSubmit={handleSubmitTest} className="test-form">
                {activeTest.questions.map((q, idx) => (
                  <div key={q.id} className="test-question-box">
                    <div className="q-header">
                      <span className="q-number-pill">Question 0{idx + 1}</span>
                      <span className="q-marks-pill">{q.marks} Marks</span>
                    </div>

                    <p className="q-prompt-text">{q.prompt}</p>

                    {q.question_type === 'mcq' ? (
                      <div className="mcq-options-list">
                        {q.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`mcq-option-label ${answers[q.id] === opt ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={answers[q.id] === opt}
                              onChange={() => handleSelectAnswer(q.id, opt)}
                              className="visually-hidden"
                            />
                            <span className="option-radio-indicator"></span>
                            <span className="option-text">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="short-answer-box">
                        <textarea
                          rows={3}
                          className="form-control form-textarea"
                          placeholder="Type your theoretical explanation..."
                          value={answers[q.id] || ''}
                          onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}

                <div className="test-submit-footer">
                  <button
                    type="submit"
                    className="btn btn-primary btn-submit-test"
                    disabled={isSubmitting}
                  >
                    <FileCheck size={18} />
                    <span>{isSubmitting ? 'Submitting & Grading...' : 'Submit Assessment Answers'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
