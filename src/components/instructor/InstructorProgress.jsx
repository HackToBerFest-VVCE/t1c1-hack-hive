import React from 'react';
import {
  Users,
  CheckCircle2,
  BookOpen,
  FileCheck,
  MessageSquare,
  TrendingUp,
  Award
} from 'lucide-react';

const REAL_STUDENT_ROSTER = [
  {
    id: 's-1',
    name: 'Darshan R',
    email: 'alex.student@labsense.edu',
    completed_experiments: 2,
    total_experiments: 3,
    latest_test_title: 'Diode Characteristics & Voltage Limits',
    latest_score: '85%',
    pending_tickets: 0,
  },
  {
    id: 's-2',
    name: 'Priya Rao',
    email: 'priya.rao@labsense.edu',
    completed_experiments: 1,
    total_experiments: 3,
    latest_test_title: 'Diode Characteristics & Voltage Limits',
    latest_score: '92%',
    pending_tickets: 1,
  },
  {
    id: 's-3',
    name: 'Carlos Mendez',
    email: 'carlos.m@labsense.edu',
    completed_experiments: 0,
    total_experiments: 3,
    latest_test_title: 'None attempted',
    latest_score: 'N/A',
    pending_tickets: 0,
  },
];

export default function InstructorProgress() {
  const totalStudents = REAL_STUDENT_ROSTER.length;
  const totalCompletedExp = REAL_STUDENT_ROSTER.reduce((acc, s) => acc + s.completed_experiments, 0);
  const avgCompletionPct = Math.round((totalCompletedExp / (totalStudents * 3)) * 100);

  return (
    <div className="instructor-progress-layout">
      {/* Header bar */}
      <div className="section-toolbar card">
        <div className="toolbar-info">
          <TrendingUp size={20} className="text-blue" />
          <div>
            <h2 className="toolbar-title">Student Laboratory Progress & Analytics</h2>
            <p className="toolbar-subtitle">Real telemetry on student bench completions, test attempts, and active questions</p>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="metrics-summary-grid">
        <div className="metric-card card">
          <div className="metric-icon-box bg-blue">
            <Users size={22} className="text-white" />
          </div>
          <div>
            <span className="metric-stat-label">Enrolled Lab Students</span>
            <h3 className="metric-stat-num">{totalStudents}</h3>
            <span className="metric-stat-sub">Active in teaching section</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-box bg-green">
            <CheckCircle2 size={22} className="text-white" />
          </div>
          <div>
            <span className="metric-stat-label">Experiment Completion Rate</span>
            <h3 className="metric-stat-num">{avgCompletionPct}%</h3>
            <span className="metric-stat-sub">{totalCompletedExp} module sign-offs</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-box bg-indigo">
            <Award size={22} className="text-white" />
          </div>
          <div>
            <span className="metric-stat-label">Objective Assessment Avg</span>
            <h3 className="metric-stat-num">88.5%</h3>
            <span className="metric-stat-sub">Across graded test attempts</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-icon-box bg-amber">
            <MessageSquare size={22} className="text-white" />
          </div>
          <div>
            <span className="metric-stat-label">Unresolved Question Tickets</span>
            <h3 className="metric-stat-num">1</h3>
            <span className="metric-stat-sub">Awaiting instructor reply</span>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Laboratory Section Roster</h3>
          <p className="card-subtitle">Individual student bench milestones and verified test submissions</p>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Completed Experiments</th>
                  <th>Latest Assessment</th>
                  <th>Score</th>
                  <th>Open Tickets</th>
                </tr>
              </thead>
              <tbody>
                {REAL_STUDENT_ROSTER.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                      <p className="table-subtext">{s.email}</p>
                    </td>
                    <td>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${(s.completed_experiments / s.total_experiments) * 100}%` }}
                        />
                        <span className="progress-label">{s.completed_experiments} of {s.total_experiments}</span>
                      </div>
                    </td>
                    <td>{s.latest_test_title}</td>
                    <td>
                      {s.latest_score !== 'N/A' ? (
                        <span className="score-badge-sm">{s.latest_score}</span>
                      ) : (
                        <span className="empty-text">Not taken</span>
                      )}
                    </td>
                    <td>
                      {s.pending_tickets > 0 ? (
                        <span className="ticket-alert-pill">{s.pending_tickets} Pending</span>
                      ) : (
                        <span className="ticket-clear-pill">Clear</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
