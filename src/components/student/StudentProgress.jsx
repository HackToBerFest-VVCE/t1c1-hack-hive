import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  FileCheck,
  MessageSquare,
  Activity,
  Award,
  Cpu,
  ChevronRight,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentProgress({ onNavigateTab }) {
  const { profile } = useAuth();

  const studentName = profile?.full_name || 'Alex Morgan';

  const completedExperiments = [
    {
      id: 'exp-1',
      code: 'EXP-01',
      title: 'Inverting Operational Amplifier (Closed Loop Gain)',
      date: 'Oct 24, 2026',
      status: 'Verified by Instructor',
      score: '10/10',
      benchCheck: 'Gain matched theoretical Rf/Rin within 2.4%',
    },
    {
      id: 'exp-2',
      code: 'EXP-02',
      title: 'Full-Wave Bridge Rectifier with Capacitive Filter',
      date: 'Oct 25, 2026',
      status: 'Verified by Instructor',
      score: '9.5/10',
      benchCheck: 'Peak inverse voltage and ripple factor within nominal limits',
    },
  ];

  const inProgressExperiments = [
    {
      id: 'exp-3',
      code: 'EXP-03',
      title: '555 Timer Astable Multivibrator Frequency Synthesis',
      startedDate: 'Oct 26, 2026',
      status: 'In Progress (Hardware Staged)',
      currentStep: 'Step 4: Capacitor charge timing measurement via oscilloscope',
    },
  ];

  const assessmentsTaken = [
    {
      id: 'test-1',
      title: 'Diode Characteristics, Rectification & Voltage Limits',
      date: 'Oct 25, 2026',
      score: '85%',
      result: 'Passed',
      correctCount: '17/20',
      feedback: 'Strong grasp of diode forward knee voltage and reverse breakdown concepts.',
    },
  ];

  const activeTickets = [
    {
      id: 't-104',
      title: 'Measuring Op-Amp Offset Null on Breadboard',
      category: 'Hardware Inquiry',
      submittedAt: 'Today at 14:15',
      status: 'Under Review',
      instructor: 'Dr. Sharma',
    },
  ];

  return (
    <div className="student-progress-layout">
      {/* Student Profile & Overview Banner */}
      <div className="section-toolbar card">
        <div className="toolbar-info">
          <TrendingUp size={22} className="text-blue" />
          <div>
            <h2 className="toolbar-title">Laboratory Learning Progress</h2>
            <p className="toolbar-subtitle">
              Comprehensive record of practical bench sign-offs, assessment scores, and AI diagnostic sessions for {studentName}
            </p>
          </div>
        </div>
        <div className="status-pill status-pill-ready">
          <span className="dot dot-active"></span>
          <span>Active Lab Term 2026</span>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="metrics-summary-grid">
        <div className="metric-card card">
          <div className="metric-icon-box bg-blue">
            <BookOpen size={22} className="text-white" />
          </div>
          <div>
            <span className="metric-stat-label">Experiments Completed</span>
            <h3 className="metric-stat-num">2 / 3</h3>
            <span className="metric-stat-sub">67% Curriculum Completion</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-box bg-green">
            <Award size={22} className="text-white" />
          </div>
          <div>
            <span className="metric-stat-label">Assessment Average</span>
            <h3 className="metric-stat-num">85.0%</h3>
            <span className="metric-stat-sub">1 Graded Quiz Passed</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-box bg-indigo">
            <Cpu size={22} className="text-white" />
          </div>
          <div>
            <span className="metric-stat-label">AI Diagnostic Bench Runs</span>
            <h3 className="metric-stat-num">4</h3>
            <span className="metric-stat-sub">Circuits Analyzed</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-box bg-amber">
            <MessageSquare size={22} className="text-white" />
          </div>
          <div>
            <span className="metric-stat-label">Active Tickets</span>
            <h3 className="metric-stat-num">1</h3>
            <span className="metric-stat-sub">Under Instructor Review</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Progress Grid */}
      <div className="progress-details-grid">
        {/* Left Column: Experiments Tracking */}
        <div className="progress-col-main">
          {/* Active / In-Progress Lab */}
          <div className="card progress-section-card">
            <div className="card-header">
              <div className="card-title-group">
                <Clock size={20} className="text-amber" />
                <div>
                  <h3 className="card-title">Currently In Progress</h3>
                  <p className="card-subtitle">Resume your active physical hardware experiment</p>
                </div>
              </div>
            </div>

            <div className="card-body">
              {inProgressExperiments.map((exp) => (
                <div key={exp.id} className="active-exp-banner">
                  <div className="active-exp-header">
                    <span className="active-exp-code">{exp.code}</span>
                    <span className="status-pill status-pill-ready">{exp.status}</span>
                  </div>
                  <h4 className="active-exp-title">{exp.title}</h4>
                  <p className="active-exp-step">{exp.currentStep}</p>
                  <div className="active-exp-actions">
                    {onNavigateTab && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onNavigateTab('experiments')}
                      >
                        <BookOpen size={16} />
                        <span>Open Experiment Guide</span>
                      </button>
                    )}
                    {onNavigateTab && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onNavigateTab('simulations')}
                      >
                        <Sliders size={16} />
                        <span>Simulate 555 Timer</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Experiments Log */}
          <div className="card progress-section-card">
            <div className="card-header">
              <div className="card-title-group">
                <CheckCircle2 size={20} className="text-green" />
                <div>
                  <h3 className="card-title">Completed Laboratory Modules</h3>
                  <p className="card-subtitle">Verified physical breadboard circuits and signed reports</p>
                </div>
              </div>
            </div>

            <div className="card-body">
              <div className="completed-experiments-list">
                {completedExperiments.map((exp) => (
                  <div key={exp.id} className="completed-exp-item">
                    <div className="completed-exp-top">
                      <div className="completed-code-group">
                        <span className="completed-code">{exp.code}</span>
                        <span className="completed-title">{exp.title}</span>
                      </div>
                      <span className="completed-grade">{exp.score}</span>
                    </div>
                    <p className="completed-note">{exp.benchCheck}</p>
                    <div className="completed-meta">
                      <span className="completed-date">Signed off: {exp.date}</span>
                      <span className="completed-status-tag">
                        <CheckCircle2 size={13} className="text-green" />
                        {exp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assessments & Support Tickets */}
        <div className="progress-col-side">
          {/* Assessment Record */}
          <div className="card progress-section-card">
            <div className="card-header">
              <div className="card-title-group">
                <FileCheck size={20} className="text-blue" />
                <div>
                  <h3 className="card-title">Objective Assessments</h3>
                  <p className="card-subtitle">Automated theoretical evaluations</p>
                </div>
              </div>
            </div>

            <div className="card-body">
              {assessmentsTaken.map((ass) => (
                <div key={ass.id} className="assessment-record-box">
                  <div className="assessment-record-top">
                    <h4 className="assessment-record-title">{ass.title}</h4>
                    <span className="score-badge score-badge-pass">{ass.score}</span>
                  </div>
                  <div className="assessment-record-meta">
                    <span>Date: {ass.date}</span>
                    <span>Result: <strong>{ass.result} ({ass.correctCount})</strong></span>
                  </div>
                  <p className="assessment-record-feedback">{ass.feedback}</p>
                </div>
              ))}

              {onNavigateTab && (
                <button
                  type="button"
                  className="btn btn-secondary btn-block mt-3"
                  onClick={() => onNavigateTab('assessments')}
                >
                  <FileCheck size={16} />
                  <span>Take Available Assessments</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Instructor Support Tickets */}
          <div className="card progress-section-card">
            <div className="card-header">
              <div className="card-title-group">
                <MessageSquare size={20} className="text-blue" />
                <div>
                  <h3 className="card-title">Instructor Inquiries</h3>
                  <p className="card-subtitle">Active questions submitted to faculty</p>
                </div>
              </div>
            </div>

            <div className="card-body">
              {activeTickets.map((tk) => (
                <div key={tk.id} className="ticket-record-box">
                  <div className="ticket-record-top">
                    <span className="ticket-id-tag">{tk.id}</span>
                    <span className="status-pill status-pill-ready">{tk.status}</span>
                  </div>
                  <h4 className="ticket-record-title">{tk.title}</h4>
                  <div className="ticket-record-footer">
                    <span>Assigned: {tk.instructor}</span>
                    <span>{tk.submittedAt}</span>
                  </div>
                </div>
              ))}

              {onNavigateTab && (
                <button
                  type="button"
                  className="btn btn-secondary btn-block mt-3"
                  onClick={() => onNavigateTab('questions')}
                >
                  <MessageSquare size={16} />
                  <span>Ask a New Question</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
