from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CircuitMeasurements(BaseModel):
    supply_voltage: Optional[float] = Field(None, description="Power supply voltage (V)")
    measured_voltage: Optional[float] = Field(None, description="Measured test point voltage (V)")
    measured_current: Optional[float] = Field(None, description="Measured circuit current (mA)")

class TroubleshootingRequest(BaseModel):
    experiment_type: str = Field(..., description="Experiment category (e.g. LED Circuit, Resistor Circuit)")
    problem_description: str = Field(..., min_length=5, description="Student description of the problem")
    observed_symptoms: Optional[str] = Field("", description="Observed visual or thermal symptoms")
    expected_behavior: Optional[str] = Field("", description="Expected reference behavior")
    measurements: CircuitMeasurements = Field(default_factory=CircuitMeasurements)
    image_base64: Optional[str] = Field(None, description="Base64-encoded circuit photo")
    image_mime_type: Optional[str] = Field("image/jpeg", description="MIME type of uploaded image")

class PotentialFaultItem(BaseModel):
    fault: str = Field(..., description="Hypothesized circuit fault")
    likelihood: str = Field(..., description="High, Medium, or Low")
    evidence: str = Field(..., description="Visual or telemetry evidence supporting this fault")

class VerificationTestItem(BaseModel):
    step: int
    test_description: str = Field(..., description="Multimeter or visual test step")
    probe_points: str = Field(..., description="Where to place red and black probes")
    expected_nominal: str = Field(..., description="Expected reading if circuit is healthy")
    safety_rule: str = Field(..., description="Safety precaution for this specific step")

class TroubleshootingReport(BaseModel):
    circuit_observations: str = Field(..., description="Components and physical connections identified")
    potential_faults: List[PotentialFaultItem] = Field(..., description="Ranked potential root causes")
    supporting_evidence: List[str] = Field(..., description="Points correlating visual anomalies and multimeter data")
    missing_information: List[str] = Field(..., description="Data or measurements currently missing")
    verification_tests: List[VerificationTestItem] = Field(..., description="Step-by-step diagnostic verification tests")
    expected_observations: str = Field(..., description="Expected behavior once circuit is properly operating")
    corrective_steps: List[str] = Field(..., description="Actionable wiring and component replacement guidance")
    safety_precautions: List[str] = Field(..., description="Thermal, shock, and equipment protection rules")
    concepts_explained: str = Field(..., description="Underlying electronics concepts (Ohm's law, diode curve, etc.)")
    uncertainty_level: str = Field("Moderate", description="Clear statement of observed evidence vs hypothesis")
    is_live_ai: bool = Field(True, description="Whether generated via live Gemma 4 API")
    model_identifier: str = Field("gemma-4-31b-it", description="Model ID used")

class FollowUpRequest(BaseModel):
    session_id: Optional[str] = None
    experiment_type: str
    problem_description: str
    initial_report_summary: str
    student_question: str
    previous_messages: Optional[List[Dict[str, str]]] = Field(default_factory=list)

class FollowUpResponse(BaseModel):
    reply: str
    suggested_next_checks: List[str]
    model_identifier: str

class SimulationCalculateRequest(BaseModel):
    simulation_type: str = Field(..., description="led_resistor | ohms_law | series_parallel | voltage_divider | sensor_circuit")
    parameters: Dict[str, float] = Field(..., description="Component values and voltage levels")

class SimulationCalculateResponse(BaseModel):
    simulation_type: str
    calculated_values: Dict[str, Any]
    formulas_applied: List[str]
    circuit_status: str  # 'nominal', 'warning', 'hazard_burnout', 'insufficient_voltage'
    status_message: str

class SimulationTutorRequest(BaseModel):
    simulation_type: str
    parameters: Dict[str, float]
    calculated_values: Dict[str, Any]
    student_question: Optional[str] = None

class SimulationTutorResponse(BaseModel):
    explanation: str
    guided_questions: List[str]
    misconceptions: List[str]
    bench_comparison_tips: str
    model_identifier: str

class ExperimentInquiryRequest(BaseModel):
    experiment_title: str
    category: str
    student_question: str
    difficulty: str = "Beginner"

class ExperimentInquiryResponse(BaseModel):
    explanation: str
    takeaways: List[str]
    safety_guideline: str
    model_identifier: str

class InstructorDraftReplyRequest(BaseModel):
    experiment_title: str
    student_description: str
    student_symptoms: Optional[str] = ""
    student_measurements: Optional[Dict[str, Any]] = None

class InstructorDraftReplyResponse(BaseModel):
    draft_reply: str
    key_diagnostic_checks: List[str]
    teaching_note: str
    model_identifier: str

class AssessmentDraftRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"
    count: int = 2

class AssessmentDraftResponse(BaseModel):
    questions: List[Dict[str, Any]]
    model_identifier: str

class GradeSubmissionItem(BaseModel):
    question_id: str
    question_type: str
    student_answer: str
    correct_answer: str
    marks: float
    explanation: Optional[str] = ""

class GradeSubmissionRequest(BaseModel):
    submission_items: List[GradeSubmissionItem]

class GradeSubmissionResponse(BaseModel):
    total_score: float
    max_score: float
    percentage: float
    results: List[Dict[str, Any]]

class VerifyInviteRequest(BaseModel):
    invite_code: str

class VerifyInviteResponse(BaseModel):
    valid: bool
    message: str
