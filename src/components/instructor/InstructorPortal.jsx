import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  MessageSquare,
  FileCheck,
  TrendingUp,
  Lock,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InstructorExperiments from './InstructorExperiments';
import InstructorQuestions from './InstructorQuestions';
import InstructorTests from './InstructorTests';
import InstructorProgress from './InstructorProgress';
import StudentSimulations from '../student/StudentSimulations';
import AuthModal from '../AuthModal';
import { Sliders } from 'lucide-react';

export default function InstructorPortal({ initialTab = 'experiments' }) {
  const { isInstructor, role, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'experiments', label: 'Experiment Designer', icon: BookOpen },
    { id: 'questions', label: 'Student Question Inbox', icon: MessageSquare },
    { id: 'simulations', label: 'Circuit Simulations', icon: Sliders },
    { id: 'tests', label: 'Test Designer', icon: FileCheck },
    { id: 'progress', label: 'Student Progress', icon: TrendingUp },
  ];

  // If user is currently viewing in student demo role
  if (!isInstructor) {
    return (
      <div className="portal-container instructor-restricted-container">
        <div className="card restricted-card">
          <div className="restricted-icon-box">
            <ShieldCheck size={36} className="text-blue" />
          </div>
          <h2 className="restricted-title">Instructor & Faculty Demonstration Mode</h2>
          <p className="restricted-desc">
            You are currently exploring as <strong>Student ({role})</strong>. The Instructor Portal provides faculty tools to author multi-step laboratory procedures, draft automated quiz questions, answer student diagnostic questions, and monitor cohort progress.
          </p>
          <div className="demonstration-notice-pill">
            <span>Frontend Preview Mode • No passcode required for evaluation</span>
          </div>
          <div className="restricted-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => switchDemoRole('instructor')}
            >
              <ShieldCheck size={18} />
              <span>Switch to Instructor View (Dr. Sharma)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-container instructor-portal">
      {/* Sub-navigation bar */}
      <div className="portal-subnav">
        <div className="subnav-header">
          <div className="portal-badge instructor-badge">
            <ShieldCheck size={16} />
            <span>Instructor Portal & Authoring Bench</span>
          </div>
        </div>

        <nav className="portal-tabs" aria-label="Instructor Portal Navigation">
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

      {/* Tab Content */}
      <div className="portal-content">
        {activeTab === 'experiments' && <InstructorExperiments />}
        {activeTab === 'questions' && <InstructorQuestions />}
        {activeTab === 'simulations' && <StudentSimulations />}
        {activeTab === 'tests' && <InstructorTests />}
        {activeTab === 'progress' && <InstructorProgress />}
      </div>
    </div>
  );
}
