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
import StudentTroubleshoot from './StudentTroubleshoot';
import StudentExperiments from './StudentExperiments';
import StudentSimulations from './StudentSimulations';
import StudentAssessments from './StudentAssessments';
import StudentQuestions from './StudentQuestions';
import StudentProgress from './StudentProgress';

export default function StudentPortal({ initialTab = 'troubleshoot' }) {
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
