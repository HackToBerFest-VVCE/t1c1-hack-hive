const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env without external dotenv dependency
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const targetKey = (serviceKey && serviceKey.trim().length > 0) ? serviceKey.trim() : anonKey;
const isServiceRole = Boolean(serviceKey && serviceKey.trim().length > 0);

console.log('='.repeat(70));
console.log('LabSense AI Database Seeder & Verification Tool');
console.log('='.repeat(70));
console.log(`Target Supabase URL: ${supabaseUrl}`);
console.log(`Auth Mode: ${isServiceRole ? 'Service Role Superuser (RLS Bypassed)' : 'Anon Client (Subject to RLS)'}`);

if (!supabaseUrl || !targetKey) {
  console.error('ERROR: Supabase URL or API Key missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, targetKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function runSeedAndVerify() {
  // If service role is available, insert seed data via Supabase client directly
  if (isServiceRole) {
    console.log('\n[1/3] Populating compatible tables using Service Role privileges...');

    // 1. Institutions
    const institutions = [
      {
        id: '00000000-0000-0000-0000-000000000100',
        name: 'Vidyavardhaka College of Engineering',
        code: 'LSAI-VVCE-A7K2',
        institution_type: 'Autonomous Engineering College',
        country: 'India',
        state: 'Karnataka',
        city: 'Mysuru',
        official_email: 'principal@vvce.ac.in',
        contact_name: 'Prof. B. S. Gowda',
        contact_designation: 'Principal & Institutional Workspace Admin',
        contact_email: 'admin.vvce@labsense.edu',
        contact_phone: '+91-821-4276200',
        status: 'approved',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000101',
        name: 'R.V. College of Engineering (RVCE)',
        code: 'LSAI-RVCE-C3X1',
        institution_type: 'Autonomous Engineering College',
        country: 'India',
        state: 'Karnataka',
        city: 'Bengaluru',
        official_email: 'principal@rvce.edu.in',
        contact_name: 'Dr. Subramanya K. N.',
        contact_designation: 'Principal & Dean of Engineering',
        contact_email: 'principal@rvce.edu.in',
        contact_phone: '+91-80-68188100',
        status: 'approved',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000102',
        name: 'PES University (Ring Road Campus)',
        code: 'LSAI-PESU-M9L4',
        institution_type: 'Autonomous Engineering University',
        country: 'India',
        state: 'Karnataka',
        city: 'Bengaluru',
        official_email: 'dean.ec@pes.edu',
        contact_name: 'Dr. J. Suryaprasad',
        contact_designation: 'Dean & Professor of ECE',
        contact_email: 'dean.ec@pes.edu',
        contact_phone: '+91-80-26721983',
        status: 'approved',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000103',
        name: 'M. S. Ramaiah Institute of Technology',
        code: 'LSAI-MSRI-P2R8',
        institution_type: 'Autonomous Engineering College',
        country: 'India',
        state: 'Karnataka',
        city: 'Bengaluru',
        official_email: 'principal@msrit.edu',
        contact_name: 'Dr. N. V. R. Naidu',
        contact_designation: 'Principal',
        contact_email: 'principal@msrit.edu',
        contact_phone: '+91-80-23600822',
        status: 'approved',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000104',
        name: 'PSG College of Technology',
        code: 'LSAI-PSGC-K5T9',
        institution_type: 'Autonomous Engineering College',
        country: 'India',
        state: 'Tamil Nadu',
        city: 'Coimbatore',
        official_email: 'principal@psgtech.edu',
        contact_name: 'Dr. K. Prakasan',
        contact_designation: 'Principal & Senior Professor',
        contact_email: 'principal@psgtech.edu',
        contact_phone: '+91-422-2572177',
        status: 'approved',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000201',
        name: 'BMS Institute of Technology & Management',
        code: 'LSAI-BMSI-R4T1',
        institution_type: 'Autonomous Engineering College',
        country: 'India',
        state: 'Karnataka',
        city: 'Bengaluru',
        official_email: 'principal@bmsit.in',
        contact_name: 'Dr. Mohan Kumar R.',
        contact_designation: 'HOD, Dept of Electronics & Telecommunication',
        contact_email: 'hod.ete@bmsit.in',
        contact_phone: '+91-80-28561576',
        status: 'pending',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000202',
        name: 'National Institute of Engineering (NIE)',
        code: 'LSAI-NIEM-K8B3',
        institution_type: 'Autonomous Engineering College',
        country: 'India',
        state: 'Karnataka',
        city: 'Mysuru',
        official_email: 'registrar@nie.ac.in',
        contact_name: 'Prof. Anitha S.',
        contact_designation: 'Vice Principal & Lab Director',
        contact_email: 'anitha.s@nie.ac.in',
        contact_phone: '+91-821-2480475',
        status: 'pending',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000203',
        name: 'KLS Gogte Institute of Technology',
        code: 'LSAI-GITB-P9Q2',
        institution_type: 'Autonomous Engineering College',
        country: 'India',
        state: 'Karnataka',
        city: 'Belagavi',
        official_email: 'principal@git.edu',
        contact_name: 'Dr. M. S. Patil',
        contact_designation: 'Dean Academic Affairs',
        contact_email: 'dean.academic@git.edu',
        contact_phone: '+91-831-2405500',
        status: 'pending',
        is_active: true,
      },
    ];

    const { error: instErr } = await supabase.from('institutions').upsert(institutions, { onConflict: 'id' });
    if (instErr) console.warn('Institutions upsert error:', instErr.message);
    else console.log(`✓ Seeded ${institutions.length} institutions.`);

    // 2. Instructor Invites
    const invites = [
      { id: '11111111-0000-0000-0000-000000000001', invite_code: 'LABSENSE-INST-2026', institution_id: '00000000-0000-0000-0000-000000000100', is_used: false },
      { id: '11111111-0000-0000-0000-000000000002', invite_code: 'VVCE-HACK-FACULTY', institution_id: '00000000-0000-0000-0000-000000000100', is_used: false },
      { id: '11111111-0000-0000-0000-000000000003', invite_code: 'GEMMA-LAB-PROCTOR', institution_id: '00000000-0000-0000-0000-000000000100', is_used: false },
    ];
    const { error: invErr } = await supabase.from('instructor_invites').upsert(invites, { onConflict: 'invite_code' });
    if (invErr) console.warn('Invites upsert error:', invErr.message);
    else console.log(`✓ Seeded ${invites.length} instructor invites.`);

    // 3. Experiments
    const experiments = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'LED Forward Characteristics & Current Limiting',
        category: 'Diodes & LEDs',
        difficulty: 'Beginner',
        description: 'Investigate the forward voltage drop and operating current of a standard 5mm red LED, and design a protective current-limiting resistor network.',
        learning_objectives: ['Measure diode forward knee voltage (Vf ~ 1.8V to 2.1V)', 'Calculate required current-limiting resistance using R = (Vin - Vf) / If', 'Observe diode behavior under reverse-bias conditions'],
        prerequisites: ['Basic breadboard wiring', 'Multimeter DC voltage and current operations', 'Ohm\'s law fundamentals'],
        components_required: ['1x Red 5mm LED', '1x 220 Ohm 1/4W resistor', '1x 1k Ohm 1/4W resistor', 'Breadboard and jumper wires', '5V DC bench power supply', 'Digital Multimeter (DMM)'],
        step_by_step_procedure: ['Insert the 220 Ohm resistor into breadboard rows 10 and 15.', 'Connect the LED anode (longer lead) to row 15 and cathode (flat side/shorter lead) to row 20.', 'Connect row 10 to the +5V supply rail.', 'Connect row 20 to the ground (0V) supply rail.', 'Power on bench supply and measure voltage across the LED using DMM in DC Volts mode.', 'Switch DMM to DC mA mode, break the loop in series, and measure operating current.'],
        expected_readings: { supply_voltage: '5.0 V', expected_v_led: '1.85 V to 2.05 V', expected_v_resistor: '2.95 V to 3.15 V', expected_current: '13.5 mA to 14.5 mA' },
        safety_instructions: ['Never connect an LED directly across 5V without a series resistor; immediate burnout will occur.', 'Ensure correct polarity before applying power.', 'De-energize circuit before switching multimeter probe jacks to current mode.'],
        is_published: true,
        institution_id: '00000000-0000-0000-0000-000000000100',
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        title: "Ohm's Law Verification and Series-Parallel Networks",
        category: 'Resistor Networks',
        difficulty: 'Beginner',
        description: 'Systematically verify the linear relationship between voltage and current across pure ohmic resistors, and analyze equivalent resistances in series and parallel configurations.',
        learning_objectives: ['Verify I = V/R experimentally across multiple voltage levels', 'Measure equivalent resistance of series vs parallel combinations', 'Quantify resistor power dissipation (P = V * I) and thermal limits'],
        prerequisites: ['DC voltage source operation', "Ohm's law mathematical formulation"],
        components_required: ['2x 1k Ohm 1/4W resistors', '1x 470 Ohm 1/4W resistor', 'Variable 0-12V DC power supply', 'Dual digital multimeters', 'Breadboard'],
        step_by_step_procedure: ['Place two 1k resistors in series on the breadboard.', 'Apply 5.0V across the pair.', 'Measure current through the series loop.', 'Measure the node voltage between the two resistors.', 'Reconfigure the resistors in parallel across the 5.0V rail and record total current.'],
        expected_readings: { supply_voltage: '5.0 V', series_r_eq: '2000 Ohm', series_current: '2.5 mA', parallel_r_eq: '500 Ohm', parallel_current: '10.0 mA' },
        safety_instructions: ['Verify resistor wattage ratings before increasing voltage above 9V to avoid thermal damage.', 'Turn off bench power supply before reconfiguring series or parallel jumper wires.'],
        is_published: true,
        institution_id: '00000000-0000-0000-0000-000000000100',
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        title: 'Voltage Divider and Potentiometric Transducer',
        category: 'Analog Fundamentals',
        difficulty: 'Intermediate',
        description: 'Construct an unloaded and loaded voltage divider network. Analyze how finite meter impedance and subsequent circuit stages introduce loading error.',
        learning_objectives: ['Calculate Vout = Vin * (R2 / (R1 + R2))', 'Observe and calculate output loading errors caused by low-impedance parallel loads', 'Calibrate a 10k potentiometer as an adjustable reference voltage divider'],
        prerequisites: ['Thevenin equivalent concepts', 'Series resistor circuits'],
        components_required: ['1x 10k Ohm potentiometer', '2x 10k Ohm resistors', '1x 1k Ohm load resistor', '5V regulated supply', 'Digital multimeter'],
        step_by_step_procedure: ['Wire R1 (10k) and R2 (10k) in series across +5V and GND.', 'Measure unloaded Vout at the divider midpoint.', 'Connect a 1k Ohm resistor in parallel with R2 to simulate a heavy load.', 'Measure loaded Vout and calculate the percentage voltage deviation.'],
        expected_readings: { supply_voltage: '5.0 V', unloaded_vout: '2.50 V', loaded_vout: '0.45 V', loading_effect: '82% voltage droop under 1k load' },
        safety_instructions: ['Do not short the potentiometer wiper directly between supply and ground.', 'Double check probe placement before recording loaded potentials.'],
        is_published: true,
        institution_id: '00000000-0000-0000-0000-000000000100',
      },
    ];
    const { error: expErr } = await supabase.from('experiments').upsert(experiments, { onConflict: 'id' });
    if (expErr) console.warn('Experiments upsert error:', expErr.message);
    else console.log(`✓ Seeded ${experiments.length} experiments.`);

    // 4. Tests
    const tests = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: 'Practical Assessment: Diode Characteristics & Voltage Limits',
        description: 'Test your theoretical and bench diagnostic understanding of semiconductor diodes, forward threshold knee points, and current-limiting principles.',
        experiment_id: '11111111-1111-1111-1111-111111111111',
        duration_minutes: 15,
        max_attempts: 3,
        is_published: true,
        results_visible_immediately: true,
      },
    ];
    const { error: testsErr } = await supabase.from('tests').upsert(tests, { onConflict: 'id' });
    if (testsErr) console.warn('Tests upsert error:', testsErr.message);
    else console.log(`✓ Seeded ${tests.length} practical assessments.`);

    // 5. Test Questions
    const questions = [
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
        test_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        question_type: 'mcq',
        prompt: 'A standard red 5mm LED is connected across a 5.0V DC supply with a 220-Ohm series resistor. If the LED has a forward voltage drop of 1.9V, what is the expected current flowing through the circuit?',
        options: ['14.1 mA', '22.7 mA', '8.6 mA', '31.2 mA'],
        correct_answer: '14.1 mA',
        marks: 2,
        explanation: 'By Kirchhoff\'s Voltage Law, the resistor voltage is V_resistor = Vin - Vf = 5.0V - 1.9V = 3.1V. Applying Ohm\'s law: I = 3.1V / 220Ω = 0.01409 A ≈ 14.1 mA.',
        sort_order: 1,
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
        test_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        question_type: 'mcq',
        prompt: 'What happens if an LED is accidentally connected in reverse polarity across a 5V supply with a 220-Ohm series resistor?',
        options: [
          'The LED conducts maximum current and burns out immediately',
          'The LED is reverse-biased, conducts virtually zero current (~leakage only), and does not emit light',
          'The LED glows at half brightness',
          'The series resistor absorbs all voltage and reaches 100°C'
        ],
        correct_answer: 'The LED is reverse-biased, conducts virtually zero current (~leakage only), and does not emit light',
        marks: 2,
        explanation: 'A reverse-biased diode acts as an open circuit up to its peak inverse breakdown voltage. Almost zero current flows, so the LED remains off.',
        sort_order: 2,
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
        test_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        question_type: 'short_answer',
        prompt: 'Explain why a current-limiting resistor is mandatory when powering an LED from an ideal voltage source greater than its forward knee voltage.',
        options: [],
        correct_answer: 'Diodes have an exponential I-V curve with very low dynamic resistance once forward biased. Without a series resistor, excessive current will flow, exceeding maximum thermal limits and destroying the semiconductor junction.',
        marks: 3,
        explanation: 'An LED has an exponential I-V characteristic. Beyond the threshold knee voltage, small increases in applied voltage cause massive exponential increases in current.',
        sort_order: 3,
      },
    ];
    const { error: qErr } = await supabase.from('test_questions').upsert(questions, { onConflict: 'id' });
    if (qErr) console.warn('Questions upsert error:', qErr.message);
    else console.log(`✓ Seeded ${questions.length} test questions.`);

    // 6. Audit Logs
    const auditLogs = [
      {
        id: 'cccccccc-cccc-cccc-cccc-000000000101',
        actor_name: 'Harshith T S',
        actor_role: 'platform_super_admin',
        action: 'Super Admin Governance Console Authenticated',
        target_type: 'system',
        target_id: 'Platform Global Scope',
        details: { client_ip: '127.0.0.1', auth_mode: 'evaluation_mode' },
        severity: 'info',
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-000000000102',
        actor_name: 'Prof. B. S. Gowda',
        actor_role: 'institution_admin',
        action: 'Department Roster & Subject Allocations Verified',
        target_type: 'institution',
        target_id: '00000000-0000-0000-0000-000000000100',
        details: { institution_code: 'LSAI-VVCE-A7K2', enrolled_students: 842, faculty_count: 28 },
        severity: 'info',
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-000000000103',
        actor_name: 'Gemma 4 Multimodal Inference Cluster',
        actor_role: 'system',
        action: 'Gemma 4 Multimodal Troubleshooting Models Nominal',
        target_type: 'system',
        target_id: 'Inference Engine Cluster-01',
        details: { model_id: 'gemma-4-31b-it', status: 'online', temperature: 0.2 },
        severity: 'success',
      },
    ];
    const { error: aErr } = await supabase.from('audit_logs').upsert(auditLogs, { onConflict: 'id' });
    if (aErr) console.warn('Audit logs upsert error:', aErr.message);
    else console.log(`✓ Seeded ${auditLogs.length} audit log entries.`);
  } else {
    console.log('\n[INFO] Running with Anon Key. Direct table mutations are restricted by Row-Level Security.');
    console.log('To populate all compatible tables in your Supabase project:');
    console.log('  1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/caomeqzcwdsqwduvcxtc/sql');
    console.log('  2. Copy and execute the file: supabase/seed_demo_data.sql');
    console.log('  3. Alternatively, supply SUPABASE_SERVICE_ROLE_KEY in .env and re-run this script.\n');
  }

  // Verification step: Run SELECT queries on all tables and report counts
  console.log('='.repeat(70));
  console.log('LIVE DATABASE VERIFICATION: SELECT QUERY AUDIT');
  console.log('='.repeat(70));

  const tables = [
    { name: 'institutions', display: 'Institutions (Workspaces)' },
    { name: 'experiments', display: 'Benchmark Experiments' },
    { name: 'tests', display: 'Practical Assessments' },
    { name: 'test_questions', display: 'Assessment Questions' },
    { name: 'instructor_invites', display: 'Instructor Invite Codes' },
    { name: 'profiles', display: 'User Profiles (requires auth.users fk)' },
    { name: 'audit_logs', display: 'Administrative Audit Logs' },
  ];

  const results = [];

  for (const t of tables) {
    try {
      const { data, error } = await supabase
        .from(t.name)
        .select('*');

      if (error) {
        results.push({
          table: t.name,
          displayName: t.display,
          status: 'Restricted (RLS/Auth Required)',
          count: 0,
          sample: null,
          note: error.message,
        });
      } else {
        results.push({
          table: t.name,
          displayName: t.display,
          status: 'Accessible',
          count: (data ? data.length : 0),
          sample: data && data.length > 0 ? data.map(d => d.name || d.title || d.invite_code || d.email || d.id).slice(0, 3) : [],
          note: `${data ? data.length : 0} rows retrieved`,
        });
      }
    } catch (err) {
      results.push({
        table: t.name,
        displayName: t.display,
        status: 'Error',
        count: 0,
        sample: null,
        note: err.message,
      });
    }
  }

  console.table(results.map(r => ({
    'Table Name': r.table,
    'Live Record Count': r.count,
    'Access Status': r.status,
    'Sample Record Identifiers': r.sample && r.sample.length > 0 ? r.sample.join(', ') : '(empty or restricted)',
  })));

  console.log('\nAudit complete.');
}

runSeedAndVerify();
