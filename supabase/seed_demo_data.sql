-- ============================================================================
-- LabSense AI - Complete Demo Seed Script
-- File: supabase/seed_demo_data.sql
-- Description: Populates compatible tables with existing demo data from the UI & API.
-- Compatible Tables: institutions, instructor_invites, experiments, tests, test_questions, audit_logs.
-- Schema Note: profiles table requires an authentic foreign key in auth.users(id),
--              so demo user profiles are preserved client-side and not inserted as fake auth accounts.
-- ============================================================================

-- 1. INSTITUTIONS: Seed Active and Pending Institutions from UI Demo States
INSERT INTO public.institutions (
    id,
    name,
    code,
    institution_type,
    country,
    state,
    city,
    official_email,
    contact_name,
    contact_designation,
    contact_email,
    contact_phone,
    status,
    is_active,
    enrollment_paused
) VALUES
(
    '00000000-0000-0000-0000-000000000100',
    'Vidyavardhaka College of Engineering',
    'LSAI-VVCE-A7K2',
    'Autonomous Engineering College',
    'India',
    'Karnataka',
    'Mysuru',
    'principal@vvce.ac.in',
    'Prof. B. S. Gowda',
    'Principal & Institutional Workspace Admin',
    'admin.vvce@labsense.edu',
    '+91-821-4276200',
    'approved',
    true,
    false
),
(
    '00000000-0000-0000-0000-000000000101',
    'R.V. College of Engineering (RVCE)',
    'LSAI-RVCE-C3X1',
    'Autonomous Engineering College',
    'India',
    'Karnataka',
    'Bengaluru',
    'principal@rvce.edu.in',
    'Dr. Subramanya K. N.',
    'Principal & Dean of Engineering',
    'principal@rvce.edu.in',
    '+91-80-68188100',
    'approved',
    true,
    false
),
(
    '00000000-0000-0000-0000-000000000102',
    'PES University (Ring Road Campus)',
    'LSAI-PESU-M9L4',
    'Autonomous Engineering University',
    'India',
    'Karnataka',
    'Bengaluru',
    'dean.ec@pes.edu',
    'Dr. J. Suryaprasad',
    'Dean & Professor of ECE',
    'dean.ec@pes.edu',
    '+91-80-26721983',
    'approved',
    true,
    false
),
(
    '00000000-0000-0000-0000-000000000103',
    'M. S. Ramaiah Institute of Technology',
    'LSAI-MSRI-P2R8',
    'Autonomous Engineering College',
    'India',
    'Karnataka',
    'Bengaluru',
    'principal@msrit.edu',
    'Dr. N. V. R. Naidu',
    'Principal',
    'principal@msrit.edu',
    '+91-80-23600822',
    'approved',
    true,
    false
),
(
    '00000000-0000-0000-0000-000000000104',
    'PSG College of Technology',
    'LSAI-PSGC-K5T9',
    'Autonomous Engineering College',
    'India',
    'Tamil Nadu',
    'Coimbatore',
    'principal@psgtech.edu',
    'Dr. K. Prakasan',
    'Principal & Senior Professor',
    'principal@psgtech.edu',
    '+91-422-2572177',
    'approved',
    true,
    false
),
(
    '00000000-0000-0000-0000-000000000201',
    'BMS Institute of Technology & Management',
    'LSAI-BMSI-R4T1',
    'Autonomous Engineering College',
    'India',
    'Karnataka',
    'Bengaluru',
    'principal@bmsit.in',
    'Dr. Mohan Kumar R.',
    'HOD, Dept of Electronics & Telecommunication',
    'hod.ete@bmsit.in',
    '+91-80-28561576',
    'pending',
    true,
    false
),
(
    '00000000-0000-0000-0000-000000000202',
    'National Institute of Engineering (NIE)',
    'LSAI-NIEM-K8B3',
    'Autonomous Engineering College',
    'India',
    'Karnataka',
    'Mysuru',
    'registrar@nie.ac.in',
    'Prof. Anitha S.',
    'Vice Principal & Lab Director',
    'anitha.s@nie.ac.in',
    '+91-821-2480475',
    'pending',
    true,
    false
),
(
    '00000000-0000-0000-0000-000000000203',
    'KLS Gogte Institute of Technology',
    'LSAI-GITB-P9Q2',
    'Autonomous Engineering College',
    'India',
    'Karnataka',
    'Belagavi',
    'principal@git.edu',
    'Dr. M. S. Patil',
    'Dean Academic Affairs',
    'dean.academic@git.edu',
    '+91-831-2405500',
    'pending',
    true,
    false
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    official_email = EXCLUDED.official_email,
    contact_name = EXCLUDED.contact_name,
    contact_email = EXCLUDED.contact_email;


-- 2. INSTRUCTOR INVITES: Pre-seeded bootstrap codes
INSERT INTO public.instructor_invites (
    id,
    invite_code,
    institution_id,
    is_used,
    expires_at
) VALUES 
(
    '11111111-0000-0000-0000-000000000001',
    'LABSENSE-INST-2026',
    '00000000-0000-0000-0000-000000000100',
    false,
    timezone('utc'::text, now() + interval '365 days')
),
(
    '11111111-0000-0000-0000-000000000002',
    'VVCE-HACK-FACULTY',
    '00000000-0000-0000-0000-000000000100',
    false,
    timezone('utc'::text, now() + interval '365 days')
),
(
    '11111111-0000-0000-0000-000000000003',
    'GEMMA-LAB-PROCTOR',
    '00000000-0000-0000-0000-000000000100',
    false,
    timezone('utc'::text, now() + interval '365 days')
)
ON CONFLICT (invite_code) DO NOTHING;


-- 3. BENCHMARK EXPERIMENTS: Seed Core Electronics Experiments
INSERT INTO public.experiments (
    id,
    title,
    category,
    difficulty,
    description,
    learning_objectives,
    prerequisites,
    components_required,
    step_by_step_procedure,
    expected_readings,
    safety_instructions,
    circuit_diagram_svg,
    is_published,
    institution_id
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'LED Forward Characteristics & Current Limiting',
    'Diodes & LEDs',
    'Beginner',
    'Investigate the forward voltage drop and operating current of a standard 5mm red light emitting diode, and design a protective current-limiting resistor network.',
    '["Measure diode forward knee voltage (Vf ~ 1.8V to 2.1V)", "Calculate required current-limiting resistance using R = (Vin - Vf) / If", "Observe diode behavior under reverse-bias conditions"]'::jsonb,
    '["Basic breadboard wiring", "Multimeter DC voltage and current operations", "Ohm''s law fundamentals"]'::jsonb,
    '["1x Red 5mm LED", "1x 220 Ohm 1/4W resistor", "1x 1k Ohm 1/4W resistor", "Breadboard and jumper wires", "5V DC bench power supply", "Digital Multimeter (DMM)"]'::jsonb,
    '["Insert the 220 Ohm resistor into breadboard rows 10 and 15.", "Connect the LED anode (longer lead) to row 15 and cathode (flat side/shorter lead) to row 20.", "Connect row 10 to the +5V supply rail.", "Connect row 20 to the ground (0V) supply rail.", "Power on bench supply and measure voltage across the LED using DMM in DC Volts mode.", "Switch DMM to DC mA mode, break the loop in series, and measure operating current."]'::jsonb,
    '{"supply_voltage": "5.0 V", "expected_v_led": "1.85 V to 2.05 V", "expected_v_resistor": "2.95 V to 3.15 V", "expected_current": "13.5 mA to 14.5 mA"}'::jsonb,
    '["Never connect an LED directly across 5V without a series resistor; immediate burnout will occur.", "Ensure correct polarity before applying power.", "De-energize circuit before switching multimeter probe jacks to current mode."]'::jsonb,
    '<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0f172a" rx="8"/><path d="M50 100 H120" stroke="#38bdf8" stroke-width="3"/><rect x="120" y="85" width="60" height="30" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="135" y="105" fill="#e2e8f0" font-family="monospace" font-size="12">220Ω</text><path d="M180 100 H240" stroke="#38bdf8" stroke-width="3"/><polygon points="240,85 240,115 270,100" fill="#ef4444"/><line x1="270" y1="85" x2="270" y2="115" stroke="#ef4444" stroke-width="3"/><path d="M270 100 H350" stroke="#38bdf8" stroke-width="3"/><circle cx="50" cy="100" r="5" fill="#10b981"/><text x="35" y="80" fill="#10b981" font-size="12">+5V</text><circle cx="350" cy="100" r="5" fill="#64748b"/><text x="340" y="80" fill="#64748b" font-size="12">GND</text></svg>',
    true,
    '00000000-0000-0000-0000-000000000100'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Ohm''s Law Verification and Series-Parallel Networks',
    'Resistor Networks',
    'Beginner',
    'Systematically verify the linear relationship between voltage and current across pure ohmic resistors, and analyze equivalent resistances in series and parallel configurations.',
    '["Verify I = V/R experimentally across multiple voltage levels", "Measure equivalent resistance of series vs parallel combinations", "Quantify resistor power dissipation (P = V * I) and thermal limits"]'::jsonb,
    '["DC voltage source operation", "Ohm''s law mathematical formulation"]'::jsonb,
    '["2x 1k Ohm 1/4W resistors", "1x 470 Ohm 1/4W resistor", "Variable 0-12V DC power supply", "Dual digital multimeters", "Breadboard"]'::jsonb,
    '["Place two 1k resistors in series on the breadboard.", "Apply 5.0V across the pair.", "Measure current through the series loop.", "Measure the node voltage between the two resistors.", "Reconfigure the resistors in parallel across the 5.0V rail and record total current."]'::jsonb,
    '{"supply_voltage": "5.0 V", "series_r_eq": "2000 Ohm", "series_current": "2.5 mA", "parallel_r_eq": "500 Ohm", "parallel_current": "10.0 mA"}'::jsonb,
    '["Verify resistor wattage ratings before increasing voltage above 9V to avoid thermal damage.", "Turn off bench power supply before reconfiguring series or parallel jumper wires."]'::jsonb,
    '<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0f172a" rx="8"/><path d="M60 100 H120" stroke="#38bdf8" stroke-width="3"/><rect x="120" y="85" width="55" height="30" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="130" y="105" fill="#e2e8f0" font-family="monospace" font-size="11">R1 1k</text><path d="M175 100 H225" stroke="#38bdf8" stroke-width="3"/><rect x="225" y="85" width="55" height="30" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="235" y="105" fill="#e2e8f0" font-family="monospace" font-size="11">R2 1k</text><path d="M280 100 H340" stroke="#38bdf8" stroke-width="3"/><circle cx="60" cy="100" r="5" fill="#10b981"/><circle cx="340" cy="100" r="5" fill="#64748b"/></svg>',
    true,
    '00000000-0000-0000-0000-000000000100'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Voltage Divider and Potentiometric Transducer',
    'Analog Fundamentals',
    'Intermediate',
    'Construct an unloaded and loaded voltage divider network. Analyze how finite meter impedance and subsequent circuit stages introduce loading error.',
    '["Calculate Vout = Vin * (R2 / (R1 + R2))", "Observe and calculate output loading errors caused by low-impedance parallel loads", "Calibrate a 10k potentiometer as an adjustable reference voltage divider"]'::jsonb,
    '["Thevenin equivalent concepts", "Series resistor circuits"]'::jsonb,
    '["1x 10k Ohm potentiometer", "2x 10k Ohm resistors", "1x 1k Ohm load resistor", "5V regulated supply", "Digital multimeter"]'::jsonb,
    '["Wire R1 (10k) and R2 (10k) in series across +5V and GND.", "Measure unloaded Vout at the divider midpoint.", "Connect a 1k Ohm resistor in parallel with R2 to simulate a heavy load.", "Measure loaded Vout and calculate the percentage voltage deviation."]'::jsonb,
    '{"supply_voltage": "5.0 V", "unloaded_vout": "2.50 V", "loaded_vout": "0.45 V", "loading_effect": "82% voltage droop under 1k load"}'::jsonb,
    '["Do not short the potentiometer wiper directly between supply and ground.", "Double check probe placement before recording loaded potentials."]'::jsonb,
    '<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0f172a" rx="8"/><path d="M200 30 V60" stroke="#38bdf8" stroke-width="3"/><rect x="180" y="60" width="40" height="35" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="188" y="82" fill="#e2e8f0" font-size="10">R1</text><path d="M200 95 V125" stroke="#38bdf8" stroke-width="3"/><rect x="180" y="125" width="40" height="35" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="188" y="147" fill="#e2e8f0" font-size="10">R2</text><path d="M200 160 V180" stroke="#38bdf8" stroke-width="3"/><path d="M200 110 H280" stroke="#f59e0b" stroke-width="3"/><circle cx="280" cy="110" r="5" fill="#f59e0b"/><text x="290" y="115" fill="#f59e0b" font-size="12">Vout</text></svg>',
    true,
    '00000000-0000-0000-0000-000000000100'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    difficulty = EXCLUDED.difficulty,
    description = EXCLUDED.description,
    is_published = EXCLUDED.is_published,
    institution_id = EXCLUDED.institution_id;


-- 4. PRACTICAL ASSESSMENTS: Seed Benchmark Test
INSERT INTO public.tests (
    id,
    title,
    description,
    experiment_id,
    duration_minutes,
    max_attempts,
    is_published,
    results_visible_immediately
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Practical Assessment: Diode Characteristics & Voltage Limits',
    'Test your theoretical and bench diagnostic understanding of semiconductor diodes, forward threshold knee points, and current-limiting principles.',
    '11111111-1111-1111-1111-111111111111',
    15,
    3,
    true,
    true
)
ON CONFLICT (id) DO NOTHING;


-- 5. TEST QUESTIONS: Seed Questions for Diode Assessment
INSERT INTO public.test_questions (
    id,
    test_id,
    question_type,
    prompt,
    options,
    correct_answer,
    marks,
    explanation,
    sort_order
) VALUES
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'mcq',
    'A standard red 5mm LED is connected across a 5.0V DC supply with a 220-Ohm series resistor. If the LED has a forward voltage drop of 1.9V, what is the expected current flowing through the circuit?',
    '["14.1 mA", "22.7 mA", "8.6 mA", "31.2 mA"]'::jsonb,
    '14.1 mA',
    2,
    'By Kirchhoff''s Voltage Law, the resistor voltage is V_resistor = Vin - Vf = 5.0V - 1.9V = 3.1V. Applying Ohm''s law: I = 3.1V / 220Ω = 0.01409 A ≈ 14.1 mA.',
    1
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'mcq',
    'What happens if an LED is accidentally connected in reverse polarity across a 5V supply with a 220-Ohm series resistor?',
    '["The LED conducts maximum current and burns out immediately", "The LED is reverse-biased, conducts virtually zero current (~leakage only), and does not emit light", "The LED glows at half brightness", "The series resistor absorbs all voltage and reaches 100°C"]'::jsonb,
    'The LED is reverse-biased, conducts virtually zero current (~leakage only), and does not emit light',
    2,
    'A reverse-biased diode acts as an open circuit (very high impedance) up to its peak inverse breakdown voltage (which is typically 5V or higher for standard LEDs). Almost zero current flows, so the LED remains off and the resistor does not heat up.',
    2
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'short_answer',
    'Explain why a current-limiting resistor is mandatory when powering an LED from an ideal voltage source greater than its forward knee voltage.',
    '[]'::jsonb,
    'Diodes have an exponential I-V curve with very low dynamic resistance once forward biased. Without a series resistor, excessive current will flow, exceeding maximum thermal limits and destroying the semiconductor junction.',
    3,
    'An LED has an exponential I-V characteristic. Beyond the threshold knee voltage, small increases in applied voltage cause massive exponential increases in current. A series resistor provides negative feedback setting the operating current safely.',
    3
)
ON CONFLICT (id) DO NOTHING;


-- 6. PLATFORM AUDIT LOGS: Seed Governance & Admin Activity
INSERT INTO public.audit_logs (
    id,
    actor_id,
    actor_name,
    actor_role,
    action,
    target_type,
    target_id,
    details,
    severity,
    created_at
) VALUES
(
    'cccccccc-cccc-cccc-cccc-000000000101',
    NULL,
    'Harshith T S',
    'platform_super_admin',
    'Super Admin Governance Console Authenticated',
    'system',
    'Platform Global Scope',
    '{"client_ip": "127.0.0.1", "auth_mode": "evaluation_mode"}'::jsonb,
    'info',
    timezone('utc'::text, now() - interval '2 hours')
),
(
    'cccccccc-cccc-cccc-cccc-000000000102',
    NULL,
    'Prof. B. S. Gowda',
    'institution_admin',
    'Department Roster & Subject Allocations Verified',
    'institution',
    '00000000-0000-0000-0000-000000000100',
    '{"institution_code": "LSAI-VVCE-A7K2", "enrolled_students": 842, "faculty_count": 28}'::jsonb,
    'info',
    timezone('utc'::text, now() - interval '5 hours')
),
(
    'cccccccc-cccc-cccc-cccc-000000000103',
    NULL,
    'Gemma 4 Multimodal Inference Cluster',
    'system',
    'Gemma 4 Multimodal Troubleshooting Models Nominal',
    'system',
    'Inference Engine Cluster-01',
    '{"model_id": "gemma-4-31b-it", "status": "online", "temperature": 0.2}'::jsonb,
    'success',
    timezone('utc'::text, now() - interval '1 day')
),
(
    'cccccccc-cccc-cccc-cccc-000000000104',
    NULL,
    'Harshith T S',
    'platform_super_admin',
    'Approved Registration Request for PSG College of Technology',
    'institution',
    '00000000-0000-0000-0000-000000000104',
    '{"institution_name": "PSG College of Technology", "code": "LSAI-PSGC-K5T9"}'::jsonb,
    'info',
    timezone('utc'::text, now() - interval '2 days')
)
ON CONFLICT (id) DO NOTHING;
