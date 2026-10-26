# LabSense AI — Multimodal AI-Powered Electronics Laboratory Learning Platform

[![Hacktoberfest](https://img.shields.io/badge/Event-Hacktoberfest_VVCE_Mysuru-0284c7.svg)](https://github.com/HackToBerFest-VVCE/t1c1-hack-hive)
[![Challenge Track](https://img.shields.io/badge/Track-Best_Use_of_Gemma_4-38bdf8.svg)](https://github.com/HackToBerFest-VVCE/t1c1-hack-hive)
[![Frontend](https://img.shields.io/badge/Frontend-React_18_%7C_Vite_6-61dafb.svg)](https://react.dev/)
[![Styling](https://img.shields.io/badge/Styling-Custom_Navy_Design_System-0b1329.svg)](file:///D:/LabSense%20AI/src/App.css)
[![Build Status](https://img.shields.io/badge/Build-Passing-10b981.svg)](file:///D:/LabSense%20AI/dist/)

LabSense AI is an AI-powered electronics laboratory learning platform designed to help engineering students investigate circuit faults, understand experimental results, and master systematic troubleshooting on physical hardware breadboards.

Developed for the **"Best Use of Gemma 4"** track at Hacktoberfest (VVCE Mysuru), the platform provides distinct portals for students and instructors, interactive circuit simulations, an experiment curriculum library, and an evidence-based circuit diagnosis workbench.

---

## 1. Problem Statement

Undergraduate engineering students frequently encounter obstacles when troubleshooting physical circuits on laboratory breadboards:
- **Difficult Fault Localization:** Misplaced jumper wires, inverted polarity components (diodes, LEDs, electrolytic capacitors), or IC pin miscounts are hard to detect from static manuals.
- **Ambiguous Multimeter Telemetry:** Students often cannot distinguish between expected voltage drops and fault-induced anomalies.
- **Hardware Burnout & Safety Risks:** Overcurrent conditions and missing current-limiting resistors lead to burnt components and lost bench time.
- **Instructor Bottlenecks:** A single laboratory instructor must supervise 30–60 students simultaneously, creating delays in verifying experimental steps and signing off reports.

---

## 2. Project Overview & Solution

LabSense AI bridges physical breadboard work with AI-guided troubleshooting. Students upload a photograph of their physical circuit, input their observed symptoms and bench telemetry (supply voltage, measured voltage, circuit current), and receive an 8-section evidence-based diagnostic report powered by Gemma 4 multimodal reasoning principles.

The platform provides two primary user experiences:
1. **Student Learning Portal:** Circuit troubleshooting, experiment curriculum library, interactive physical simulations, theoretical assessments, faculty inquiry submissions, and verified lab progress tracking.
2. **Instructor & Faculty Portal:** Curriculum experiment designer, student question inbox, classroom demonstration simulations, assessment test authoring, and student cohort progress monitoring.

> [!NOTE]
> **Implementation Status & Demonstration Mode:**
> This repository contains the complete frontend platform with working client-side navigation, interactive physics simulations, and a local deterministic diagnostic engine that simulates Gemma 4 troubleshooting outputs when the backend is offline. Live Gemma 4 API calls and remote Supabase persistence are planned for subsequent integration milestones.

---

## 3. Main Features

- **Professional Engineering Design System:** Deep-navy background (`#070d1e`), high-contrast readable typography (17–18px body, 40–48px hero), transparent cyan navigation (`#38bdf8`), and responsive layouts across desktop, tablet, and mobile.
- **Multimodal Circuit Troubleshooting Workbench:** File ingestion supporting JPEG, PNG, and WebP formats up to 10 MB, telemetry input validation, and real-time report generation.
- **8-Section Diagnostic Report:** Systematic engineering feedback covering physical layout observations, potential faults with likelihood ratings, supporting evidence, step-by-step verification tests, expected results, corrective wiring actions, and hardware safety rules.
- **Dual Role Access:** Instant role switcher modal allowing seamless evaluation between Student and Instructor modes without requiring passcodes in demonstration mode.
- **Local Simulation Fallback:** Deterministic client-side calculations ensuring all features remain responsive and testable even without an active internet connection or backend server.
- **Gemma 4 Architecture Deep-Dive:** Dedicated modal showcasing multimodal prompt composition, image preprocessing, and safety protocol pipelines.

---

## 4. Student Features

1. **AI Circuit Troubleshooting:** Staging workbench to upload physical breadboard photographs, record voltage/current readings, and inspect systematic diagnosis reports.
2. **Experiment Library:** Curated catalog of electronics experiments with difficulty tags, circuit schematics, pinout diagrams, component lists, and step-by-step laboratory procedures.
3. **Interactive Circuit Simulations:** Five physics-driven simulation models with real-time sliders and instant telemetry updates.
4. **My Assessments:** Objective theoretical quizzes with instant client-side grading, score summaries, and question-by-question explanations.
5. **Ask an Instructor:** Form to draft technical questions linked to specific experiments with symptom descriptions and simulated instructor threads.
6. **My Progress:** Dashboard showing completed laboratory modules, instructor sign-off records, assessment scores, and active ticket statuses.

---

## 5. Instructor Features

1. **Experiment Designer:** Authoring tool for faculty to create multi-step laboratory procedures, define expected telemetry tolerances, list required components, and set safety rules.
2. **Student Question Inbox:** Inquiry triage system displaying student questions, priority tags, experiment context, and response drafting tools.
3. **Classroom Circuit Simulations:** Full access to interactive circuit simulations for lecture demonstrations and parameter validation.
4. **Test Designer:** Assessment authoring tool to create multiple-choice questions with answer keys and instructional feedback.
5. **Student Progress Analytics:** Cohort-wide overview tracking laboratory sign-offs, assessment score averages, and pending student submissions.

---

## 6. Circuit Troubleshooting Workflow

```
[Physical Breadboard] ──> [Capture Photo] ──> [Multimeter Telemetry]
                                                      │
                                                      ▼
[Client-Side Validation] ──> [Gemma 4 Multimodal Analysis] ──> [8-Section Diagnostic Report]
                                                                      │
                                   ┌──────────────────────────────────┴──────────────────────────────────┐
                                   ▼                                                                     ▼
                       1. Layout Observations                                                5. Verification Tests
                       2. Potential Faults & Likelihood                                      6. Expected Observations
                       3. Supporting Telemetry Evidence                                      7. Corrective Wiring Steps
                       4. Ambiguities / Missing Data                                         8. Safety Precautions
```

1. **Upload Circuit Photo:** Drag and drop or browse a breadboard photo (JPEG/PNG/WebP, max 10 MB). The client automatically validates dimensions and file size.
2. **Record Bench Readings:** Enter optional multimeter measurements:
   - Supply Voltage ($V_{cc}$ in Volts, e.g., `5.0 V`)
   - Measured Voltage ($V_{out}$ or $V_{drop}$ in Volts, e.g., `1.84 V`)
   - Measured Circuit Current ($I$ in milliamperes, e.g., `18.4 mA`)
3. **Describe Symptoms:** State the observed behavior vs. expected behavior (e.g., *"LED does not illuminate when 5V supply is switched on"*).
4. **Inspect Diagnosis:** Receive prioritized fault hypotheses (e.g., reversed diode polarity, breadboard power bus split, excessive series resistance) with step-by-step multimeter verification tests.

---

## 7. Experiment Library

The built-in curriculum library includes standard undergraduate electronics experiments:

| Code | Experiment Title | Category | Difficulty | Key Concepts |
| :--- | :--- | :--- | :--- | :--- |
| **EXP-01** | Inverting Operational Amplifier | Analog Circuits | Intermediate | Closed-loop gain $A_v = -R_f / R_{in}$, virtual ground, phase inversion |
| **EXP-02** | Full-Wave Bridge Rectifier | Power Electronics | Beginner | Diode forward conduction, ripple factor, capacitive filtering |
| **EXP-03** | 555 Timer Astable Multivibrator | Timing & Pulse | Intermediate | Charge/discharge timing, frequency $f = \frac{1.44}{(R_1 + 2R_2)C}$, duty cycle |
| **EXP-04** | BJT Common Emitter Amplifier | Transistor Circuits | Advanced | Active mode DC biasing, voltage gain, small-signal $h_{fe}$ |
| **EXP-05** | Passive R-C Low-Pass Filter | Filter Design | Beginner | Cutoff frequency $f_c = \frac{1}{2\pi RC}$, attenuation, $-3\text{ dB}$ roll-off |
| **EXP-06** | Linear Voltage Regulator (7805) | Power Supplies | Beginner | Line and load regulation, dropout voltage, thermal dissipation |
| **EXP-07** | Voltage Divider Network | Fundamentals | Beginner | Kirchhoff's laws, impedance matching, loading effect |
| **EXP-08** | Arduino Sensor Interfacing | Microcontrollers | Intermediate | ADC resolution, voltage dividers, analog-to-digital conversion |

---

## 8. Interactive Circuit Simulations

The platform includes five client-side deterministic physics simulation engines:

1. **Ohm's Law Engine:** Dynamically calculates current ($I = V/R$) and power dissipation ($P = V \times I$), warning when component power ratings ($0.25\text{ W}$) are exceeded.
2. **Diode Forward Bias Model:** Implements exponential Shockley diode modeling ($I \approx I_s e^{V_d / n V_t}$) and current-limiting resistor load lines.
3. **R-C Low-Pass Filter:** Computes cut-off frequency $f_c$, gain in decibels ($\text{dB}$), and output amplitude across adjustable test frequencies.
4. **555 Timer Frequency Synthesizer:** Calculates high time ($t_{high}$), low time ($t_{low}$), oscillation frequency, and duty cycle based on $R_1$, $R_2$, and $C_1$.
5. **Inverting Op-Amp Stage:** Computes closed-loop voltage gain, theoretical output voltage, and indicates rail-to-rail saturation against supply limits.

Each simulation features:
- Interactive range sliders with numeric value readouts.
- Live telemetry stat boxes.
- Relevant mathematical formulas and governing equations.
- Physical bench comparison tool to cross-reference multimeter measurements against theoretical predictions.

---

## 9. Assessments and Student Progress

- **Interactive Assessments:** Students take objective theoretical evaluations with questions on circuit operation, diode ratings, and oscilloscope interpretation.
- **Client-Side Grading:** Immediate grading upon submission with detailed explanations for correct and incorrect answers.
- **Student Progress Dashboard:** Tracks completed modules, signed-off experiments, assessment scores, and active instructor inquiries.

---

## 10. Instructor Experiment and Test Design

- **Curriculum Authoring:** Instructors can author new laboratory experiments with custom titles, categories, difficulty levels, required components, step-by-step procedures, and safety notices.
- **Test Authoring:** Instructors can design multiple-choice quiz questions, define answer choices, designate the correct key, and provide educational rationale.
- **Question Inbox Management:** Instructors can view student questions, filter by status, and draft technical replies.

---

## 11. Actual Technology Stack

### Frontend (Verified & Operational)
- **Framework:** React 18 (`react` 18.3.1, `react-dom` 18.3.1)
- **Build Tool:** Vite 6 (`vite` 6.1.0, `@vitejs/plugin-react` 4.3.4)
- **Language:** JavaScript (ES Modules)
- **Design System:** Custom CSS3 (`src/App.css`, ~3,300 lines) with Deep Navy palette (`#070d1e`, `#0b1329`, `#101c3d`), responsive grids, and accessible typography.
- **Iconography:** Lucide React (`lucide-react` 0.475.0)
- **Client State:** React Context API (`AuthContext.jsx`) for role management and session handling.
- **Local Physics Engine:** Deterministic mathematics in `StudentSimulations.jsx` and fallback diagnosis generator in `App.jsx`.

### Backend (Verified Optional Component)
- **Framework:** FastAPI (`backend/main.py`)
- **Validation:** Pydantic (`backend/models/schemas.py`)
- **Test Suite:** 8 passing automated unit tests in `backend/tests/run_tests.py` verifying health, simulation calculations, and schemas.

### Planned Integrations
- **AI Model:** Google Gemma 4 Multimodal Models (`gemma-4-31b-it`, `gemma-4-26b-a4b-it`) via Gemini / Google AI API.
- **Database:** Supabase PostgreSQL (schema and migrations defined in `supabase/migrations/001_initial_schema.sql`).

---

## 12. Project Architecture

```
LabSense AI/
├── public/
│   ├── favicon.svg                   # Circuit / IC brand favicon
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── instructor/
│   │   │   ├── InstructorExperiments.jsx  # Authoring interface for lab modules
│   │   │   ├── InstructorPortal.jsx       # Instructor dashboard layout & tabs
│   │   │   ├── InstructorProgress.jsx     # Cohort analytics & grading ledger
│   │   │   ├── InstructorQuestions.jsx    # Student question inbox & triage
│   │   │   └── InstructorTests.jsx        # Assessment test authoring tool
│   │   ├── student/
│   │   │   ├── StudentAssessments.jsx     # Multiple-choice quiz interface
│   │   │   ├── StudentExperiments.jsx     # Experiment curriculum catalog
│   │   │   ├── StudentPortal.jsx          # Student navigation & 6 portal tabs
│   │   │   ├── StudentProgress.jsx        # Student completion & sign-off records
│   │   │   ├── StudentQuestions.jsx       # Inquiry drafting form & ticket threads
│   │   │   ├── StudentSimulations.jsx     # 5 interactive circuit simulation models
│   │   │   └── StudentTroubleshoot.jsx    # Diagnostic bench wrapper
│   │   ├── AuthModal.jsx             # Role switcher modal (Student / Instructor)
│   │   ├── DiagnosisPanel.jsx        # 8-section diagnostic results panel
│   │   ├── ExperimentForm.jsx        # Category selector, description & telemetry
│   │   ├── Footer.jsx                # Branded footer, challenge info & safety notice
│   │   ├── Header.jsx                # Top bar with transparent cyan nav & profile
│   │   ├── Hero.jsx                  # 2-column hero with schematic & safety chips
│   │   ├── HowGemmaWorks.jsx         # Architecture modal & prompt design breakdown
│   │   ├── HowItWorks.jsx            # 3-step overview section
│   │   └── ImageUpload.jsx           # Drag-and-drop circuit photo ingestion
│   ├── context/
│   │   └── AuthContext.jsx           # Role state provider & demo switcher
│   ├── lib/
│   │   ├── api.js                    # API client with offline fallback handling
│   │   └── supabase.js               # Supabase client configuration
│   ├── App.css                       # Complete design system & responsive styling
│   ├── App.jsx                       # Root view router & diagnosis handler
│   └── main.jsx                      # React application mount
├── backend/                          # Optional FastAPI backend server
│   ├── config.py                     # Environment configuration
│   ├── main.py                       # FastAPI application entry
│   ├── models/schemas.py             # Pydantic schemas
│   ├── routers/                      # API endpoints (troubleshoot, simulations, etc.)
│   ├── services/                     # Gemma 4 & physics simulation engines
│   └── tests/                        # 8 automated verification tests
├── supabase/
│   ├── migrations/                   # PostgreSQL schema migrations
│   └── seed.sql                      # Seed data for curriculum & experiments
├── .env.example                      # Safe environment variable template
├── .gitignore                        # Git exclusion rules
├── index.html                        # HTML5 document entry
├── package.json                      # Project dependencies & scripts
├── vite.config.js                    # Vite configuration
└── README.md                         # Project documentation
```

---

## 13. Prerequisites

- **Node.js:** v18.0.0 or higher (Tested on Node.js v22.16.0)
- **npm:** v9.0.0 or higher (Tested on npm v10.9.2)
- **Modern Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari
- *(Optional for backend):* Python 3.10 or higher with `pip`

---

## 14. Installation and Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HackToBerFest-VVCE/t1c1-hack-hive.git
   cd t1c1-hack-hive
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (Optional):**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Note: The frontend operates fully in local demonstration mode without external API keys).*

---

## 15. Running the Frontend

To start the Vite development server:

```bash
npm run dev
```

The application will be available at:
```
http://localhost:5173
```

---

## 16. Optional Backend Setup (Verified)

To run the optional FastAPI backend server:

1. **Install Python dependencies:**
   ```bash
   pip install fastapi uvicorn pydantic python-dotenv
   ```

2. **Run backend verification tests:**
   ```bash
   python backend/tests/run_tests.py
   ```
   *(Expected output: `8 passed, 0 failed`)*

3. **Start the FastAPI server:**
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   The backend API documentation will be available at `http://localhost:8000/docs`.

---

## 17. Environment Variables

The project includes `.env.example` as a template:

```env
# LabSense AI - Environment Configuration Template
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_placeholder
VITE_GEMMA_API_KEY=your_gemma_api_key_placeholder
```

> [!IMPORTANT]
> Never commit real API keys, passwords, or service credentials to version control. The repository `.gitignore` automatically excludes all `.env` files.

---

## 18. Build and Testing Instructions

1. **Build for Production:**
   ```bash
   npm run build
   ```
   *Compiles production-ready minified assets into the `dist/` directory.*

2. **Preview Production Build:**
   ```bash
   npm run preview
   ```

3. **Git Diff and Syntax Check:**
   ```bash
   git diff --check
   ```

---

## 19. Current Limitations & Planned Integrations

| Feature | Current Status | Planned Evolution |
| :--- | :--- | :--- |
| **Gemma 4 Multimodal AI** | Simulated locally via deterministic diagnostic engine | Live API connection to `gemma-4-31b-it` via Google AI / Gemini API |
| **User Authentication** | Demo role switcher (Student / Instructor) with local state | Remote Supabase Auth (OAuth, Email/Password, Role-based JWTs) |
| **Data Persistence** | Browser session & local state storage | Supabase PostgreSQL persistent tables with Row-Level Security (RLS) |
| **Hardware Troubleshooting** | Image upload, measurements form, 8-section report | Live webcam inspection, real-time bounding box defect detection |
| **Circuit Simulations** | 5 client-side deterministic models | SPICE-based engine with transient and AC sweep graphs |

---

## 20. Repository Information

- **Local Path:** `D:\LabSense AI`
- **GitHub Repository:** [`https://github.com/HackToBerFest-VVCE/t1c1-hack-hive`](https://github.com/HackToBerFest-VVCE/t1c1-hack-hive)
- **Branch:** `main`
- **Challenge:** Hacktoberfest VVCE Mysuru — Best Use of Gemma 4
- **License:** MIT License
