from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..models.schemas import ExperimentInquiryRequest, ExperimentInquiryResponse
from ..services.gemma_service import gemma_service

router = APIRouter(prefix="/api/experiments", tags=["Experiments"])

# Built-in benchmark experiments matching the SQL seed
BENCHMARK_EXPERIMENTS = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "title": "LED Forward Characteristics & Current Limiting",
        "category": "Diodes & LEDs",
        "difficulty": "Beginner",
        "description": "Investigate the forward voltage drop and operating current of a standard 5mm red LED, and design a protective series resistor network.",
        "learning_objectives": [
            "Measure diode forward knee voltage (Vf ~ 1.8V to 2.1V)",
            "Calculate required current-limiting resistance using R = (Vin - Vf) / If",
            "Observe diode behavior under reverse-bias conditions"
        ],
        "prerequisites": [
            "Basic breadboard wiring",
            "Multimeter DC voltage and current operations",
            "Ohm's law fundamentals"
        ],
        "components_required": [
            "1x Red 5mm LED",
            "1x 220 Ohm 1/4W resistor",
            "1x 1k Ohm 1/4W resistor",
            "Breadboard and jumper wires",
            "5V DC bench power supply",
            "Digital Multimeter (DMM)"
        ],
        "step_by_step_procedure": [
            "Insert the 220 Ohm resistor into breadboard rows 10 and 15.",
            "Connect the LED anode (longer lead) to row 15 and cathode (flat side/shorter lead) to row 20.",
            "Connect row 10 to the +5V supply rail.",
            "Connect row 20 to the ground (0V) supply rail.",
            "Power on bench supply and measure voltage across the LED using DMM in DC Volts mode.",
            "Switch DMM to DC mA mode, break the loop in series, and measure operating current."
        ],
        "expected_readings": {
            "supply_voltage": "5.0 V",
            "expected_v_led": "1.85 V to 2.05 V",
            "expected_v_resistor": "2.95 V to 3.15 V",
            "expected_current": "13.5 mA to 14.5 mA"
        },
        "safety_instructions": [
            "Never connect an LED directly across 5V without a series resistor; immediate burnout will occur.",
            "Ensure correct polarity before applying power.",
            "De-energize circuit before switching multimeter probe jacks to current mode."
        ],
        "is_published": True
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "title": "Ohm's Law Verification and Series-Parallel Networks",
        "category": "Resistor Networks",
        "difficulty": "Beginner",
        "description": "Systematically verify the linear relationship between voltage and current across pure ohmic resistors, and analyze equivalent resistances in series and parallel configurations.",
        "learning_objectives": [
            "Verify I = V/R experimentally across multiple voltage levels",
            "Measure equivalent resistance of series vs parallel combinations",
            "Quantify resistor power dissipation (P = V * I) and thermal limits"
        ],
        "prerequisites": [
            "DC voltage source operation",
            "Ohm's law mathematical formulation"
        ],
        "components_required": [
            "2x 1k Ohm 1/4W resistors",
            "1x 470 Ohm 1/4W resistor",
            "Variable 0-12V DC power supply",
            "Dual digital multimeters",
            "Breadboard"
        ],
        "step_by_step_procedure": [
            "Place two 1k resistors in series on the breadboard.",
            "Apply 5.0V across the pair.",
            "Measure current through the series loop.",
            "Measure the node voltage between the two resistors.",
            "Reconfigure the resistors in parallel across the 5.0V rail and record total current."
        ],
        "expected_readings": {
            "supply_voltage": "5.0 V",
            "series_r_eq": "2000 Ohm",
            "series_current": "2.5 mA",
            "parallel_r_eq": "500 Ohm",
            "parallel_current": "10.0 mA"
        },
        "safety_instructions": [
            "Verify resistor wattage ratings before increasing voltage above 9V to avoid thermal damage.",
            "Turn off bench power supply before reconfiguring series or parallel jumper wires."
        ],
        "is_published": True
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "title": "Voltage Divider and Potentiometric Transducer",
        "category": "Analog Fundamentals",
        "difficulty": "Intermediate",
        "description": "Construct an unloaded and loaded voltage divider network. Analyze how finite meter impedance and subsequent circuit stages introduce loading error.",
        "learning_objectives": [
            "Calculate Vout = Vin * (R2 / (R1 + R2))",
            "Observe and calculate output loading errors caused by low-impedance parallel loads",
            "Calibrate a 10k potentiometer as an adjustable reference voltage divider"
        ],
        "prerequisites": [
            "Thevenin equivalent concepts",
            "Series resistor circuits"
        ],
        "components_required": [
            "1x 10k Ohm potentiometer",
            "2x 10k Ohm resistors",
            "1x 1k Ohm load resistor",
            "5V regulated supply",
            "Digital multimeter"
        ],
        "step_by_step_procedure": [
            "Wire R1 (10k) and R2 (10k) in series across +5V and GND.",
            "Measure unloaded Vout at the divider midpoint.",
            "Connect a 1k Ohm resistor in parallel with R2 to simulate a heavy load.",
            "Measure loaded Vout and calculate the percentage voltage deviation."
        ],
        "expected_readings": {
            "supply_voltage": "5.0 V",
            "unloaded_vout": "2.50 V",
            "loaded_vout": "0.45 V",
            "loading_effect": "82% voltage droop under 1k load"
        },
        "safety_instructions": [
            "Do not short the potentiometer wiper directly between supply and ground.",
            "Double check probe placement before recording loaded potentials."
        ],
        "is_published": True
    }
]

@router.get("", response_model=List[Dict[str, Any]])
async def list_experiments():
    """
    Returns published laboratory experiments for the student library.
    """
    return [exp for exp in BENCHMARK_EXPERIMENTS if exp.get("is_published", False)]

@router.post("/inquire", response_model=ExperimentInquiryResponse)
async def ask_gemma_about_experiment(request: ExperimentInquiryRequest):
    """
    Student asks Gemma 4 questions regarding an experiment's procedure, theory, or safety.
    """
    try:
        response = await gemma_service.explain_experiment(
            experiment_title=request.experiment_title,
            category=request.category,
            student_question=request.student_question,
            difficulty=request.difficulty
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inquiry error: {str(e)}")
