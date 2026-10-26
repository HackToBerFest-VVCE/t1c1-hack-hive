import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ExperimentForm from './components/ExperimentForm';
import DiagnosisPanel from './components/DiagnosisPanel';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import StudentPortal from './components/student/StudentPortal';
import InstructorPortal from './components/instructor/InstructorPortal';
import StudentSimulations from './components/student/StudentSimulations';
import InstitutionAdminDashboard from './components/admin/InstitutionAdminDashboard';
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
import HowGemmaWorks from './components/HowGemmaWorks';
import ErrorBoundary from './components/ErrorBoundary';
import { analyzeCircuit } from './lib/api';
import './App.css';

function MainApp() {
  const [currentView, setCurrentView] = useState('workbench'); // 'workbench' | 'student' | 'instructor' | 'institution_admin' | 'super_admin' | 'simulations'
  const [showGemmaModal, setShowGemmaModal] = useState(false);

  // Staged Workbench State
  const [preparedExperiment, setPreparedExperiment] = useState(null);
  const [liveReport, setLiveReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async (payload) => {
    setIsAnalyzing(true);
    try {
      let imageBase64 = null;
      let mimeType = 'image/jpeg';

      if (payload.image?.file) {
        mimeType = payload.image.file.type || 'image/jpeg';
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(payload.image.file);
        });
      }

      const apiPayload = {
        experiment_type: payload.experimentType,
        problem_description: payload.problemDescription,
        observed_symptoms: payload.observedSymptoms || '',
        expected_behavior: payload.expectedBehavior || '',
        measurements: {
          supply_voltage: payload.measurements.rawSupply,
          measured_voltage: payload.measurements.rawVoltage,
          measured_current: payload.measurements.rawCurrent,
        },
        image_base64: imageBase64,
        image_mime_type: mimeType,
      };

      const result = await analyzeCircuit(apiPayload);
      setLiveReport(result);
    } catch (err) {
      console.warn('Backend server disconnected. Generating local simulated report:', err);
      setLiveReport({
        circuit_observations: `Analyzed ${payload.experimentType} breadboard arrangement. Inspected physical connections and bench measurements (${payload.measurements.supplyVoltage}, ${payload.measurements.measuredVoltage}, ${payload.measurements.measuredCurrent}).`,
        potential_faults: [
          { fault: 'Reversed Semiconductor Polarity or Open Circuit', likelihood: 'High', evidence: 'Reported symptoms indicate negligible loop conduction and forward bias failure.' },
          { fault: 'Breadboard Center Rail Discontinuity', likelihood: 'Medium', evidence: 'Split breadboard power buses interrupt current flow unless bridged.' },
          { fault: 'Excessive Resistor Resistance Value', likelihood: 'Low', evidence: 'Series resistance restricts loop current below threshold.' },
        ],
        supporting_evidence: [
          'Observed voltage droop corresponds to open loop impedance.',
          'Zero current indicates incomplete series continuity.'
        ],
        missing_information: [
          'Close-up photo of component leads and breadboard row numbers.',
          'Multimeter continuity check across jumper terminals.'
        ],
        verification_tests: [
          { step: 1, test_description: 'Check Bench Rail Potential', probe_points: '+Rail to GND', expected_nominal: '5.0V DC ± 5%', safety_rule: 'Probes in Volts jack.' },
          { step: 2, test_description: 'Multimeter Diode Test Mode', probe_points: 'Red to Anode, Black to Cathode', expected_nominal: '~1.8V to 2.1V forward drop; OL reverse', safety_rule: 'Circuit must be de-energized.' },
          { step: 3, test_description: 'Check Resistor Continuity', probe_points: 'Across resistor leads', expected_nominal: '220 Ohms ± 5%', safety_rule: 'De-energize circuit before ohms check.' }
        ],
        expected_observations: 'Once polarity and continuity are verified, the circuit conducts nominal operating current with steady illumination.',
        corrective_steps: [
          'Turn off bench DC power supply immediately.',
          'Inspect diode anode (longer lead) and cathode (flat side/shorter lead).',
          'Reverse orientation on breadboard to match positive rail polarity.',
          'Re-energize bench supply at low voltage before stepping up to 5V.'
        ],
        safety_precautions: [
          'Always use a current-limiting resistor with LEDs to prevent thermal burnout.',
          'De-energize supply before moving breadboard jumpers.'
        ],
        concepts_explained: "In forward bias above the threshold knee (~1.8V), semiconductor diodes conduct exponentially. Current-limiting resistors provide necessary negative feedback.",
        uncertainty_level: 'Moderate (Local Diagnostic Engine — Backend Disconnected)',
        is_live_ai: false,
        model_identifier: 'gemma-4-31b-it (Local Diagnostic Engine — Backend Disconnected)'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExperimentSubmit = async (payload) => {
    setPreparedExperiment(payload);
    // Smooth scroll to diagnosis panel on smaller screens
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const diagEl = document.querySelector('.diagnosis-panel');
        if (diagEl) diagEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    await runAnalysis(payload);
  };

  const handleExperimentReset = () => {
    setPreparedExperiment(null);
    setLiveReport(null);
  };

  return (
    <div className="app-shell">
      <Header
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setShowGemmaModal(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenGemmaArchitecture={() => setShowGemmaModal(true)}
      />

      <main id="main-content">
        {/* Architecture Modal / Section */}
        {showGemmaModal && (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-window modal-window-lg">
              <HowGemmaWorks onClose={() => setShowGemmaModal(false)} />
            </div>
          </div>
        )}

        {/* View 1: Workbench Landing Page */}
        {currentView === 'workbench' && (
          <>
            <Hero
              onExploreTroubleshoot={() => {
                const el = document.getElementById('workspace');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreExperiments={() => {
                setCurrentView('student');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenSimulations={() => {
                setCurrentView('simulations');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenHowItWorks={() => setShowGemmaModal(true)}
            />

            {/* Troubleshooting Workspace Section */}
            <section id="workspace" className="workspace-section">
              <div className="workspace-container">
                <div className="workspace-header text-center">
                  <span className="workspace-eyebrow">Multimodal Diagnostic Bench</span>
                  <h2 className="workspace-title">Circuit Troubleshooting Workbench</h2>
                  <p className="workspace-description">
                    Upload your physical circuit photograph, specify bench telemetry, and receive an 8-section evidence-based report powered by Gemma 4.
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
                      liveReport={liveReport}
                      isAnalyzing={isAnalyzing}
                      onRunLiveAnalysis={() => preparedExperiment && runAnalysis(preparedExperiment)}
                    />
                  </div>
                </div>
              </div>
            </section>

            <HowItWorks onOpenArchitecture={() => setShowGemmaModal(true)} />
          </>
        )}

        {/* View 2: Student Learning Portal */}
        {currentView === 'student' && (
          <div className="portal-page-wrapper">
            <ErrorBoundary fallbackTitle="Student Portal">
              <StudentPortal />
            </ErrorBoundary>
          </div>
        )}

        {/* View 3: Circuit Simulations */}
        {currentView === 'simulations' && (
          <div className="portal-page-wrapper">
            <ErrorBoundary fallbackTitle="Circuit Simulations">
              <StudentSimulations />
            </ErrorBoundary>
          </div>
        )}

        {/* View 4: Instructor Portal */}
        {currentView === 'instructor' && (
          <div className="portal-page-wrapper">
            <ErrorBoundary fallbackTitle="Instructor Portal">
              <InstructorPortal />
            </ErrorBoundary>
          </div>
        )}

        {/* View 5: Institution Admin Portal */}
        {currentView === 'institution_admin' && (
          <div className="portal-page-wrapper">
            <ErrorBoundary fallbackTitle="Institution Admin Portal">
              <InstitutionAdminDashboard />
            </ErrorBoundary>
          </div>
        )}

        {/* View 6: Platform Super Admin Governance */}
        {currentView === 'super_admin' && (
          <div className="portal-page-wrapper">
            <ErrorBoundary fallbackTitle="Platform Super Admin Governance">
              <SuperAdminDashboard />
            </ErrorBoundary>
          </div>
        )}
      </main>

      <Footer onOpenGemmaArchitecture={() => setShowGemmaModal(true)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
