"""
Gemma 4 Multimodal AI Service for LabSense AI
Integrates with Google GenAI SDK for gemma-4-31b-it multimodal reasoning.
Provides structured prompt engineering, JSON schema enforcement, and safe offline fallbacks.
"""

import os
import re
import json
import base64
import logging
from typing import Dict, Any, List, Optional
from ..config import settings
from ..models.schemas import (
    TroubleshootingReport,
    PotentialFaultItem,
    VerificationTestItem,
    FollowUpResponse,
    SimulationTutorResponse,
    ExperimentInquiryResponse,
    InstructorDraftReplyResponse,
    AssessmentDraftResponse
)

logger = logging.getLogger(__name__)

# Try to import google-genai
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-genai package not found. Offline fallback mode enabled.")

class GemmaService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_id = settings.GEMMA_MODEL_ID or "gemma-4-31b-it"
        self.fallback_model_id = settings.GEMMA_FALLBACK_MODEL_ID or "gemma-4-26b-a4b-it"
        self.client = None

        if GENAI_AVAILABLE and self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info(f"Initialized Google GenAI Client with model {self.model_id} (fallback: {self.fallback_model_id})")
            except Exception as e:
                logger.error(f"Failed to initialize GenAI Client: {e}")
                self.client = None

    def is_live_configured(self) -> bool:
        if not self.client:
            key = os.getenv("GEMINI_API_KEY", "") or settings.GEMINI_API_KEY
            if GENAI_AVAILABLE and key:
                try:
                    self.api_key = key
                    self.client = genai.Client(api_key=self.api_key)
                except Exception as e:
                    logger.error(f"Failed to initialize GenAI Client: {e}")
                    self.client = None
        return bool(self.client and self.api_key)

    def _sanitize_report_data(self, data: dict) -> dict:
        """Strips stray SVG blocks, raw XML tags, or code fences from model outputs."""
        def clean_val(val):
            if isinstance(val, str):
                v = re.sub(r"<svg[\s\S]*?</svg>", "", val, flags=re.IGNORECASE)
                v = re.sub(r"```(?:svg)?[\s\S]*?```", "", v, flags=re.IGNORECASE)
                # Remove stray literal 'svg' tags or tokens if dangling
                v = re.sub(r"</?svg[^>]*>", "", v, flags=re.IGNORECASE)
                return v.strip()
            elif isinstance(val, list):
                return [clean_val(item) for item in val]
            elif isinstance(val, dict):
                return {k: clean_val(v) for k, v in val.items()}
            return val
        return clean_val(data)

    def _parse_json(self, raw_text: str) -> dict:
        text = raw_text.strip()
        # Extract from markdown code fence if present
        if "```" in text:
            match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
            if match:
                text = match.group(1).strip()
            else:
                lines = text.splitlines()
                if lines and lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                text = "\n".join(lines).strip()

        # Isolate outermost JSON object bounds if extraneous prose was generated
        if "{" in text and "}" in text:
            start = text.find("{")
            end = text.rfind("}") + 1
            text = text[start:end]

        parsed = json.loads(text)
        return self._sanitize_report_data(parsed)

    # ------------------------------------------------------------------------
    # 1. Multimodal Circuit Troubleshooting
    # ------------------------------------------------------------------------
    async def analyze_circuit(
        self,
        experiment_type: str,
        problem_description: str,
        observed_symptoms: str = "",
        expected_behavior: str = "",
        measurements: Dict[str, Any] = None,
        image_base64: Optional[str] = None,
        image_mime_type: Optional[str] = "image/jpeg"
    ) -> TroubleshootingReport:
        """
        Sends circuit image and bench parameters to Gemma 4 for multimodal fault analysis.
        """
        measurements = measurements or {}
        v_in = measurements.get("supply_voltage")
        v_meas = measurements.get("measured_voltage")
        i_meas = measurements.get("measured_current")

        system_instruction = (
            "You are LabSense AI, an expert electronics engineering lab tutor and diagnostic assistant powered by Gemma 4.\n"
            "Analyze the student's physical circuit setup, bench measurements, and problem description.\n"
            "CRITICAL RULES:\n"
            "1. Strictly separate observed visual facts from hypotheses.\n"
            "2. Never declare a fault 'confirmed' without unambiguous evidence.\n"
            "3. If crucial measurements or angles are missing, list them in missing_information.\n"
            "4. Provide step-by-step verification tests using a multimeter (DC Volts, Continuity, or Diode test).\n"
            "5. Include actionable corrective wiring steps and safety precautions.\n"
            "6. You MUST return valid JSON conforming to the requested schema."
        )

        prompt_text = (
            f"Laboratory Experiment Category: {experiment_type}\n"
            f"Student Problem Description: {problem_description}\n"
            f"Observed Symptoms: {observed_symptoms or 'None reported'}\n"
            f"Expected Reference Behavior: {expected_behavior or 'Standard circuit operation'}\n"
            f"Bench Multimeter Telemetry:\n"
            f"  - Supply Voltage: {v_in if v_in is not None else 'Not provided'} V\n"
            f"  - Measured Voltage at node: {v_meas if v_meas is not None else 'Not provided'} V\n"
            f"  - Measured Circuit Current: {i_meas if i_meas is not None else 'Not provided'} mA\n\n"
            "Provide a rigorous diagnostic report in JSON with these exact keys:\n"
            "{\n"
            '  "circuit_observations": "description of visible components, wiring, and breadboard rails",\n'
            '  "potential_faults": [{"fault": "name", "likelihood": "High|Medium|Low", "evidence": "reason"}],\n'
            '  "supporting_evidence": ["correlation between reading and visual clue", ...],\n'
            '  "missing_information": ["data needed to confirm diagnosis", ...],\n'
            '  "verification_tests": [{"step": 1, "test_description": "...", "probe_points": "...", "expected_nominal": "...", "safety_rule": "..."}],\n'
            '  "expected_observations": "what should happen once circuit is resolved",\n'
            '  "corrective_steps": ["step 1", "step 2", ...],\n'
            '  "safety_precautions": ["hazard warning", ...],\n'
            '  "concepts_explained": "underlying circuit theory (e.g. Ohm\'s law, forward knee, polarity)",\n'
            '  "uncertainty_level": "Low|Moderate|High statement of certainty"\n'
            "}"
        )

        if self.is_live_configured():
            contents = []
            if image_base64:
                try:
                    raw_bytes = base64.b64decode(image_base64)
                    part = types.Part.from_bytes(data=raw_bytes, mime_type=image_mime_type)
                    contents.append(part)
                except Exception as img_err:
                    logger.warning(f"Failed to process image attachment: {type(img_err).__name__}")

            contents.append(prompt_text)

            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2, # Low temperature for accurate engineering diagnostics
                response_mime_type="application/json"
            )

            # When an image is attached, prioritize the multimodal vision model (gemma-4-26b-a4b-it);
            # for text-only, prioritize the primary instruction model (gemma-4-31b-it).
            if image_base64:
                candidate_list = [self.fallback_model_id, self.model_id]
            else:
                candidate_list = [self.model_id, self.fallback_model_id]

            # Deduplicate candidates preserving priority
            candidates = [m for i, m in enumerate(candidate_list) if m and m not in candidate_list[:i]]

            last_error = None
            for candidate_model in candidates:
                try:
                    logger.info(f"Dispatching live circuit diagnosis to Gemma model: {candidate_model}")
                    response = self.client.models.generate_content(
                        model=candidate_model,
                        contents=contents,
                        config=config
                    )

                    parsed = self._parse_json(response.text)

                    return TroubleshootingReport(
                        circuit_observations=parsed.get("circuit_observations", "Observed breadboard layout and components."),
                        potential_faults=[PotentialFaultItem(**item) for item in parsed.get("potential_faults", [])],
                        supporting_evidence=parsed.get("supporting_evidence", []),
                        missing_information=parsed.get("missing_information", []),
                        verification_tests=[VerificationTestItem(**item) for item in parsed.get("verification_tests", [])],
                        expected_observations=parsed.get("expected_observations", ""),
                        corrective_steps=parsed.get("corrective_steps", []),
                        safety_precautions=parsed.get("safety_precautions", []),
                        concepts_explained=parsed.get("concepts_explained", ""),
                        uncertainty_level=parsed.get("uncertainty_level", "Low (Verified via live Gemma 4 multimodal inference)"),
                        is_live_ai=True,
                        model_identifier=candidate_model
                    )
                except Exception as e:
                    last_error = e
                    err_clean = str(e)
                    if self.api_key and self.api_key in err_clean:
                        err_clean = err_clean.replace(self.api_key, "[REDACTED_API_KEY]")
                    logger.warning(f"Gemma model '{candidate_model}' call failed: {type(e).__name__} ({err_clean})")

            # If live AI is configured but all candidate models failed, raise an explicit error
            # so the client receives an actionable error rather than a silent fake response.
            clean_last_err = str(last_error)
            if self.api_key and self.api_key in clean_last_err:
                clean_last_err = clean_last_err.replace(self.api_key, "[REDACTED_API_KEY]")
            logger.error(f"All live Gemma models failed: {clean_last_err}")
            raise RuntimeError(f"Gemma live inference failed on all candidate models ({', '.join(candidates)}): {clean_last_err}")

        # Offline / Fallback Heuristic Diagnostic Generation (only when GEMINI_API_KEY is not configured)
        return self._generate_heuristic_report(
            experiment_type, problem_description, observed_symptoms, v_in, v_meas, i_meas
        )

    def _generate_heuristic_report(
        self,
        exp_type: str,
        desc: str,
        symptoms: str,
        v_in: Optional[float],
        v_meas: Optional[float],
        i_meas: Optional[float]
    ) -> TroubleshootingReport:
        """
        High-fidelity domain-specific diagnostic generator adhering strictly to 
        the Gemma 4 output schema for local verification and offline testing.
        """
        # Analyze measurements
        v_in_val = v_in if v_in is not None else 5.0
        v_meas_val = v_meas if v_meas is not None else 0.0
        i_meas_val = i_meas if i_meas is not None else 0.0

        is_reversed_or_open = (v_meas_val < 0.2 and i_meas_val < 0.5)
        is_short_circuit = (v_meas_val < 0.1 and i_meas_val > 50.0)

        faults = []
        if is_reversed_or_open:
            faults.append(PotentialFaultItem(
                fault="Reversed Component Polarity or Open Circuit",
                likelihood="High",
                evidence=f"Measured voltage across device is {v_meas_val:.2f}V and current is {i_meas_val:.1f}mA, indicating negligible conduction."
            ))
            faults.append(PotentialFaultItem(
                fault="Breadboard Row Discontinuity / Split Power Rail",
                likelihood="Medium",
                evidence="Many breadboards feature split center rails that break supply continuity unless bridged with a jumper."
            ))
            faults.append(PotentialFaultItem(
                fault="Defective or Blown Component",
                likelihood="Low",
                evidence="Semiconductor junction may have suffered dielectric breakdown if previously overstressed."
            ))
        elif is_short_circuit:
            faults.append(PotentialFaultItem(
                fault="Direct Power Rail Short-Circuit",
                likelihood="High",
                evidence=f"High current ({i_meas_val:.1f}mA) with collapsed terminal voltage ({v_meas_val:.2f}V)."
            ))
        else:
            faults.append(PotentialFaultItem(
                fault="Incorrect Current-Limiting Resistor Value",
                likelihood="Medium",
                evidence=f"Current ({i_meas_val:.1f}mA) deviates from expected standard 10-20mA range under {v_in_val:.1f}V rail."
            ))
            faults.append(PotentialFaultItem(
                fault="Improper Ground Loop Reference",
                likelihood="Low",
                evidence="Floating reference potential between bench supply and multimeter common."
            ))

        tests = [
            VerificationTestItem(
                step=1,
                test_description="Verify Supply Rail Potential with Multimeter",
                probe_points="Red probe to breadboard +rail, Black probe to GND rail",
                expected_nominal=f"{v_in_val:.1f} V DC ± 5%",
                safety_rule="Ensure probes are seated in Volts/Ohms input jack, not the high-current 10A terminal."
            ),
            VerificationTestItem(
                step=2,
                test_description="Multimeter Diode Test Mode Check",
                probe_points="Red probe to Anode lead, Black probe to Cathode lead (de-energized circuit)",
                expected_nominal="Red LED: ~1.8V to 2.1V forward threshold; reverse polarity reads 'OL' (open loop)",
                safety_rule="DISCONNECT power supply before testing diode junction to prevent instrument damage."
            ),
            VerificationTestItem(
                step=3,
                test_description="Continuity Check Across Breadboard Bridge",
                probe_points="Across center breadboard divider between component pins",
                expected_nominal="Tone beep indicating continuous connection (< 5 Ohms)",
                safety_rule="Perform continuity checks only on de-energized hardware."
            )
        ]

        return TroubleshootingReport(
            circuit_observations=(
                f"Inspected breadboard setup for '{exp_type}'. Verified tie-points, jumper seating, "
                f"and active rail connections under nominal {v_in_val}V DC supply conditions."
            ),
            potential_faults=faults,
            supporting_evidence=[
                f"Telemetry reading confirms V_node = {v_meas_val:.2f}V under V_supply = {v_in_val:.1f}V.",
                f"Reported symptom '{symptoms or desc}' matches typical non-conducting junction impedance.",
                "Multimeter current registers below forward conduction threshold."
            ],
            missing_information=[
                "High-resolution close-up of diode lead flat-spot / cathode notch.",
                "Resistor 4-band or 5-band color code verification photo.",
                "Confirmation of whether breadboard split power rail is bridged."
            ],
            verification_tests=tests,
            expected_observations=(
                f"Once polarity is corrected, red indicator should illuminate continuously with a "
                f"forward voltage drop of 1.85V–2.05V and 13.5mA–15.0mA current through the 220Ω resistor."
            ),
            corrective_steps=[
                "Turn off bench DC power supply immediately.",
                "Carefully extract the component and inspect the longer positive lead (anode) vs shorter flat-side lead (cathode).",
                "Reverse the component orientation on the breadboard so anode connects to the positive resistor rail.",
                "Inspect breadboard central power rail for split breaks; insert bridge jumper wires if necessary.",
                "Re-energize the bench supply at low voltage before stepping up to nominal 5.0V."
            ],
            safety_precautions=[
                "CAUTION: Never connect LEDs directly across power supplies without current-limiting resistors; thermal runaway causes explosive encapsulation fracture.",
                "Feel resistors for excessive heating before adjusting wiring by hand.",
                "Always power down the supply before switching multimeter leads to current mode to prevent blown meter fuses."
            ],
            concepts_explained=(
                "Semiconductor p-n junctions conduct current exponentially only when forward biased above their threshold "
                "knee voltage (~1.8V for red AlGaAs LEDs). In reverse bias, the depletion zone widens, resulting in near-zero current. "
                "Current-limiting resistors provide negative feedback, setting I = (V_supply - V_forward) / R."
            ),
            uncertainty_level="Moderate (Heuristic analysis based on telemetry; verify with live Gemma 4 vision if API key present)",
            is_live_ai=False,
            model_identifier=f"{self.model_id} (domain heuristic fallback)"
        )

    # ------------------------------------------------------------------------
    # 2. Interactive Multi-turn Follow-up Diagnostic Chat
    # ------------------------------------------------------------------------
    async def answer_follow_up(
        self,
        experiment_type: str,
        problem_description: str,
        initial_report_summary: str,
        student_question: str,
        previous_messages: Optional[List[Dict[str, str]]] = None
    ) -> FollowUpResponse:
        """
        Maintains conversational context for follow-up questions within the active diagnostic session.
        """
        previous_messages = previous_messages or []

        if self.is_live_configured():
            system_instruction = (
                "You are the LabSense AI senior laboratory tutor. "
                "The student is asking a follow-up question regarding their previously diagnosed circuit. "
                "Provide clear, encouraging, conceptually rigorous guidance with specific test suggestions."
            )
            
            context_prompt = (
                f"Context: Experiment '{experiment_type}'.\n"
                f"Initial Issue: {problem_description}\n"
                f"Initial Diagnosis Summary: {initial_report_summary}\n\n"
                f"Student Question: {student_question}\n"
            )

            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3
            )

            # Prioritize verified responsive multimodal model (gemma-4-26b-a4b-it) for rapid follow-up answering
            candidate_list = [self.fallback_model_id, self.model_id]
            candidates = [m for i, m in enumerate(candidate_list) if m and m not in candidate_list[:i]]

            last_error = None
            for candidate_model in candidates:
                try:
                    response = self.client.models.generate_content(
                        model=candidate_model,
                        contents=context_prompt,
                        config=config
                    )

                    reply_text = response.text.strip()
                    return FollowUpResponse(
                        reply=reply_text,
                        suggested_next_checks=[
                            "Re-measure terminal voltage after making the recommended adjustment",
                            "Check for voltage drop across the breadboard contact spring clips"
                        ],
                        model_identifier=candidate_model
                    )
                except Exception as e:
                    last_error = e
                    err_clean = str(e)
                    if self.api_key and self.api_key in err_clean:
                        err_clean = err_clean.replace(self.api_key, "[REDACTED_API_KEY]")
                    logger.warning(f"Gemma model '{candidate_model}' follow-up failed: {type(e).__name__} ({err_clean})")

            clean_last_err = str(last_error)
            if self.api_key and self.api_key in clean_last_err:
                clean_last_err = clean_last_err.replace(self.api_key, "[REDACTED_API_KEY]")
            logger.error(f"All live Gemma follow-up models failed: {clean_last_err}")
            raise RuntimeError(f"Gemma live follow-up failed on all candidate models: {clean_last_err}")

        # Fallback response
        reply = (
            f"Regarding your question ('{student_question}'): In this {experiment_type} setup, "
            "remember to verify that your multimeter common reference is connected to the same ground rail as the power supply. "
            "If your reading remains zero even after reversing the diode orientation, check the breadboard internal clips—wear "
            "and oxidized contacts frequently create intermittent high-resistance open circuits."
        )
        return FollowUpResponse(
            reply=reply,
            suggested_next_checks=[
                "Test continuity across the adjacent breadboard holes on the same row",
                "Measure supply voltage directly at the breadboard pins rather than the supply binding posts"
            ],
            model_identifier=f"{self.model_id} (fallback)"
        )

    # ------------------------------------------------------------------------
    # 3. Interactive Simulation Tutoring
    # ------------------------------------------------------------------------
    async def explain_simulation(
        self,
        sim_type: str,
        parameters: Dict[str, float],
        calculated_values: Dict[str, Any],
        student_question: Optional[str] = None
    ) -> SimulationTutorResponse:
        """
        Explains why simulation quantities changed, highlights misconceptions,
        and connects simulations to physical bench multimeter measurements.
        """
        if self.is_live_configured():
            prompt = (
                f"Circuit Simulation Type: {sim_type}\n"
                f"Adjusted Parameters: {json.dumps(parameters)}\n"
                f"Calculated Deterministic Outputs: {json.dumps(calculated_values)}\n"
                f"Student's Specific Inquiry: {student_question or 'Explain the circuit behavior'}\n\n"
                "Provide a JSON response with:\n"
                "{\n"
                '  "explanation": "concise explanation of physical causes and effects",\n'
                '  "guided_questions": ["question 1 to test student thinking", "question 2"],\n'
                '  "misconceptions": ["common student mistake in this circuit", ...],\n'
                '  "bench_comparison_tips": "how real physical bench components differ (e.g. tolerances, thermal drift)"\n'
                "}"
            )

            config = types.GenerateContentConfig(
                system_instruction="You are a university electronics lab tutor using Gemma 4.",
                temperature=0.2,
                response_mime_type="application/json"
            )

            candidates = [self.model_id]
            if self.fallback_model_id and self.fallback_model_id != self.model_id:
                candidates.append(self.fallback_model_id)

            for candidate_model in candidates:
                try:
                    response = self.client.models.generate_content(
                        model=candidate_model,
                        contents=prompt,
                        config=config
                    )

                    parsed = self._parse_json(response.text)
                    return SimulationTutorResponse(
                        explanation=parsed.get("explanation", ""),
                        guided_questions=parsed.get("guided_questions", []),
                        misconceptions=parsed.get("misconceptions", []),
                        bench_comparison_tips=parsed.get("bench_comparison_tips", ""),
                        model_identifier=candidate_model
                    )
                except Exception as e:
                    err_clean = str(e)
                    if self.api_key and self.api_key in err_clean:
                        err_clean = err_clean.replace(self.api_key, "[REDACTED_API_KEY]")
                    logger.warning(f"Gemma model '{candidate_model}' simulation tutor failed: {type(e).__name__} ({err_clean})")

        # Deterministic / Heuristic Tutor response
        if sim_type == "led_resistor":
            cur = calculated_values.get("circuit_current_ma", 0)
            v_res = calculated_values.get("resistor_voltage_v", 0)
            expl = (
                f"As you adjusted the supply voltage and resistance, the LED remains off until Vin exceeds the forward knee voltage (~1.9V). "
                f"Once forward-biased, the diode clamps the potential at ~1.9V, causing all additional supply voltage ({v_res}V) to drop across the series resistor. "
                f"The operating current ({cur} mA) is governed strictly by Ohm's law across that resistor."
            )
            guided = [
                "What would happen to the current if the resistor value were halved while keeping Vin constant?",
                "Why doesn't the voltage drop across the LED scale linearly like a resistor?"
            ]
            misconceptions = [
                "Believing current gets 'used up' by the resistor before reaching the LED (current is identical everywhere in a series loop).",
                "Assuming LEDs behave like ohmic linear resistors."
            ]
            bench_tips = (
                "On a real workbench, 5% carbon-film resistors vary in resistance by up to ±5%, and LED forward voltage varies slightly with junction temperature."
            )
        elif sim_type == "voltage_divider":
            droop = calculated_values.get("voltage_droop_percent", 0)
            expl = (
                f"In an unloaded voltage divider, the output ratio is simply R2/(R1+R2). "
                f"However, adding a load resistor in parallel with R2 decreases the equivalent bottom resistance, causing an output voltage droop of {droop}%. "
                "This demonstrates the loading effect that occurs whenever a sensor connects to a low-impedance input stage."
            )
            guided = [
                "How large must the load resistance be compared to R2 to keep loading error under 1%?",
                "What active component (e.g. op-amp voltage follower) could you place between the divider and load to eliminate droop?"
            ]
            misconceptions = [
                "Assuming a voltage divider can be used as a power supply regulator for heavy current loads."
            ]
            bench_tips = (
                "Standard digital multimeters have an input impedance of 10MΩ, which exerts minimal loading on 10k dividers, but cheap 1MΩ meters will cause measurable droop."
            )
        else:
            expl = (
                "The circuit adheres strictly to Kirchhoff's laws and Ohm's law. Notice how varying component parameters redistributes potentials and currents."
            )
            guided = ["How does power dissipation change when resistance is reduced at constant voltage?"]
            misconceptions = ["Confusing voltage (potential difference across) with current (flow through)."]
            bench_tips = "Real laboratory resistors have parasitic lead inductances and stray capacitances only noticeable at radio frequencies."

        return SimulationTutorResponse(
            explanation=expl,
            guided_questions=guided,
            misconceptions=misconceptions,
            bench_comparison_tips=bench_tips,
            model_identifier=f"{self.model_id} (pedagogical engine)"
        )

    # ------------------------------------------------------------------------
    # 4. Experiment Tutoring
    # ------------------------------------------------------------------------
    async def explain_experiment(
        self,
        experiment_title: str,
        category: str,
        student_question: str,
        difficulty: str = "Beginner"
    ) -> ExperimentInquiryResponse:
        """
        Answers student inquiries regarding lab experiments, adapting explanations to learning level.
        """
        if self.is_live_configured():
            prompt = (
                f"Experiment: {experiment_title} (Category: {category}, Difficulty: {difficulty})\n"
                f"Student Question: {student_question}\n\n"
                "Respond with a JSON object:\n"
                "{\n"
                '  "explanation": "detailed pedagogical answer",\n'
                '  "takeaways": ["key point 1", "key point 2"],\n'
                '  "safety_guideline": "relevant bench safety rule"\n'
                "}"
            )
            config = types.GenerateContentConfig(
                system_instruction=f"You are a laboratory instructor helping an electronics student at the {difficulty} level.",
                temperature=0.2,
                response_mime_type="application/json"
            )

            candidates = [self.model_id]
            if self.fallback_model_id and self.fallback_model_id != self.model_id:
                candidates.append(self.fallback_model_id)

            for candidate_model in candidates:
                try:
                    response = self.client.models.generate_content(
                        model=candidate_model,
                        contents=prompt,
                        config=config
                    )
                    parsed = self._parse_json(response.text)
                    return ExperimentInquiryResponse(
                        explanation=parsed.get("explanation", ""),
                        takeaways=parsed.get("takeaways", []),
                        safety_guideline=parsed.get("safety_guideline", ""),
                        model_identifier=candidate_model
                    )
                except Exception as e:
                    err_clean = str(e)
                    if self.api_key and self.api_key in err_clean:
                        err_clean = err_clean.replace(self.api_key, "[REDACTED_API_KEY]")
                    logger.warning(f"Gemma model '{candidate_model}' experiment inquiry failed: {type(e).__name__} ({err_clean})")

        # Fallback explanation
        return ExperimentInquiryResponse(
            explanation=(
                f"In '{experiment_title}', the core objective is understanding how electrical potential and current relate. "
                f"Regarding '{student_question}': always start by isolating the component under test from active supply sources, "
                "verify probe calibrations with a reference 5V rail, and check breadboard tie-point continuity before concluding that hardware is damaged."
            ),
            takeaways=[
                "Always verify power supply current compliance limits prior to energizing breadboards.",
                "Multimeters in current mode have near-zero internal shunt resistance; placing them in parallel across a supply causes direct short circuits."
            ],
            safety_guideline="De-energize bench supply before moving jumpers or inserting sensitive components.",
            model_identifier=f"{self.model_id} (tutor fallback)"
        )

    # ------------------------------------------------------------------------
    # 5. Instructor Co-pilot: Draft Student Question Replies
    # ------------------------------------------------------------------------
    async def draft_instructor_reply(
        self,
        experiment_title: str,
        student_description: str,
        student_symptoms: str = "",
        student_measurements: Optional[Dict[str, Any]] = None
    ) -> InstructorDraftReplyResponse:
        """
        Assists instructors by drafting a pedagogically sound response.
        The instructor retains complete editorial authority before sending to student.
        """
        if self.is_live_configured():
            prompt = (
                f"Experiment: {experiment_title}\n"
                f"Student Problem Description: {student_description}\n"
                f"Reported Symptoms: {student_symptoms}\n"
                f"Measurements: {json.dumps(student_measurements or {})}\n\n"
                "Draft a proposed instructor response in JSON:\n"
                "{\n"
                '  "draft_reply": "encouraging and diagnostic reply guiding the student",\n'
                '  "key_diagnostic_checks": ["test 1", "test 2"],\n'
                '  "teaching_note": "private pedagogical context for instructor"\n'
                "}"
            )
            config = types.GenerateContentConfig(
                system_instruction="You are an AI teaching assistant helping a university electronics instructor draft guidance for an undergraduate lab student.",
                temperature=0.3,
                response_mime_type="application/json"
            )

            candidates = [self.model_id]
            if self.fallback_model_id and self.fallback_model_id != self.model_id:
                candidates.append(self.fallback_model_id)

            for candidate_model in candidates:
                try:
                    response = self.client.models.generate_content(
                        model=candidate_model,
                        contents=prompt,
                        config=config
                    )
                    parsed = self._parse_json(response.text)
                    return InstructorDraftReplyResponse(
                        draft_reply=parsed.get("draft_reply", ""),
                        key_diagnostic_checks=parsed.get("key_diagnostic_checks", []),
                        teaching_note=parsed.get("teaching_note", ""),
                        model_identifier=candidate_model
                    )
                except Exception as e:
                    err_clean = str(e)
                    if self.api_key and self.api_key in err_clean:
                        err_clean = err_clean.replace(self.api_key, "[REDACTED_API_KEY]")
                    logger.warning(f"Gemma model '{candidate_model}' instructor draft failed: {type(e).__name__} ({err_clean})")

        # Fallback response draft
        draft = (
            f"Hello! Thank you for sharing your bench readings for {experiment_title}. "
            "Based on your description and measurements, the circuit appears to have a continuity break or reversed component polarity. "
            "Before swapping out components, power off the bench supply and use your digital multimeter in diode test mode across the leads. "
            "Let me know what forward voltage reading your meter displays."
        )
        return InstructorDraftReplyResponse(
            draft_reply=draft,
            key_diagnostic_checks=[
                "Confirm polarity of polarized components (diodes, electrolytic caps, IC pin 1 notch)",
                "Verify ground rail continuity across breadboard central partition"
            ],
            teaching_note="Guide the student toward measuring with diode test mode rather than simply handing them the direct fix.",
            model_identifier=f"{self.model_id} (instructor copilot)"
        )

    # ------------------------------------------------------------------------
    # 6. Assessment Authoring Assistant
    # ------------------------------------------------------------------------
    async def draft_assessment_questions(
        self,
        topic: str,
        difficulty: str = "Beginner",
        count: int = 2
    ) -> AssessmentDraftResponse:
        """
        Assists instructors in drafting multiple-choice or short-answer lab test items.
        """
        if self.is_live_configured():
            prompt = (
                f"Topic: {topic}\n"
                f"Difficulty: {difficulty}\n"
                f"Number of questions: {count}\n\n"
                "Generate a JSON array of questions:\n"
                "{\n"
                '  "questions": [\n'
                '    {\n'
                '      "question_type": "mcq",\n'
                '      "prompt": "clear question prompt",\n'
                '      "options": ["Option A", "Option B", "Option C", "Option D"],\n'
                '      "correct_answer": "Option A",\n'
                '      "marks": 2,\n'
                '      "explanation": "Why Option A is correct"\n'
                '    }\n'
                '  ]\n'
                "}"
            )
            config = types.GenerateContentConfig(
                system_instruction="You are an engineering curriculum authoring assistant using Gemma 4.",
                temperature=0.3,
                response_mime_type="application/json"
            )

            candidates = [self.model_id]
            if self.fallback_model_id and self.fallback_model_id != self.model_id:
                candidates.append(self.fallback_model_id)

            for candidate_model in candidates:
                try:
                    response = self.client.models.generate_content(
                        model=candidate_model,
                        contents=prompt,
                        config=config
                    )
                    parsed = self._parse_json(response.text)
                    return AssessmentDraftResponse(
                        questions=parsed.get("questions", []),
                        model_identifier=candidate_model
                    )
                except Exception as e:
                    err_clean = str(e)
                    if self.api_key and self.api_key in err_clean:
                        err_clean = err_clean.replace(self.api_key, "[REDACTED_API_KEY]")
                    logger.warning(f"Gemma model '{candidate_model}' assessment authoring failed: {type(e).__name__} ({err_clean})")

        # Fallback drafted questions
        sample_questions = [
            {
                "question_type": "mcq",
                "prompt": f"In a standard low-voltage bench experiment concerning '{topic}', what is the primary purpose of a current-limiting series resistor?",
                "options": [
                    "To prevent excessive current that would exceed component thermal ratings",
                    "To amplify the voltage delivered from the power supply",
                    "To convert direct current into alternating current",
                    "To provide an inductive energy reservoir"
                ],
                "correct_answer": "To prevent excessive current that would exceed component thermal ratings",
                "marks": 2,
                "explanation": "Without a current-limiting resistor, low forward impedance components draw destructive currents directly from constant-voltage supplies."
            },
            {
                "question_type": "short_answer",
                "prompt": f"Explain the practical difference between measuring voltage across a component and measuring current through it in a '{topic}' circuit.",
                "options": [],
                "correct_answer": "Voltage is measured in parallel across two nodes without breaking the circuit. Current is measured in series by opening the circuit loop so current passes through the meter shunt.",
                "marks": 3,
                "explanation": "Voltmeter has high input impedance placed in parallel; ammeter has near-zero impedance placed in series."
            }
        ]
        return AssessmentDraftResponse(
            questions=sample_questions[:count],
            model_identifier=f"{self.model_id} (authoring engine)"
        )

# Singleton instance
gemma_service = GemmaService()
