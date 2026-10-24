import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ExperimentForm from './components/ExperimentForm';
import DiagnosisPanel from './components/DiagnosisPanel';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  const [preparedExperiment, setPreparedExperiment] = useState(null);

  const handleExperimentSubmit = (payload) => {
    setPreparedExperiment(payload);
    // Smooth scroll to diagnosis panel on smaller screens if needed
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const diagEl = document.querySelector('.diagnosis-panel');
        if (diagEl) {
          diagEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleExperimentReset = () => {
    setPreparedExperiment(null);
  };

  return (
    <div className="app-shell">
      <Header />
      
      <main id="main-content">
        <Hero />

        {/* Troubleshooting Workspace Section */}
        <section id="workspace" className="workspace-section">
          <div className="workspace-container">
            <div className="workspace-header text-center">
              <span className="workspace-eyebrow">Interactive Diagnostic Bench</span>
              <h2 className="workspace-title">Troubleshooting Workspace</h2>
              <p className="workspace-description">
                Upload your physical circuit photograph, specify the lab test conditions, and inspect the staged diagnostic report structure.
              </p>
            </div>

            <div className="workspace-grid">
              <div className="workspace-column workspace-column-form">
                <ExperimentForm 
                  onSubmitExperiment={handleExperimentSubmit}
                  onReset={handleExperimentReset}
                  isPrepared={!!preparedExperiment}
                />
              </div>

              <div className="workspace-column workspace-column-results">
                <DiagnosisPanel 
                  preparedExperiment={preparedExperiment} 
                />
              </div>
            </div>
          </div>
        </section>

        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
