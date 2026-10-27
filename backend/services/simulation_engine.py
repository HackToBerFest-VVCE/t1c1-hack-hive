"""
Deterministic Electrical Simulation Engine for LabSense AI
Performs exact mathematical calculations based on Kirchhoff's laws and Ohm's law.
Does NOT rely on LLM for numerical values.
"""

from typing import Dict, Any
from ..models.schemas import SimulationCalculateResponse

def calculate_simulation(sim_type: str, params: Dict[str, float]) -> SimulationCalculateResponse:
    if sim_type == "led_resistor":
        return _calc_led_resistor(params)
    elif sim_type == "ohms_law":
        return _calc_ohms_law(params)
    elif sim_type == "series_parallel":
        return _calc_series_parallel(params)
    elif sim_type == "voltage_divider":
        return _calc_voltage_divider(params)
    elif sim_type == "sensor_circuit":
        return _calc_sensor_circuit(params)
    else:
        return SimulationCalculateResponse(
            simulation_type=sim_type,
            calculated_values={},
            formulas_applied=[],
            circuit_status="unknown",
            status_message=f"Simulation model '{sim_type}' is not recognized."
        )

def _calc_led_resistor(params: Dict[str, float]) -> SimulationCalculateResponse:
    v_in = max(0.0, float(params.get("v_in", 5.0)))
    r_val = max(1.0, float(params.get("r_val", 220.0))) # Min 1 ohm to prevent divide by zero
    v_forward_knee = float(params.get("v_f", 1.9)) # Nominal forward voltage for red LED
    max_safe_current_ma = 25.0

    if v_in < v_forward_knee:
        # LED is sub-threshold / reverse biased
        current_ma = 0.0
        v_led = v_in
        v_resistor = 0.0
        p_resistor_mw = 0.0
        status = "sub_threshold"
        msg = f"Applied voltage ({v_in:.2f}V) is below LED knee threshold ({v_forward_knee:.2f}V). The LED is off."
    else:
        # Forward conducting region (simplified piece-wise linear diode model)
        # Diode bulk internal resistance is modeled at approx 5 Ohms
        r_bulk = 5.0
        r_total = r_val + r_bulk
        current_a = (v_in - v_forward_knee) / r_total
        current_ma = current_a * 1000.0
        v_led = v_forward_knee + (current_a * r_bulk)
        v_resistor = current_a * r_val
        p_resistor_mw = (current_a ** 2) * r_val * 1000.0

        if current_ma > 40.0:
            status = "hazard_burnout"
            msg = f"CRITICAL: Current is {current_ma:.1f} mA (maximum rated limit is {max_safe_current_ma} mA). LED will burnout permanently!"
        elif current_ma > max_safe_current_ma:
            status = "warning"
            msg = f"WARNING: Operating current ({current_ma:.1f} mA) exceeds continuous safety limit ({max_safe_current_ma} mA). Resistor will run hot."
        elif current_ma < 1.0:
            status = "dim"
            msg = f"Low current ({current_ma:.2f} mA). LED is barely glowing."
        else:
            status = "nominal"
            msg = f"Optimal operation: {current_ma:.1f} mA current, standard brightness, safe dissipation ({p_resistor_mw:.1f} mW in resistor)."

    return SimulationCalculateResponse(
        simulation_type="led_resistor",
        calculated_values={
            "supply_voltage_v": round(v_in, 2),
            "resistor_resistance_ohms": round(r_val, 1),
            "led_forward_drop_v": round(v_led, 2),
            "resistor_voltage_v": round(v_resistor, 2),
            "circuit_current_ma": round(current_ma, 2),
            "resistor_power_mw": round(p_resistor_mw, 1),
            "model_assumption": "Simplified piecewise linear diode model with 1.9V threshold and 5Ω bulk resistance"
        },
        formulas_applied=[
            "V_resistor = V_in - V_f",
            "I = (V_in - V_f) / (R_series + R_bulk)",
            "P_R = I^2 * R"
        ],
        circuit_status=status,
        status_message=msg
    )

def _calc_ohms_law(params: Dict[str, float]) -> SimulationCalculateResponse:
    voltage = float(params.get("voltage", 5.0))
    resistance = max(0.1, float(params.get("resistance", 1000.0)))
    
    current_a = voltage / resistance
    current_ma = current_a * 1000.0
    power_w = voltage * current_a
    power_mw = power_w * 1000.0

    if power_w > 0.25:
        status = "warning"
        msg = f"Power dissipation is {power_w:.2f} W, exceeding standard 1/4-Watt (0.25 W) resistor rating! Resistor will overheat."
    else:
        status = "nominal"
        msg = f"Linear Ohm's law: Current is {current_ma:.2f} mA, power dissipation {power_mw:.1f} mW (within 1/4W limit)."

    return SimulationCalculateResponse(
        simulation_type="ohms_law",
        calculated_values={
            "voltage_v": round(voltage, 2),
            "resistance_ohms": round(resistance, 1),
            "current_a": round(current_a, 5),
            "current_ma": round(current_ma, 2),
            "power_dissipation_w": round(power_w, 4),
            "power_dissipation_mw": round(power_mw, 2),
            "safe_for_quarter_watt": power_w <= 0.25
        },
        formulas_applied=[
            "I = V / R",
            "P = V * I = I^2 * R = V^2 / R"
        ],
        circuit_status=status,
        status_message=msg
    )

def _calc_series_parallel(params: Dict[str, float]) -> SimulationCalculateResponse:
    v_in = float(params.get("v_in", 5.0))
    r1 = max(0.1, float(params.get("r1", 1000.0)))
    r2 = max(0.1, float(params.get("r2", 1000.0)))
    mode = params.get("mode", "series") # "series" or "parallel"

    if mode == "parallel":
        r_eq = (r1 * r2) / (r1 + r2)
        i_total_a = v_in / r_eq
        i1_a = v_in / r1
        i2_a = v_in / r2
        v1 = v_in
        v2 = v_in
        formula = "1/Req = 1/R1 + 1/R2 -> Req = (R1 * R2)/(R1 + R2)"
        msg = f"Parallel circuit: Same voltage ({v_in:.2f}V) across both branches. Total Req = {r_eq:.1f} Ω."
    else:
        r_eq = r1 + r2
        i_total_a = v_in / r_eq
        i1_a = i_total_a
        i2_a = i_total_a
        v1 = i_total_a * r1
        v2 = i_total_a * r2
        formula = "Req = R1 + R2 (Current is identical through both components)"
        msg = f"Series circuit: Current is {i_total_a * 1000:.2f} mA throughout. Total Req = {r_eq:.1f} Ω."

    return SimulationCalculateResponse(
        simulation_type="series_parallel",
        calculated_values={
            "mode": mode,
            "supply_voltage_v": round(v_in, 2),
            "r1_ohms": round(r1, 1),
            "r2_ohms": round(r2, 1),
            "equivalent_resistance_ohms": round(r_eq, 2),
            "total_current_ma": round(i_total_a * 1000.0, 2),
            "r1_current_ma": round(i1_a * 1000.0, 2),
            "r2_current_ma": round(i2_a * 1000.0, 2),
            "r1_voltage_v": round(v1, 2),
            "r2_voltage_v": round(v2, 2)
        },
        formulas_applied=[
            formula,
            "I_total = V_in / Req",
            "P_total = V_in * I_total"
        ],
        circuit_status="nominal",
        status_message=msg
    )

def _calc_voltage_divider(params: Dict[str, float]) -> SimulationCalculateResponse:
    v_in = float(params.get("v_in", 5.0))
    r1 = max(0.1, float(params.get("r1", 10000.0)))
    r2 = max(0.1, float(params.get("r2", 10000.0)))
    r_load = params.get("r_load", None) # Optional load resistor

    # Unloaded output
    v_out_unloaded = v_in * (r2 / (r1 + r2))
    
    values = {
        "supply_voltage_v": round(v_in, 2),
        "r1_ohms": round(r1, 1),
        "r2_ohms": round(r2, 1),
        "unloaded_vout_v": round(v_out_unloaded, 3),
        "divider_ratio": round(r2 / (r1 + r2), 4)
    }

    if r_load is not None and float(r_load) > 0:
        rl = float(r_load)
        r2_parallel = (r2 * rl) / (r2 + rl)
        v_out_loaded = v_in * (r2_parallel / (r1 + r2_parallel))
        droop_pct = ((v_out_unloaded - v_out_loaded) / v_out_unloaded) * 100.0 if v_out_unloaded > 0 else 0.0
        
        values["load_resistance_ohms"] = round(rl, 1)
        values["loaded_vout_v"] = round(v_out_loaded, 3)
        values["voltage_droop_percent"] = round(droop_pct, 1)

        if droop_pct > 20.0:
            status = "warning"
            msg = f"Heavy loading effect: Output dropped by {droop_pct:.1f}% (from {v_out_unloaded:.2f}V to {v_out_loaded:.2f}V) because load R ({rl}Ω) is comparable to or smaller than R2."
        else:
            status = "nominal"
            msg = f"Slight loading effect ({droop_pct:.1f}% droop). High load impedance maintains divider ratio."
    else:
        values["load_resistance_ohms"] = None
        values["loaded_vout_v"] = round(v_out_unloaded, 3)
        values["voltage_droop_percent"] = 0.0
        status = "nominal"
        msg = f"Ideal unloaded voltage divider: Vout = {v_out_unloaded:.2f} V ({round(r2 / (r1 + r2) * 100, 1)}% of Vin)."

    return SimulationCalculateResponse(
        simulation_type="voltage_divider",
        calculated_values=values,
        formulas_applied=[
            "V_out(unloaded) = V_in * (R2 / (R1 + R2))",
            "R2_eff = (R2 * R_load) / (R2 + R_load)",
            "V_out(loaded) = V_in * (R2_eff / (R1 + R2_eff))"
        ],
        circuit_status=status,
        status_message=msg
    )

def _calc_sensor_circuit(params: Dict[str, float]) -> SimulationCalculateResponse:
    v_in = float(params.get("v_in", 5.0))
    r_sensor = max(1.0, float(params.get("r_sensor", 5000.0))) # e.g. LDR light/dark
    r_fixed = max(1.0, float(params.get("r_fixed", 10000.0)))
    pot_threshold_ratio = min(1.0, max(0.0, float(params.get("threshold_ratio", 0.5))))

    # Potential divider with sensor
    v_sensor_node = v_in * (r_fixed / (r_sensor + r_fixed))
    v_reference_threshold = v_in * pot_threshold_ratio
    
    # Comparator logic: V_sensor > V_ref -> Output HIGH (V_in), else LOW (0V)
    is_triggered = v_sensor_node >= v_reference_threshold
    v_comparator_out = v_in if is_triggered else 0.0

    return SimulationCalculateResponse(
        simulation_type="sensor_circuit",
        calculated_values={
            "supply_voltage_v": round(v_in, 2),
            "sensor_resistance_ohms": round(r_sensor, 1),
            "fixed_resistor_ohms": round(r_fixed, 1),
            "sensor_node_voltage_v": round(v_sensor_node, 2),
            "reference_threshold_voltage_v": round(v_reference_threshold, 2),
            "comparator_triggered": is_triggered,
            "comparator_output_v": round(v_comparator_out, 2),
            "state_description": "Sensor threshold exceeded - Output ACTIVE" if is_triggered else "Sensor below threshold - Output IDLE"
        },
        formulas_applied=[
            "V_sensor = V_in * (R_fixed / (R_sensor + R_fixed))",
            "V_ref = V_in * Potentiometer_Ratio",
            "V_out = V_in if V_sensor >= V_ref else 0V"
        ],
        circuit_status="nominal" if is_triggered else "idle",
        status_message="Sensor condition active! Comparator output switched HIGH (5V)." if is_triggered else "Sensor condition inactive. Comparator output is LOW (0V)."
    )
