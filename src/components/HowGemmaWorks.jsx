import React from 'react';
import {
  Sparkles,
  Eye,
  Cpu,
  MessageSquare,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  HelpCircle,
  Calculator,
  Database
} from 'lucide-react';

export default function HowGemmaWorks({ onClose }) {
  return (
    <div className="gemma-architecture-panel card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="logo-icon-wrapper">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="card-title">How LabSense AI Uses Gemma 4</h2>
            <p className="card-subtitle">
              Deep, honest AI integration: Multimodal vision, evidence-based troubleshooting, simulation tutoring, and instructor co-pilot
            </p>
          </div>
        </div>

        {onClose && (
          <button type="button" className="btn-action" onClick={onClose}>
            Back to Workspace
          </button>
        )}
      </div>

      <div className="card-body">
        {/* Core Intelligence Pillar Grid */}
        <div className="gemma-pillars-grid">
          {/* Pillar 1: Multimodal Vision */}
          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Eye size={24} className="text-blue" />
            </div>
            <h3 className="pillar-title">1. Multimodal Circuit Perception</h3>
            <p className="pillar-desc">
              Gemma 4 ingests high-resolution bench photos alongside live multimeter telemetry (supply voltage Vin, node voltage Vnode, circuit current Imeas) and student symptom descriptions.
            </p>
            <ul className="pillar-list">
              <li>Identifies breadboard row coordinates, component orientation, and wire color paths.</li>
              <li>Detects reversed polarity (e.g. diode cathode vs anode), cold solder joints, and unbridged split power rails.</li>
              <li>Distinguishes empirical visual facts from speculative diagnoses.</li>
            </ul>
          </div>

          {/* Pillar 2: Evidence-Based Troubleshooting */}
          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Layers size={24} className="text-blue" />
            </div>
            <h3 className="pillar-title">2. Evidence-Based Troubleshooting</h3>
            <p className="pillar-desc">
              Instead of producing arbitrary conversational chat, Gemma 4 systematically synthesizes an 8-section laboratory fault report.
            </p>
            <ul className="pillar-list">
              <li>Correlates meter telemetry with physical failure modes.</li>
              <li>Explicitly flags missing information before making strong diagnostic assertions.</li>
              <li>Generates safe, guided multimeter probe verification steps.</li>
            </ul>
          </div>

          {/* Pillar 3: Simulation Tutoring */}
          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Cpu size={24} className="text-blue" />
            </div>
            <h3 className="pillar-title">3. Interactive Simulation Tutoring</h3>
            <p className="pillar-desc">
              Gemma 4 acts as an interactive lab demonstrator for educational circuit models (LED-Resistor, Ohm's Law, Voltage Divider, Sensor).
            </p>
            <ul className="pillar-list">
              <li>Explains <em>why</em> circuit voltages and currents shift when student moves sliders.</li>
              <li>Uncovers common misconceptions (e.g. current being "consumed" in a series loop).</li>
              <li>Highlights physical bench differences (component tolerances, thermal resistance drift).</li>
            </ul>
          </div>

          {/* Pillar 4: Instructor Co-Pilot */}
          <div className="pillar-card">
            <div className="pillar-icon-box">
              <MessageSquare size={24} className="text-blue" />
            </div>
            <h3 className="pillar-title">4. Instructor Co-Pilot & Authoring</h3>
            <p className="pillar-desc">
              Assists faculty members by analyzing student help tickets and generating draft guidance with a human in the loop.
            </p>
            <ul className="pillar-list">
              <li>Drafts encouraging diagnostic replies with probe suggestions for student questions.</li>
              <li>Assists professors in drafting objective multiple-choice and short-answer lab test items.</li>
              <li>The instructor always reviews, edits, and approves content before release.</li>
            </ul>
          </div>
        </div>

        {/* System Boundary Matrix: AI vs Deterministic Logic */}
        <div className="boundary-matrix-container">
          <div className="matrix-header">
            <ShieldCheck size={20} className="text-blue" />
            <div>
              <h3 className="matrix-title">System Architecture: Strict Separation of Responsibilities</h3>
              <p className="matrix-subtitle">
                Clear boundaries between Gemma 4 probabilistic reasoning, deterministic physical math, and Supabase database security.
              </p>
            </div>
          </div>

          <div className="matrix-grid">
            <div className="matrix-col matrix-col-gemma">
              <div className="col-header">
                <Sparkles size={18} className="text-blue" />
                <h4>Gemma 4 Multimodal Intelligence Layer</h4>
              </div>
              <ul className="matrix-list">
                <li><CheckCircle2 size={16} className="text-green" /> Breadboard visual defect recognition</li>
                <li><CheckCircle2 size={16} className="text-green" /> Fault hypothesis formulation and ranked likelihoods</li>
                <li><CheckCircle2 size={16} className="text-green" /> Interactive multi-turn follow-up answers</li>
                <li><CheckCircle2 size={16} className="text-green" /> Pedagogical explanations of electronics theory</li>
                <li><CheckCircle2 size={16} className="text-green" /> Drafting suggested responses for instructors</li>
                <li><CheckCircle2 size={16} className="text-green" /> Drafting assessment questions and answer rationales</li>
              </ul>
            </div>

            <div className="matrix-col matrix-col-deterministic">
              <div className="col-header">
                <Calculator size={18} className="text-amber" />
                <h4>Deterministic Python & Supabase Engine</h4>
              </div>
              <ul className="matrix-list">
                <li><CheckCircle2 size={16} className="text-green" /> <strong>Physics Math:</strong> Exact calculation of $I = V/R$, voltage division, power dissipation</li>
                <li><CheckCircle2 size={16} className="text-green" /> <strong>Assessment Grading:</strong> Server-side deterministic grading of MCQs without AI hallucination</li>
                <li><CheckCircle2 size={16} className="text-green" /> <strong>Authentication:</strong> Supabase Auth and JWT session verification</li>
                <li><CheckCircle2 size={16} className="text-green" /> <strong>Authorization:</strong> Supabase Row-Level Security (RLS) enforcing student privacy</li>
                <li><CheckCircle2 size={16} className="text-green" /> <strong>Role Protection:</strong> Cryptographic invite verification preventing self-promoted instructors</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Model Verification Details */}
        <div className="verified-model-callout">
          <div className="callout-heading">
            <Cpu size={18} className="text-blue" />
            <span>Verified Integration Architecture: <code>gemma-4-31b-it</code></span>
          </div>
          <p className="callout-body">
            LabSense AI connects to Google's hosted <strong>Gemma 4 31B Instruction-Tuned (<code>gemma-4-31b-it</code>)</strong> model
            via the official <code>google-genai</code> Python SDK on the secure FastAPI backend.
            All API keys remain strictly on the server and are never exposed to browser bundles.
            When run in an offline development environment without live keys, our deterministic heuristic pipeline generates
            schema-conforming reports to facilitate seamless local testing.
          </p>
        </div>
      </div>
    </div>
  );
}
