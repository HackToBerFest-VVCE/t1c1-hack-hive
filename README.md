# LabSense AI — Multimodal AI-Powered Electronics Laboratory Learning Platform

[![Hacktoberfest](https://img.shields.io/badge/Event-Hacktoberfest_VVCE_Mysuru-0284c7.svg)](https://github.com/HackToBerFest-VVCE/t1c1-hack-hive)
[![Challenge Track](https://img.shields.io/badge/Track-Best_Use_of_Gemma_4-38bdf8.svg)](https://github.com/HackToBerFest-VVCE/t1c1-hack-hive)
[![Frontend](https://img.shields.io/badge/Frontend-React_18_%7C_Vite_6-61dafb.svg)](https://react.dev/)
[![Styling](https://img.shields.io/badge/Styling-Custom_Navy_Design_System-0b1329.svg)](src/App.css)
[![Build Status](https://img.shields.io/badge/Build-Passing-10b981.svg)](dist/)

**LabSense AI** is an AI-powered electronics laboratory learning and institutional management platform. It empowers engineering students to investigate physical breadboard circuit faults, analyze bench telemetry, and master systematic troubleshooting through multimodal reasoning inspired by Google Gemma 4.

Developed for the **"Best Use of Gemma 4"** track at Hacktoberfest (VVCE Mysuru), the platform combines role-based laboratory portals, institution workspace isolation with unique codes, interactive circuit simulations, curriculum authoring benches, and evidence-based diagnostic reports.

---

## 1. Problem Statement

Undergraduate engineering students frequently encounter obstacles when troubleshooting physical circuits on laboratory breadboards:
- **Difficult Fault Localization:** Misplaced jumper wires, inverted polarity components (diodes, LEDs, electrolytic capacitors), and IC pin miscounts are difficult to detect from static printed manuals.
- **Ambiguous Multimeter Telemetry:** Students often struggle to distinguish between expected component voltage drops, floating inputs, and fault-induced anomalies.
- **Hardware Burnout & Safety Risks:** Overcurrent loops and omitted current-limiting resistors cause component damage, instrument fuse trips, and bench downtime.
- **Supervision Bottlenecks:** A single laboratory instructor must supervise 30–60 students simultaneously, creating delays in verifying steps, debugging circuits, and assessing progress.
- **Institutional Fragmentation:** Academic institutions lack unified digital infrastructure to track hardware experiments, issue standardized lab codes, manage cohort rosters, and author curriculum modules.

---

## 2. Project Overview & Proposed Solution

LabSense AI bridges hands-on bench experiments with systematic AI guidance:
1. **Multimodal Circuit Understanding:** Students capture their physical breadboard layout, specify live bench measurements ($V_{supply}$, $V_{measured}$, $I_{circuit}$), and describe observed symptoms.
2. **Evidence-Based Diagnostic Engine:** The system generates an 8-section structured troubleshooting report providing physical observations, fault hypotheses with likelihood ratings, supporting evidence, step-by-step verification tests, expected nominal readings, corrective steps, and safety warnings.
3. **Four-Role Institutional Hierarchy:** Supports distinct workflows for **Students**, **Instructors**, **Institution Admins**, and **Platform Super Admins** with dedicated dashboards and permissions.
4. **Campus Workspace Isolation:** Educational institutions register to receive unique institution codes (e.g. `LSAI-VVCE-A7K2`), which students and faculty use to join isolated departmental workspaces.
5. **Interactive Physics Simulations:** Five mathematical simulation engines allow real-time parameter tweaking and bench comparison before wiring physical hardware.

> [!NOTE]
> **Implementation Status & Demonstration Mode:**
> The frontend provides complete client-side navigation, role-based workflows, interactive simulations, and a local deterministic diagnostic engine that simulates Gemma 4 troubleshooting outputs when the backend is offline. Local demonstration state is managed via `localStorage` (`labsense_local_session`). An optional FastAPI backend is present in `backend/` with verified unit tests, and Supabase database schemas are prepared in `supabase/` for production cloud deployment.

---

## 3. Core Gemma-Powered Diagnostic Capabilities

The platform models Google Gemma 4 multimodal reasoning principles across five diagnostic vectors:

1. **Physical Layout Understanding:** Ingests breadboard photographs (JPEG/PNG/WebP up to 10 MB) to inspect jumper rails, component orientations, and power buses.
2. **Telemetry Validation (Expected vs. Actual):** Compares reported multimeter voltages and currents against calculated theoretical operating points, flagging excessive resistance or short circuits.
3. **Prioritized Fault Hypotheses:** Ranks potential faults (High, Medium, Low likelihood) with explicit evidence citations.
4. **Step-by-Step Multimeter Verification Tests:** Formulates practical probe instructions (probe points, multimeter switch mode, expected readings, and de-energizing safety rules) to confirm faults before touching components.
5. **Instructional Question Answering:** Provides faculty with Gemma co-pilot drafting tools to compose technical replies for student inquiry tickets and generate objective assessment items.

### Troubleshooting Diagnostic Workflow

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

---

## 4. Role-Based Architecture & Portals

The application features a four-tier role access model with dynamic header profile rendering and context-driven portal routing:

### 1. Student Learning Portal
- **Circuit Troubleshooter:** Physical circuit photo staging, multimeter measurement input, and 8-section diagnostic feedback.
- **Experiment Curriculum Catalog:** Built-in repository of electronics experiments with difficulty tags, circuit schematics, pinouts, and procedures.
- **Circuit Simulations:** Interactive parameter sliders and real-time telemetry gauges.
- **Assessments & Quizzes:** Multiple-choice practical evaluations with instant client-side grading and answer rationale.
- **Ask an Instructor:** Inquiry submission form linked to specific experiments with status tracking.
- **My Progress:** Completion records, sign-off logs, assessment scores, and ticket tracking.
- **Student Scope Banner:** Displays student name, USN (`4VV21EC042`), semester (`6th Semester`), institution, and enrolled lab courses.

### 2. Instructor & Faculty Portal
- **Experiment Designer:** Authoring bench to compose laboratory modules, define component lists, specify expected readings, and attach safety rules.
- **Student Question Inbox:** Inquiry triage system with experiment context, student measurements, and Gemma AI-assisted reply drafting.
- **Simulations Sandbox:** Full access to interactive circuit simulations for classroom demonstrations.
- **Test Designer:** Assessment creation tool with AI-assisted question drafting, option management, and answer key generation.
- **Student Progress Analytics:** Cohort performance tracking, module completion rates, and average quiz scores.
- **Faculty Scope Banner:** Displays faculty name (`Dr. K. S. Sharma`), staff ID (`VVCE-FAC-ECE-108`), department, and assigned courses.
- **Crash-Resilient Rendering:** Protected with safe property fallbacks and an Error Boundary to prevent white-screen crashes.

### 3. Institution Admin Dashboard
- **Campus Workspace Overview:** Departmental metrics, student count (842), active faculty (28), and laboratory utilization rates.
- **Institution Code Distribution:** Active code management (`LSAI-VVCE-A7K2`), one-click copying, and regeneration controls.
- **Department & Lab Management:** Laboratory facility configuration, equipment allocation, and bench limits.
- **Faculty & Student Rosters:** Directory of enrolled learners and laboratory coordinators with status badges.
- **Administrative Logs:** Audit trail of user registrations, code redemptions, and workspace events.

### 4. Platform Super Admin Governance
- **Global Multi-Tenant Metrics:** Platform-wide oversight (14 institutions, 12,840 students, 486 instructors).
- **Institution Governance:** Multi-campus directory, subscription tier monitoring, and workspace status toggling.
- **Model & Diagnostic Settings:** Configuration of active Gemma AI inference models, temperature parameters, and rate limits.
- **Platform Health & Audit Logs:** System status telemetry, API endpoint latency monitors, and security audit records.

---

## 5. Header Profile & Account Access Experience

- **Logged-Out State:** Displays a single, clear **"Log In / Sign Up"** button on the dark navy header with transparent cyan navigation.
- **Logged-In State:** Replaces the login button with:
  - User name and avatar initials
  - Role-specific icon and badge (Student, Faculty Instructor, Institution Admin, Platform Super Admin)
  - Profile dropdown menu with **My Profile**, **My Dashboard**, **Account Settings**, and **Log Out**
- **Unified Account Access Modal:**
  - **Hub:** Direct entry paths for Institution Registration, User Sign Up, and User Login.
  - **Register Institution:** Form for colleges/universities to register, create admin credentials, and receive an instant unique institution code.
  - **Sign Up:** User enrollment with full name, email, password, role selection, and institution code verification.
  - **Log In:** Credential authentication with automated routing to the appropriate role dashboard.
  - **Quick Evaluation Personas:** Instant one-click demo switching between all 4 roles for demonstration and evaluation.

---

## 6. React Error Boundary & Crash Resilience

To ensure maximum reliability during laboratory sessions, the application wraps all portal views with a class-based `ErrorBoundary` component (`src/components/ErrorBoundary.jsx`):
- Catches unhandled JavaScript exceptions during component rendering.
- Prevents white-screen unmounting of the root application.
- Displays a themed dark-navy notification card with the error message.
- Provides a **"Retry View"** action to reset state and a **"Return to Home"** button for instant recovery.

---

## 7. Interactive Circuit Simulation Models

The platform features five client-side deterministic physics simulation models in `StudentSimulations.jsx`:

| Simulation Model | Key Formulas | Adjustable Controls | Real-Time Telemetry |
| :--- | :--- | :--- | :--- |
| **Ohm's Law Engine** | $I = \frac{V}{R}$, $P = V \times I$ | Supply Voltage ($0.5\text{--}24\text{ V}$), Resistance ($10\,\Omega\text{--}10\text{ k}\Omega$) | Current (mA), Power (mW), Over-wattage alert ($>250\text{ mW}$) |
| **Diode Forward Bias** | $I \approx I_s e^{V_d / n V_t}$ | Supply Voltage ($0\text{--}12\text{ V}$), Series Resistor ($100\,\Omega\text{--}2.2\text{ k}\Omega$) | Diode Drop ($V_d \approx 0.7\text{ V}$), Forward Current, Conduction status |
| **RC Low-Pass Filter** | $f_c = \frac{1}{2\pi RC}$, Gain $(\text{dB}) = 20\log_{10}\left(\frac{1}{\sqrt{1 + (f/f_c)^2}}\right)$ | Resistance ($100\,\Omega\text{--}100\text{ k}\Omega$), Capacitance ($1\text{ nF}\text{--}100\,\mu\text{F}$), Test Frequency | Cut-off $f_c$, Attenuation (dB), Output Amplitude, $-3\text{ dB}$ status |
| **555 Timer Astable** | $f = \frac{1.44}{(R_1 + 2R_2)C}$, Duty $= \frac{R_1 + R_2}{R_1 + 2R_2} \times 100\%$ | $R_1$ ($1\text{ k}\Omega\text{--}100\text{ k}\Omega$), $R_2$ ($1\text{ k}\Omega\text{--}100\text{ k}\Omega$), Timing Cap $C$ | Oscillation Frequency (Hz), High Time ($t_h$), Low Time ($t_l$), Duty Cycle |
| **Inverting Op-Amp** | $A_v = -\frac{R_f}{R_{in}}$, $V_{out} = A_v \times V_{in}$ | Input Voltage, $R_{in}$ ($1\text{ k}\Omega\text{--}50\text{ k}\Omega$), $R_f$ ($1\text{ k}\Omega\text{--}200\text{ k}\Omega$), Supply Rails | Closed-loop gain, Theoretical $V_{out}$, Rail-to-rail saturation indicator |

---

## 8. Technology Stack

### Frontend (Verified & Operational)
- **Framework:** React 18 (`react` 18.3.1, `react-dom` 18.3.1)
- **Build Tool:** Vite 6 (`vite` 6.4.5, `@vitejs/plugin-react` 4.3.4)
- **Language:** JavaScript (ES Modules, JSX)
- **Design System:** Custom CSS3 (`src/App.css`, ~4,500 lines) with Deep Navy palette (`#070d1e`, `#0b1329`, `#101c3d`), transparent cyan navigation (`#38bdf8`), and responsive layouts.
- **Iconography:** Lucide React (`lucide-react` 0.475.0)
- **Client State:** React Context API (`AuthContext.jsx`) with `localStorage` session persistence (`labsense_local_session`).
- **Resilience:** React Error Boundary (`src/components/ErrorBoundary.jsx`).

### Backend Architecture (Verified Optional Component)
- **Framework:** FastAPI (`backend/main.py`)
- **Data Validation:** Pydantic (`backend/models/schemas.py`)
- **Router Endpoints:** Circuit troubleshooting (`/troubleshoot`), simulations (`/simulations`), experiments (`/experiments`), assessments (`/assessments`), questions (`/questions`), and auth (`/auth`).
- **Services:** Local simulation calculation engine and Gemma reasoning service pipelines.
- **Automated Tests:** 8 passing tests in `backend/tests/run_tests.py`.

### Database & Auth Architecture (Prepared for Cloud Deployment)
- **Database Engine:** PostgreSQL via Supabase.
- **Schema & Migrations:** Full SQL schema in `supabase/migrations/001_initial_schema.sql` defining tables for institutions, profiles, user roles, experiments, student enrollments, assessments, test attempts, and inquiry tickets.
- **Seed Data:** `supabase/seed.sql` with sample curriculum and institutional records.
- **Current Runtime Status:** Client library configured in `src/lib/supabase.js`. Operates in offline local demo mode when Supabase environment variables are unpopulated.

---

## 9. Project Folder Structure

```
LabSense AI/
├── public/
│   ├── favicon.svg                   # Brand circuit favicon
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── InstitutionAdminDashboard.jsx  # Institution workspace & roster admin
│   │   ├── instructor/
│   │   │   ├── InstructorExperiments.jsx      # Authoring bench for lab experiments
│   │   │   ├── InstructorPortal.jsx           # Instructor dashboard & navigation
│   │   │   ├── InstructorProgress.jsx         # Cohort analytics & sign-offs
│   │   │   ├── InstructorQuestions.jsx        # Question inbox & AI drafting
│   │   │   └── InstructorTests.jsx            # Assessment test authoring tool
│   │   ├── student/
│   │   │   ├── StudentAssessments.jsx         # Multiple-choice quiz interface
│   │   │   ├── StudentExperiments.jsx         # Experiment curriculum catalog
│   │   │   ├── StudentPortal.jsx              # Student 6-tab navigation layout
│   │   │   ├── StudentProgress.jsx            # Student completion records
│   │   │   ├── StudentQuestions.jsx           # Inquiry drafting form
│   │   │   ├── StudentSimulations.jsx         # 5 physics simulation engines
│   │   │   └── StudentTroubleshoot.jsx        # Breadboard diagnosis workbench
│   │   ├── superadmin/
│   │   │   └── SuperAdminDashboard.jsx        # Global governance & metrics
│   │   ├── AuthModal.jsx             # Unified account access & registration modal
│   │   ├── DiagnosisPanel.jsx        # 8-section diagnostic results panel
│   │   ├── ErrorBoundary.jsx         # Component error catcher & recovery card
│   │   ├── ExperimentForm.jsx        # Circuit description & telemetry form
│   │   ├── Footer.jsx                # Branded footer & hardware safety notices
│   │   ├── Header.jsx                # Navy header with cyan nav & user profile
│   │   ├── Hero.jsx                  # Hero section with workbench CTA
│   │   ├── HowGemmaWorks.jsx         # Gemma 4 multimodal architecture modal
│   │   ├── HowItWorks.jsx            # 3-step workflow overview
│   │   └── ImageUpload.jsx           # Circuit photo ingestion & validation
│   ├── context/
│   │   └── AuthContext.jsx           # Multi-role authentication & session provider
│   ├── lib/
│   │   ├── api.js                    # API client with fallback report generation
│   │   └── supabase.js               # Supabase client configuration
│   ├── App.css                       # Complete design system & responsive styling
│   ├── App.jsx                       # Root view router & diagnosis handler
│   └── main.jsx                      # React application mount
├── backend/                          # Optional FastAPI backend
│   ├── config.py                     # Backend environment configuration
│   ├── main.py                       # FastAPI application entry
│   ├── models/schemas.py             # Pydantic schemas
│   ├── routers/                      # API endpoint modules
│   ├── services/                     # Simulation & Gemma services
│   └── tests/                        # Automated unit tests
├── supabase/                         # Database resources
│   ├── migrations/                   # PostgreSQL schema definitions
│   └── seed.sql                      # Curriculum & institution seed data
├── .env.example                      # Environment variables template
├── .gitignore                        # Git exclusion rules
├── index.html                        # HTML5 document entry
├── package.json                      # Project dependencies & scripts
├── vite.config.js                    # Vite configuration
└── README.md                         # Project documentation
```

---

## 10. Installation and Local Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher (Tested on Node.js v22.16.0)
- **npm:** v9.0.0 or higher (Tested on npm v10.9.2)
- **Modern Web Browser:** Chrome, Edge, Firefox, or Safari
- *(Optional for backend):* Python 3.10+ with `pip`

### Step-by-Step Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HackToBerFest-VVCE/t1c1-hack-hive.git
   cd t1c1-hack-hive
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Note: The frontend operates fully in local demonstration mode without external API keys).*

4. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The application will run at:
   ```
   http://localhost:5173
   ```

---

## 11. Optional Backend Setup (Verified)

To run the optional FastAPI backend:

1. **Install Python dependencies:**
   ```bash
   pip install fastapi uvicorn pydantic python-dotenv
   ```

2. **Run verification test suite:**
   ```bash
   python backend/tests/run_tests.py
   ```
   *(Expected output: `8 passed, 0 failed`)*

3. **Start the FastAPI server:**
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   Interactive Swagger documentation will be available at `http://localhost:8000/docs`.

---

## 12. Environment Variables

The project includes `.env.example` as a template for production deployment:

```env
# LabSense AI - Environment Configuration Template
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_placeholder
VITE_GEMMA_API_KEY=your_gemma_api_key_placeholder
```

> [!IMPORTANT]
> Never commit real API keys, passwords, or service-role credentials to version control. The repository `.gitignore` automatically excludes all `.env` and credential files.

---

## 13. Build and Quality Validation

1. **Production Build:**
   ```bash
   npm run build
   ```
   *Compiles production-ready minified assets into `dist/` with zero errors.*

2. **Git Diff and Whitespace Check:**
   ```bash
   git diff --check
   ```

3. **Preview Production Build:**
   ```bash
   npm run preview
   ```

---

## 14. Current Implementation Status & Roadmap

| Platform Feature | Current Implementation Status | Production Roadmap |
| :--- | :--- | :--- |
| **Gemma 4 Multimodal AI** | Simulated locally via deterministic diagnostic engine and fallback rules | Live API connection to `gemma-4-31b-it` via Google AI / Vertex API |
| **Authentication & Roles** | Multi-role demo engine (Student, Instructor, Admin, Super Admin) with `localStorage` | Supabase Auth with Row-Level Security (RLS) and JWT verification |
| **Institution Isolation** | Unique institution code validation and scoped demo workspaces | Database-backed multi-tenant schema with administrative provisioning |
| **Circuit Simulations** | 5 client-side deterministic mathematical physics models | Real-time SPICE transient and frequency sweep simulation engine |
| **Data Persistence** | Browser session & client memory state | Supabase PostgreSQL persistent tables |
| **Hardware Diagnostics** | Photograph upload (10 MB), telemetry validation, 8-section report | Real-time video stream inspection and breadboard overlay highlighting |

---

## 15. Repository Information

- **Local Path:** `D:\LabSense AI`
- **GitHub Repository:** [`https://github.com/HackToBerFest-VVCE/t1c1-hack-hive`](https://github.com/HackToBerFest-VVCE/t1c1-hack-hive)
- **Branch:** `main`
- **Challenge Track:** Hacktoberfest VVCE Mysuru — Best Use of Gemma 4
- **License:** MIT License
