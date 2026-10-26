import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  Sparkles,
  Zap,
  AlertTriangle,
  Sliders,
  HelpCircle,
  Info,
  CheckCircle2,
  Flame,
  Send,
  Scale
} from 'lucide-react';
import { calculateSimulation, tutorSimulation } from '../../lib/api';

const SIMULATION_MODELS = [
  { id: 'led_resistor', name: 'LED & Series Resistor', desc: 'Forward threshold, current limiting & burnout limits' },
  { id: 'ohms_law', name: "Ohm's Law Circuit", desc: 'Linear I = V/R and resistor power dissipation' },
  { id: 'series_parallel', name: 'Series & Parallel Resistors', desc: 'Equivalent resistance and current branch division' },
  { id: 'voltage_divider', name: 'Voltage Divider & Loading Effect', desc: 'Potential division and load impedance droop' },
  { id: 'sensor_circuit', name: 'LDR Sensor & Comparator', desc: 'Photo-resistor divider with threshold trigger' },
];

function localComputeSimulation(simType, params) {
  if (simType === 'led_resistor') {
    const v_in = Number(params.v_in) || 5.0;
    const r_val = Math.max(1, Number(params.r_val) || 220.0);
    const v_f = Number(params.v_f) || 1.9;
    const isForward = v_in > v_f;
    const i_a = isForward ? (v_in - v_f) / r_val : 0;
    const i_ma = +(i_a * 1000).toFixed(2);
    const v_r = +(i_a * r_val).toFixed(2);
    const v_led = isForward ? v_f : v_in;
    const p_res_w = +(i_a * i_a * r_val).toFixed(3);
    const p_led_mw = +(v_led * i_ma).toFixed(1);

    let status = 'normal';
    let msg = 'LED is forward-biased and operating safely within nominal current limits (10–25 mA).';
    if (!isForward) {
      status = 'warning';
      msg = 'Supply voltage is below LED forward threshold knee voltage. No conduction occurs.';
    } else if (i_ma > 30) {
      status = 'hazard_burnout';
      msg = `EXCESS CURRENT HAZARD (${i_ma} mA)! Standard 5mm LEDs burn out above 30 mA continuous forward current. Increase series resistor value immediately!`;
    } else if (p_res_w > 0.25) {
      status = 'warning';
      msg = `Resistor power dissipation (${p_res_w} W) exceeds standard 1/4W bench rating. Resistor will overheat.`;
    }

    return {
      simulation_type: 'led_resistor',
      circuit_status: status,
      status_message: msg,
      calculated_values: {
        supply_voltage_v: `${v_in} V`,
        led_forward_drop_v: `${v_led} V`,
        resistor_voltage_v: `${v_r} V`,
        loop_current_ma: `${i_ma} mA`,
        resistor_power_w: `${p_res_w} W`,
        led_power_mw: `${p_led_mw} mW`,
      },
      formulas_applied: [
        'I_loop = (V_in - V_f) / R',
        'V_R = I_loop * R',
        'P_R = I_loop² * R',
        'P_LED = V_f * I_loop',
      ],
    };
  } else if (simType === 'ohms_law') {
    const v = Number(params.voltage) || 5.0;
    const r = Math.max(0.1, Number(params.resistance) || 1000.0);
    const i_a = v / r;
    const i_ma = +(i_a * 1000).toFixed(3);
    const p_w = +(v * i_a).toFixed(3);
    let status = 'normal';
    let msg = "Linear Ohm's Law regime. Current scales proportionally with applied potential.";
    if (p_w > 0.25) {
      status = 'warning';
      msg = `Resistor power dissipation (${p_w} W) exceeds standard 1/4W bench rating. Resistor will overheat.`;
    }
    return {
      simulation_type: 'ohms_law',
      circuit_status: status,
      status_message: msg,
      calculated_values: {
        voltage_v: `${v} V`,
        resistance_ohms: `${r} Ω`,
        current_ma: `${i_ma} mA`,
        current_a: `${i_a.toFixed(5)} A`,
        power_dissipation_w: `${p_w} W`,
      },
      formulas_applied: [
        'I = V / R',
        'P = V * I = V² / R',
      ],
    };
  } else if (simType === 'series_parallel') {
    const v_in = Number(params.v_in) || 5.0;
    const r1 = Math.max(1, Number(params.r1) || 1000.0);
    const r2 = Math.max(1, Number(params.r2) || 1000.0);
    const mode = params.mode || 'series';
    if (mode === 'series') {
      const r_eq = r1 + r2;
      const i_tot_ma = +((v_in / r_eq) * 1000).toFixed(2);
      const v1 = +((v_in * r1) / r_eq).toFixed(2);
      const v2 = +((v_in * r2) / r_eq).toFixed(2);
      return {
        simulation_type: 'series_parallel',
        circuit_status: 'normal',
        status_message: `Series Configuration: Current is identical through both resistors (${i_tot_ma} mA). Total resistance is additive.`,
        calculated_values: {
          equivalent_resistance_ohms: `${r_eq} Ω`,
          total_current_ma: `${i_tot_ma} mA`,
          voltage_drop_r1_v: `${v1} V`,
          voltage_drop_r2_v: `${v2} V`,
        },
        formulas_applied: [
          'R_eq = R1 + R2',
          'I_total = V_in / R_eq',
          'V_R1 = I * R1',
          'V_R2 = I * R2',
        ],
      };
    } else {
      const r_eq = +((r1 * r2) / (r1 + r2)).toFixed(2);
      const i1_ma = +((v_in / r1) * 1000).toFixed(2);
      const i2_ma = +((v_in / r2) * 1000).toFixed(2);
      const i_tot_ma = +(i1_ma + i2_ma).toFixed(2);
      return {
        simulation_type: 'series_parallel',
        circuit_status: 'normal',
        status_message: `Parallel Configuration: Potential across each branch equals source voltage (${v_in} V). Total resistance is less than either branch.`,
        calculated_values: {
          equivalent_resistance_ohms: `${r_eq} Ω`,
          branch1_current_ma: `${i1_ma} mA`,
          branch2_current_ma: `${i2_ma} mA`,
          total_current_ma: `${i_tot_ma} mA`,
        },
        formulas_applied: [
          'R_eq = (R1 * R2) / (R1 + R2)',
          'I1 = V_in / R1, I2 = V_in / R2',
          'I_total = I1 + I2',
        ],
      };
    }
  } else if (simType === 'voltage_divider') {
    const v_in = Number(params.v_in) || 5.0;
    const r1 = Math.max(1, Number(params.r1) || 10000.0);
    const r2 = Math.max(1, Number(params.r2) || 10000.0);
    const has_load = params.r_load != null && Number(params.r_load) > 0;
    const r_load = has_load ? Math.max(1, Number(params.r_load)) : null;
    const unloaded_vout = +((v_in * r2) / (r1 + r2)).toFixed(3);
    let loaded_vout = unloaded_vout;
    let r2_eff = r2;
    let load_drop_pct = 0;
    let status = 'normal';
    let msg = `Unloaded Divider: Output potential is determined purely by the ratio R2 / (R1 + R2) = ${unloaded_vout} V.`;

    if (has_load) {
      r2_eff = (r2 * r_load) / (r2 + r_load);
      loaded_vout = +((v_in * r2_eff) / (r1 + r2_eff)).toFixed(3);
      load_drop_pct = +(((unloaded_vout - loaded_vout) / unloaded_vout) * 100).toFixed(1);
      if (load_drop_pct > 15) {
        status = 'warning';
        msg = `Severe Loading Effect: External load (${r_load} Ω) shunts current away from R2, causing the output voltage to droop by ${load_drop_pct}%! Buffer with an op-amp follower.`;
      } else {
        msg = `Loaded Divider: Moderate load current. Output voltage dropped by ${load_drop_pct}% from unloaded reference.`;
      }
    }

    return {
      simulation_type: 'voltage_divider',
      circuit_status: status,
      status_message: msg,
      calculated_values: {
        unloaded_vout_v: `${unloaded_vout} V`,
        loaded_vout_v: has_load ? `${loaded_vout} V` : 'N/A (No Load Attached)',
        effective_r2_load_ohms: has_load ? `${r2_eff.toFixed(1)} Ω` : `${r2} Ω`,
        loading_droop_percent: has_load ? `${load_drop_pct}%` : '0%',
        attenuation_ratio: `${(loaded_vout / v_in).toFixed(3)}x`,
      },
      formulas_applied: [
        'V_out(unloaded) = V_in * [R2 / (R1 + R2)]',
        'R2_eff = (R2 * R_load) / (R2 + R_load)',
        'V_out(loaded) = V_in * [R2_eff / (R1 + R2_eff)]',
      ],
    };
  } else if (simType === 'sensor_circuit') {
    const v_in = Number(params.v_in) || 5.0;
    const r_sensor = Math.max(1, Number(params.r_sensor) || 5000.0);
    const r_fixed = Math.max(1, Number(params.r_fixed) || 10000.0);
    const threshold_ratio = Number(params.threshold_ratio) || 0.5;
    const v_threshold = +(v_in * threshold_ratio).toFixed(2);
    const v_sensor_node = +((v_in * r_fixed) / (r_sensor + r_fixed)).toFixed(3);
    const is_triggered = v_sensor_node >= v_threshold;

    return {
      simulation_type: 'sensor_circuit',
      circuit_status: is_triggered ? 'normal' : 'warning',
      status_message: is_triggered
        ? `Comparator State: HIGH (Active Trigger). Node voltage (${v_sensor_node} V) exceeds threshold reference (${v_threshold} V).`
        : `Comparator State: LOW (Inactive). Node voltage (${v_sensor_node} V) is below threshold reference (${v_threshold} V).`,
      calculated_values: {
        sensor_resistance_ohms: `${r_sensor} Ω`,
        fixed_divider_resistor_ohms: `${r_fixed} Ω`,
        sensor_node_voltage_v: `${v_sensor_node} V`,
        comparator_reference_threshold_v: `${v_threshold} V`,
        digital_comparator_output: is_triggered ? 'HIGH (Logic 1 / 5V)' : 'LOW (Logic 0 / 0V)',
      },
      formulas_applied: [
        'V_node = V_in * [R_fixed / (R_sensor + R_fixed)]',
        'V_ref = V_in * Threshold_Ratio',
        'Comparator Out = (V_node >= V_ref) ? HIGH : LOW',
      ],
    };
  }
}

function localComputeTutor(simType) {
  if (simType === 'led_resistor') {
    return {
      explanation: 'In forward bias above the threshold knee voltage (V_f ≈ 1.9V to 3.2V depending on semiconductor bandgap), a diode conducts current exponentially. The series resistor R provides negative feedback, setting the current according to Ohm & Kirchhoff laws: I_loop = (V_in - V_f) / R. Without this resistor, the diode presents negligible internal impedance, drawing uncontrolled current until thermal failure.',
      guided_questions: [
        'What happens to LED current if the supply voltage drops below the forward voltage V_f?',
        'Why do standard 5mm LEDs have an absolute maximum rating of ~30 mA?',
        'How would you calculate the required resistor wattage rating if I = 20 mA and V_R = 3.1V?'
      ],
      misconceptions: [
        'Misconception: LEDs have constant resistance like standard resistors. Reality: LEDs are non-linear semiconductor diodes whose dynamic resistance drops exponentially once forward biased.',
        'Misconception: Resistor position (anode vs. cathode side) changes the current. Reality: In a single series loop, current is identical through all components regardless of order.'
      ],
      bench_comparison_tips: 'When probing an active LED circuit with a multimeter, measure the voltage drop directly across the LED leads. Red/amber LEDs drop ~1.8V-2.1V, whereas blue/white LEDs drop ~3.0V-3.3V.'
    };
  } else if (simType === 'ohms_law') {
    return {
      explanation: "Ohm's Law (V = I * R) defines the fundamental linear relationship between potential difference, current, and resistance in conductive materials. The electrical power delivered to the resistor is transformed entirely into heat at the rate P = V * I = I²R = V²/R.",
      guided_questions: [
        'If voltage doubles while resistance remains constant, what factor does dissipated power increase by?',
        'Why do resistors in breadboard experiments usually use 1/4 watt (0.25 W) ratings?'
      ],
      misconceptions: [
        'Misconception: Resistance changes when voltage increases. Reality: In ideal and standard linear resistors, R remains constant with varying potential (ignoring minor temperature coefficients).'
      ],
      bench_comparison_tips: 'To measure current with a handheld multimeter, you must break the circuit and place the meter in series. To measure voltage, place the meter leads in parallel across the resistor.'
    };
  } else if (simType === 'series_parallel') {
    return {
      explanation: "Series and parallel configurations form the foundation of circuit network analysis. In series, Kirchhoff's Current Law dictates that the same charge flow passes through every component, while voltages add up. In parallel, Kirchhoff's Voltage Law dictates that every branch experiences the same terminal voltage, while branch currents sum together.",
      guided_questions: [
        'Why is the equivalent resistance of two parallel resistors always smaller than the smaller resistor?',
        'If two identical 1kΩ resistors are in series vs. parallel, what is the ratio of their equivalent resistances?'
      ],
      misconceptions: [
        'Misconception: Current is "used up" as it travels through resistors in series. Reality: Current represents rate of charge movement (Coulombs/sec), which is strictly conserved through every node.'
      ],
      bench_comparison_tips: 'Always disconnect bench power before taking resistance measurements with an ohmmeter. Measuring resistance in an energized circuit yields invalid numbers and can blow the multimeter fuse.'
    };
  } else if (simType === 'voltage_divider') {
    return {
      explanation: 'An unloaded voltage divider produces an output potential V_out = V_in * [R2 / (R1 + R2)]. However, connecting an external load impedance R_load in parallel with R2 decreases the equivalent lower impedance, causing the output voltage to sag or droop. This phenomenon is known as the loading effect.',
      guided_questions: [
        'How large must the load resistance R_load be relative to R2 to keep loading droop under 1%?',
        'What active semiconductor device is commonly inserted between a voltage divider and a low-impedance load to prevent voltage droop?'
      ],
      misconceptions: [
        'Misconception: A simple voltage divider can be used as a power supply regulator for heavy loads. Reality: Dividers have high source impedance and waste power; dedicated linear regulators or op-amp buffers are required.'
      ],
      bench_comparison_tips: 'Even modern digital multimeters have an internal impedance (typically 10 MΩ). When measuring high-impedance dividers (e.g. megaohm resistors), even the meter itself causes noticeable loading droop!'
    };
  } else {
    return {
      explanation: 'A Light Dependent Resistor (LDR) utilizes cadmium sulfide photo-conduction: absorbed photons generate electron-hole pairs, reducing bulk resistance from ~20kΩ in darkness down to ~500Ω in bright light. Arranged in a voltage divider, this resistance variation translates into an analog voltage that a comparator compares against a reference threshold.',
      guided_questions: [
        'What would happen if you swapped the positions of the LDR and the fixed resistor in the divider?',
        'Why is hysteresis (positive feedback) commonly added to real sensor comparators in noisy environments?'
      ],
      misconceptions: [
        'Misconception: Comparators output variable analog levels. Reality: An open-loop comparator outputs saturated digital extremes (Logic HIGH or LOW) based on whether the input exceeds the reference threshold.'
      ],
      bench_comparison_tips: 'Cover the LDR completely with an opaque object or fingertip to observe darkness resistance (>10kΩ), then shine a flashlight or bench lamp to verify bright conduction.'
    };
  }
}

export default function StudentSimulations() {
  const [selectedSim, setSelectedSim] = useState('led_resistor');

  // Simulation Parameters
  const [ledParams, setLedParams] = useState({ v_in: 5.0, r_val: 220.0, v_f: 1.9 });
  const [ohmsParams, setOhmsParams] = useState({ voltage: 5.0, resistance: 1000.0 });
  const [spParams, setSpParams] = useState({ v_in: 5.0, r1: 1000.0, r2: 1000.0, mode: 'series' });
  const [vdParams, setVdParams] = useState({ v_in: 5.0, r1: 10000.0, r2: 10000.0, r_load: 1000.0, has_load: false });
  const [sensorParams, setSensorParams] = useState({ v_in: 5.0, r_sensor: 5000.0, r_fixed: 10000.0, threshold_ratio: 0.5 });

  // Calculation Results
  const [calcResult, setCalcResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Gemma Tutor State
  const [tutorResult, setTutorResult] = useState(null);
  const [isTutoring, setIsTutoring] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState('');

  // Physical Bench Comparison State
  const [benchReading, setBenchReading] = useState('');
  const [benchComparisonMsg, setBenchComparisonMsg] = useState(null);

  // Perform deterministic calculation whenever parameters change
  useEffect(() => {
    let activeParams = {};
    if (selectedSim === 'led_resistor') activeParams = ledParams;
    else if (selectedSim === 'ohms_law') activeParams = ohmsParams;
    else if (selectedSim === 'series_parallel') activeParams = spParams;
    else if (selectedSim === 'voltage_divider') {
      activeParams = {
        v_in: vdParams.v_in,
        r1: vdParams.r1,
        r2: vdParams.r2,
        r_load: vdParams.has_load ? vdParams.r_load : null,
      };
    } else if (selectedSim === 'sensor_circuit') activeParams = sensorParams;

    const runCalc = async () => {
      setIsCalculating(true);
      try {
        const res = await calculateSimulation(selectedSim, activeParams);
        setCalcResult(res);
      } catch (err) {
        // Deterministic local physics engine fallback
        const fallback = localComputeSimulation(selectedSim, activeParams);
        setCalcResult(fallback);
      } finally {
        setIsCalculating(false);
      }
    };

    runCalc();
    setTutorResult(null);
    setBenchComparisonMsg(null);
  }, [selectedSim, ledParams, ohmsParams, spParams, vdParams, sensorParams]);

  // Request Gemma Tutor Explanation
  const handleAskTutor = async (e) => {
    if (e) e.preventDefault();
    if (!calcResult) return;

    setIsTutoring(true);
    let activeParams = {};
    if (selectedSim === 'led_resistor') activeParams = ledParams;
    else if (selectedSim === 'ohms_law') activeParams = ohmsParams;
    else if (selectedSim === 'series_parallel') activeParams = spParams;
    else if (selectedSim === 'voltage_divider') activeParams = vdParams;
    else if (selectedSim === 'sensor_circuit') activeParams = sensorParams;

    try {
      const res = await tutorSimulation(
        selectedSim,
        activeParams,
        calcResult.calculated_values,
        tutorQuestion.trim()
      );
      setTutorResult(res);
    } catch (err) {
      const fallback = localComputeTutor(selectedSim);
      setTutorResult(fallback);
    } finally {
      setIsTutoring(false);
    }
  };

  // Compare Bench Multimeter reading
  const handleCompareBench = () => {
    if (!benchReading || !calcResult) return;
    const benchVal = parseFloat(benchReading);
    if (isNaN(benchVal)) return;

    let theoreticalVal = 0;
    let unit = 'V';
    if (selectedSim === 'led_resistor') {
      theoreticalVal = calcResult.calculated_values.led_forward_drop_v;
      unit = 'V across LED';
    } else if (selectedSim === 'ohms_law') {
      theoreticalVal = calcResult.calculated_values.current_ma;
      unit = 'mA';
    } else if (selectedSim === 'voltage_divider') {
      theoreticalVal = vdParams.has_load ? calcResult.calculated_values.loaded_vout_v : calcResult.calculated_values.unloaded_vout_v;
      unit = 'V (Vout)';
    }

    const variance = ((benchVal - theoreticalVal) / theoreticalVal) * 100.0;
    const absVar = Math.abs(variance).toFixed(1);

    if (absVar <= 5.0) {
      setBenchComparisonMsg(`Excellent correlation! Your bench measurement (${benchVal} ${unit}) matches theoretical simulation within ${absVar}% (well within typical ±5% resistor tolerance).`);
    } else if (absVar <= 15.0) {
      setBenchComparisonMsg(`Moderate deviation: Your reading (${benchVal} ${unit}) deviates by ${absVar}% from nominal (${theoreticalVal} ${unit}). Check resistor tolerance bands and probe contact resistance.`);
    } else {
      setBenchComparisonMsg(`Significant discrepancy: Your reading deviates by ${absVar}%. Check for wiring errors, unbridged breadboard rails, or incorrect multimeter dial settings.`);
    }
  };

  return (
    <div className="simulations-layout">
      {/* Top Model Selector Tabs */}
      <div className="sim-model-selector card">
        <div className="model-selector-header">
          <Sliders size={20} className="text-blue" />
          <h2 className="model-selector-title">Interactive Educational Circuit Simulations</h2>
          <span className="educational-disclaimer">Deterministic Physics Engine (Educational Model)</span>
        </div>
        <div className="model-tabs-row">
          {SIMULATION_MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              className={`model-tab-btn ${selectedSim === model.id ? 'active' : ''}`}
              onClick={() => setSelectedSim(model.id)}
            >
              <span className="tab-name">{model.name}</span>
              <span className="tab-desc">{model.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sim-workspace-grid">
        {/* Left Column: Interactive Controls */}
        <div className="sim-controls-col card">
          <div className="card-header">
            <div className="card-title-group">
              <Zap size={20} className="text-amber" />
              <div>
                <h3 className="card-title">Adjust Circuit Parameters</h3>
                <p className="card-subtitle">Real-time electrical quantities computed via Ohm & Kirchhoff laws</p>
              </div>
            </div>
          </div>

          <div className="card-body">
            {/* 1. LED & Resistor */}
            {selectedSim === 'led_resistor' && (
              <div className="slider-group-list">
                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">Supply Voltage (Vin)</label>
                    <span className="slider-value-pill">{ledParams.v_in.toFixed(1)} V</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="12.0"
                    step="0.1"
                    value={ledParams.v_in}
                    onChange={(e) => setLedParams({ ...ledParams, v_in: parseFloat(e.target.value) })}
                    className="sim-slider"
                  />
                  <div className="slider-ticks">
                    <span>0 V</span>
                    <span>5 V</span>
                    <span>12 V</span>
                  </div>
                </div>

                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">Series Resistor ($R$)</label>
                    <span className="slider-value-pill">{ledParams.r_val.toFixed(0)} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={ledParams.r_val}
                    onChange={(e) => setLedParams({ ...ledParams, r_val: parseFloat(e.target.value) })}
                    className="sim-slider"
                  />
                  <div className="slider-ticks">
                    <span>10 Ω (Danger)</span>
                    <span>220 Ω (Standard)</span>
                    <span>1k Ω</span>
                  </div>
                </div>

                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">LED Type / Forward Knee ($V_f$)</label>
                    <span className="slider-value-pill">{ledParams.v_f.toFixed(2)} V</span>
                  </div>
                  <div className="radio-pills">
                    {[
                      { label: 'Red (1.9V)', val: 1.9 },
                      { label: 'Green (2.2V)', val: 2.2 },
                      { label: 'Blue (3.2V)', val: 3.2 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className={`pill-btn ${ledParams.v_f === opt.val ? 'pill-btn-active' : ''}`}
                        onClick={() => setLedParams({ ...ledParams, v_f: opt.val })}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Ohm's Law */}
            {selectedSim === 'ohms_law' && (
              <div className="slider-group-list">
                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">Voltage ($V$)</label>
                    <span className="slider-value-pill">{ohmsParams.voltage.toFixed(1)} V</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="24.0"
                    step="0.5"
                    value={ohmsParams.voltage}
                    onChange={(e) => setOhmsParams({ ...ohmsParams, voltage: parseFloat(e.target.value) })}
                    className="sim-slider"
                  />
                </div>

                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">Resistance ($R$)</label>
                    <span className="slider-value-pill">{ohmsParams.resistance.toFixed(0)} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="5000"
                    step="50"
                    value={ohmsParams.resistance}
                    onChange={(e) => setOhmsParams({ ...ohmsParams, resistance: parseFloat(e.target.value) })}
                    className="sim-slider"
                  />
                </div>
              </div>
            )}

            {/* 3. Series & Parallel */}
            {selectedSim === 'series_parallel' && (
              <div className="slider-group-list">
                <div className="slider-item">
                  <label className="field-label">Configuration Mode</label>
                  <div className="radio-pills">
                    {['series', 'parallel'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`pill-btn ${spParams.mode === m ? 'pill-btn-active' : ''}`}
                        onClick={() => setSpParams({ ...spParams, mode: m })}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">Resistor $R_1$</label>
                    <span className="slider-value-pill">{spParams.r1} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={spParams.r1}
                    onChange={(e) => setSpParams({ ...spParams, r1: parseFloat(e.target.value) })}
                    className="sim-slider"
                  />
                </div>

                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">Resistor $R_2$</label>
                    <span className="slider-value-pill">{spParams.r2} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={spParams.r2}
                    onChange={(e) => setSpParams({ ...spParams, r2: parseFloat(e.target.value) })}
                    className="sim-slider"
                  />
                </div>
              </div>
            )}

            {/* 4. Voltage Divider */}
            {selectedSim === 'voltage_divider' && (
              <div className="slider-group-list">
                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">Top Resistor ($R_1$)</label>
                    <span className="slider-value-pill">{vdParams.r1} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={vdParams.r1}
                    onChange={(e) => setVdParams({ ...vdParams, r1: parseFloat(e.target.value) })}
                    className="sim-slider"
                  />
                </div>

                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">Bottom Resistor ($R_2$)</label>
                    <span className="slider-value-pill">{vdParams.r2} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={vdParams.r2}
                    onChange={(e) => setVdParams({ ...vdParams, r2: parseFloat(e.target.value) })}
                    className="sim-slider"
                  />
                </div>

                <div className="slider-item">
                  <div className="checkbox-row">
                    <input
                      type="checkbox"
                      id="load-toggle"
                      checked={vdParams.has_load}
                      onChange={(e) => setVdParams({ ...vdParams, has_load: e.target.checked })}
                    />
                    <label htmlFor="load-toggle" className="field-label">Attach External Load Resistor (Rload)</label>
                  </div>
                  {vdParams.has_load && (
                    <div className="nested-load-slider">
                      <div className="slider-label-row">
                        <label className="field-label-sm">Load Resistance (Rload)</label>
                        <span className="slider-value-pill">{vdParams.r_load} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="20000"
                        step="500"
                        value={vdParams.r_load}
                        onChange={(e) => setVdParams({ ...vdParams, r_load: parseFloat(e.target.value) })}
                        className="sim-slider"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Sensor Circuit */}
            {selectedSim === 'sensor_circuit' && (
              <div className="slider-group-list">
                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">Simulated Light Level / LDR Resistance</label>
                    <span className="slider-value-pill">{sensorParams.r_sensor} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="500"
                    value={sensorParams.r_sensor}
                    onChange={(e) => setSensorParams({ ...sensorParams, r_sensor: parseFloat(e.target.value) })}
                    className="sim-slider"
                  />
                  <div className="slider-ticks">
                    <span>Bright Light (500Ω)</span>
                    <span>Ambient (5kΩ)</span>
                    <span>Darkness (20kΩ)</span>
                  </div>
                </div>

                <div className="slider-item">
                  <div className="slider-label-row">
                    <label className="field-label">Potentiometer Sensitivity Threshold</label>
                    <span className="slider-value-pill">{Math.round(sensorParams.threshold_ratio * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={sensorParams.threshold_ratio}
                    onChange={(e) => setSensorParams({ ...sensorParams, threshold_ratio: parseFloat(e.target.value) })}
                    className="sim-slider"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mathematical Readouts & Gemma Tutor */}
        <div className="sim-readouts-col">
          {/* Telemetry Card */}
          <div className="card readout-card">
            <div className="card-header">
              <div className="card-title-group">
                <Activity size={20} className="text-blue" />
                <div>
                  <h3 className="card-title">Calculated Electrical Quantities</h3>
                  <p className="card-subtitle">Exact formulas applied by deterministic simulation</p>
                </div>
              </div>

              {calcResult && (
                <div className={`status-pill status-${calcResult.circuit_status}`}>
                  <span>{calcResult.circuit_status.toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="card-body">
              {calcResult && (
                <div className="quantities-grid">
                  {Object.entries(calcResult.calculated_values).map(([k, v]) => {
                    if (typeof v === 'string' && v.length > 25) return null;
                    return (
                      <div key={k} className="metric-box">
                        <span className="metric-label">{k.replace(/_/g, ' ').toUpperCase()}</span>
                        <span className="metric-value">{String(v)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Status Message */}
              {calcResult && (
                <div className="sim-status-banner">
                  {calcResult.circuit_status === 'hazard_burnout' ? (
                    <Flame size={18} className="text-danger" />
                  ) : calcResult.circuit_status === 'warning' ? (
                    <AlertTriangle size={18} className="text-amber" />
                  ) : (
                    <CheckCircle2 size={18} className="text-green" />
                  )}
                  <span>{calcResult.status_message}</span>
                </div>
              )}

              {/* Applied Mathematical Formulas */}
              {calcResult?.formulas_applied && (
                <div className="formulas-box">
                  <span className="formula-header">Applied Theoretical Equations:</span>
                  <div className="formula-tags">
                    {calcResult.formulas_applied.map((f, i) => (
                      <code key={i} className="formula-pill">{f}</code>
                    ))}
                  </div>
                </div>
              )}

              {/* Physical Bench Comparison Widget */}
              <div className="bench-compare-box">
                <div className="bench-compare-header">
                  <Scale size={16} className="text-blue" />
                  <span>Compare with Real Laboratory Multimeter</span>
                </div>
                <div className="bench-compare-input-row">
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="Enter your measured value..."
                    value={benchReading}
                    onChange={(e) => setBenchReading(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleCompareBench}>
                    Validate Reading
                  </button>
                </div>
                {benchComparisonMsg && (
                  <p className="bench-compare-msg">{benchComparisonMsg}</p>
                )}
              </div>
            </div>
          </div>

          {/* Gemma 4 Simulation Tutor Card */}
          <div className="card tutor-card">
            <div className="card-header">
              <div className="card-title-group">
                <Sparkles size={20} className="text-blue" />
                <div>
                  <h3 className="card-title">Gemma 4 Simulation Tutor</h3>
                  <p className="card-subtitle">AI explains physical principles, guided questions, and bench discrepancies</p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAskTutor}
                disabled={isTutoring}
              >
                {isTutoring ? <Sparkles size={14} className="spin-icon" /> : <Sparkles size={14} />}
                <span>Explain State</span>
              </button>
            </div>

            <div className="card-body">
              {isTutoring && (
                <div className="analyzing-state">
                  <div className="analyzing-spinner"></div>
                  <p className="analyzing-desc">Gemma 4 is synthesizing pedagogical explanation...</p>
                </div>
              )}

              {tutorResult && (
                <div className="tutor-results-container">
                  <p className="tutor-explanation">{tutorResult.explanation}</p>

                  {tutorResult.guided_questions?.length > 0 && (
                    <div className="tutor-sub">
                      <strong>Guided Inquiry Questions:</strong>
                      <ul className="bullet-list">
                        {tutorResult.guided_questions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tutorResult.misconceptions?.length > 0 && (
                    <div className="tutor-sub">
                      <strong>Common Student Misconceptions:</strong>
                      <ul className="bullet-list">
                        {tutorResult.misconceptions.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tutorResult.bench_comparison_tips && (
                    <div className="tutor-sub tutor-bench-tips">
                      <strong>Bench Multimeter Practical Note:</strong>
                      <p>{tutorResult.bench_comparison_tips}</p>
                    </div>
                  )}
                </div>
              )}

              {!tutorResult && !isTutoring && (
                <div className="empty-diagnosis-state">
                  <Info size={28} className="empty-icon" />
                  <p className="empty-message">
                    Adjust any slider above and click <strong>Explain State</strong> to have Gemma 4 analyze why the circuit voltages and currents shifted.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
