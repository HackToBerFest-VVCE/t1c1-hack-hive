# LabSense AI

LabSense AI is an AI-powered electronics laboratory assistant designed to help engineering students troubleshoot hardware faults.
Developed for the "Best Use of Gemma 4" track at Hacktoberfest (VVCE Mysuru), the tool focuses on low-voltage bench experiments.
The system captures circuit photographs, symptoms, and multimeter readings to prepare structured data for multimodal reasoning.
This repository contains the initial frontend milestone, providing an interactive staging bench ahead of Gemma 4 API integration.

---

> **Hackathon Team:** Hack Hive (`t1c1-hack-hive`) | **Event:** Hacktoberfest — VVCE Mysuru | **Track:** Best Use of Gemma 4

## 1. Problem Statement

Engineering students frequently struggle to diagnose faulty circuit connections, identify defective or misaligned components, and troubleshoot unexpected multimeter readings during laboratory experiments. Conventional lab manuals offer static schematics without interactive assistance, leading to bench bottlenecks, component burnout, and lost lab hours.

## 2. Proposed Solution

LabSense AI bridges physical workbench experiments with AI-guided troubleshooting. In subsequent development milestones, LabSense AI will connect to a multimodal Gemma 4 model via an approved API integration. It will ingest:
1. Overhead or close-up circuit photographs.
2. User-described fault symptoms and experiment context.
3. Quantified bench readings (supply voltage, measured voltage, and circuit current).
4. Reference circuit parameters and datasheets.

The planned AI engine will systematically analyze the setup to generate root-cause hypotheses, verification test steps, expected observations, corrective wiring guidance, and safety precautions.

> [!NOTE]
> **Important Milestone Notice:** In today's initial development milestone (Milestone 1), the application provides a complete, responsive frontend interface and client-side validation bench. Real multimodal Gemma 4 API integration is not yet operational and is scheduled for Milestone 2. No AI diagnoses are fabricated.

---

## 3. Technology Stack

- **Framework:** React 18 (Functional Components, Hooks)
- **Build Tool:** Vite
- **Language:** JavaScript (ES Modules)
- **Styling:** Custom CSS3 Design System (Deep Navy, Slate, and Blue Accents)
- **Iconography:** Lucide React
- **Target AI Engine (Planned):** Gemma 4 Multimodal Model (via approved API)

---

## 4. Implementation Status

### Features Currently Implemented (Milestone 1)
- **Branded Engineering Landing Page:** Sticky navigation with smooth section scrolling, challenge credentials, and responsive mobile drawer.
- **Circuit Schematic Illustration:** Native SVG/CSS electronics workbench diagram depicting LED/resistor node measurements.
- **Circuit Photo Ingestion Component:**
  - File picker and drag-and-drop support.
  - Multi-format validation: JPEG, PNG, WebP.
  - 10 MB maximum file size enforcement.
  - Responsive image preview card displaying file name and file size.
  - Replace and remove actions with automatic `URL.revokeObjectURL` memory cleanup.
- **Structured Experiment Form:**
  - Experiment category selector (LED Circuit, Resistor Circuit, Arduino Circuit, Basic Sensor Circuit, Other).
  - Required problem description with real-time character counter and validation.
  - Optional symptom and expected behavior fields.
  - Quick-load sample case for immediate evaluation and testing.
- **Experimental Measurements Bench:**
  - Dedicated numeric inputs for Supply Voltage ($V$), Measured Voltage ($V$), and Measured Current ($mA$).
  - Client-side numeric validation allowing legitimate zero values (`0.0 V`) while rejecting invalid strings or negative readings.
  - Safe handling of omitted / blank optional measurements.
- **Honest Diagnosis Results Panel:**
  - Clear empty state: *"Your troubleshooting report will appear here once Gemma 4 integration is enabled."*
  - Structured blueprint preview cards detailing the 7 planned diagnostic output sections.
  - Staged experiment summary card displaying submitted image thumbnail, telemetry readings, and problem statement upon validation.
- **How It Works Framework:** Three-stage roadmap distinguishing active client functionality from planned Gemma 4 analysis.
- **Production Build:** Fully verified zero-error production build via Vite.

### Features Planned for Subsequent Milestones
- **Milestone 2:** Gemma 4 Multimodal API connection for visual defect detection, breadboard track tracking, and prompt orchestration.
- **Milestone 3:** Dynamic 7-section diagnosis report population (Circuit Observations, Potential Faults, Supporting Evidence, Verification Tests, Expected Observations, Corrective Steps, Safety Precautions).
- **Milestone 4:** Interactive probe test walkthroughs, schematic comparison overlay, and exportable lab reports.

---

## 5. Prerequisites

- **Node.js:** v18.0.0 or higher (Tested on Node.js v22.16.0)
- **npm:** v9.0.0 or higher (Tested on npm v10.9.2)
- **Modern Web Browser:** Chrome, Edge, Firefox, or Safari

---

## 6. Installation and Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HackToBerFest-VVCE/t1c1-hack-hive.git
   cd t1c1-hack-hive
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (Optional for Milestone 1):**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Note: No API keys are required to run Milestone 1 locally).*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open the displayed URL (typically `http://localhost:5173`) in your web browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Preview the production build:**
   ```bash
   npm run preview
   ```

---

## 7. Project Structure

```
t1c1-hack-hive/
├── public/
│   ├── favicon.svg             # Custom circuit/IC favicon
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top navigation bar, brand logo & mobile drawer
│   │   ├── Hero.jsx            # Hero section with schematic benchmark illustration
│   │   ├── ImageUpload.jsx     # Image picker, drag-and-drop & file validation
│   │   ├── ExperimentForm.jsx  # Category selection, symptoms & measurements
│   │   ├── DiagnosisPanel.jsx  # Honest empty state, staged summary & planned sections
│   │   ├── HowItWorks.jsx      # 3-step workflow distinguishing current vs planned
│   │   └── Footer.jsx          # Project metadata, challenge info & safety notice
│   ├── App.jsx                 # Main application state and layout composition
│   ├── App.css                 # Engineering design system and responsive styles
│   └── main.jsx                # React root mount
├── .env.example                # Safe environment variable template
├── .gitignore                  # Git exclusions (credentials, node_modules, dist)
├── index.html                  # HTML5 entry with fonts and metadata
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite configuration with React plugin
└── README.md                   # Comprehensive project documentation
```

---

## 8. Security and Environment Variables

- **Credential Hygiene:** Never commit secrets, service account credentials, or real API keys to version control.
- **Environment Exclusions:** `.gitignore` excludes all `.env` and `.env.*` files while preserving `.env.example` as a safe placeholder template.
- **Client-Side Safety:** No backend or external network endpoints are contacted in this milestone. Images are parsed purely within browser memory, and object URLs are revoked upon replacement or reset to prevent memory leaks.
