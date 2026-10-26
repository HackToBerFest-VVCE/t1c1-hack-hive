import React, { useState } from 'react';
import {
  Cpu,
  BookOpen,
  Sliders,
  FileCheck,
  MessageSquare,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StudentTroubleshoot from './StudentTroubleshoot';
import StudentExperiments from './StudentExperiments';
import StudentSimulations from './StudentSimulations';
import StudentAssessments from './StudentAssessments';
import StudentQuestions from './StudentQuestions';
import StudentProgress from './StudentProgress';

export default function StudentPortal({ initialTab = 'troubleshoot' }) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'troubleshoot', label: 'AI Circuit Troubleshooting', icon: Cpu },
    { id: 'experiments', label: 'Experiment Library', icon: BookOpen },
    { id: 'simulations', label: 'Circuit Simulations', icon: Sliders },
    { id: 'assessments', label: 'My Assessments', icon: FileCheck },
    { id: 'questions', label: 'Ask an Instructor', icon: MessageSquare },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
  ];

  return (
    <div className="portal-container student-portal">
      {/* Student Identity & Institution Enrollment Banner */}
      <div className="student-scope-banner">
        <div className="scope-banner-left">
          <div className="student-badge-box">
            <GraduationCap size={22} className="text-blue" />
          </div>
          <div>
            <div className="scope-title-row">
              <span className="student-name">{profile?.full_name || 'Alex Morgan'}</span>
              <span className="student-usn-pill">{profile?.usn || '4VV21EC042'}</span>
              <span className="student-sem-pill">{profile?.semester || '6th Semester'}</span>
            </div>
            <p className="student-meta-line">
              {profile?.institution || 'Vidyavardhaka College of Engineering'} • Code: <strong>{profile?.institution_code || 'LSAI-VVCE-A7K2'}</strong>
            </p>
          </div>
        </div>

        <div className="scope-banner-right">
          <div className="enrolled-subjects-box">
            <span className="enrolled-label">ENROLLED LAB COURSES:</span>
            <div className="enrolled-pills">
              <span className="enrolled-pill">Analog Electronics</span>
              <span className="enrolled-pill">Digital Logic</span>
              <span className="enrolled-pill">Microcontrollers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div className="portal-subnav">
        <div className="subnav-header">
          <div className="portal-badge student-badge">
            <GraduationCap size={16} />
            <span>Student Learning Portal</span>
          </div>
        </div>

        <nav className="portal-tabs" aria-label="Student Portal Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`portal-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab Content */}
      <div className="portal-content">
        {activeTab === 'troubleshoot' && <StudentTroubleshoot />}
        {activeTab === 'experiments' && <StudentExperiments />}
        {activeTab === 'simulations' && <StudentSimulations />}
        {activeTab === 'assessments' && <StudentAssessments />}
        {activeTab === 'questions' && <StudentQuestions />}
        {activeTab === 'progress' && <StudentProgress onNavigateTab={(tab) => setActiveTab(tab)} />}
      </div>
    </div>
  );
}
