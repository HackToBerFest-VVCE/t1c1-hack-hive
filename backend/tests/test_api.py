from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["gemma_model_id"] == "gemma-4-31b-it"
    assert "gemma_live_ai_configured" in data

def test_deterministic_led_simulation():
    payload = {
        "simulation_type": "led_resistor",
        "parameters": {
            "v_in": 5.0,
            "r_val": 220.0,
            "v_f": 1.9
        }
    }
    response = client.post("/api/simulations/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["simulation_type"] == "led_resistor"
    assert data["circuit_status"] == "nominal"
    values = data["calculated_values"]
    assert values["supply_voltage_v"] == 5.0
    assert 13.0 <= values["circuit_current_ma"] <= 15.0
    assert 1.8 <= values["led_forward_drop_v"] <= 2.1

def test_deterministic_ohms_law():
    payload = {
        "simulation_type": "ohms_law",
        "parameters": {
            "voltage": 10.0,
            "resistance": 1000.0
        }
    }
    response = client.post("/api/simulations/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["calculated_values"]["current_ma"] == 10.0
    assert data["calculated_values"]["power_dissipation_w"] == 0.1
    assert data["circuit_status"] == "nominal"

def test_deterministic_voltage_divider():
    payload = {
        "simulation_type": "voltage_divider",
        "parameters": {
            "v_in": 10.0,
            "r1": 10000.0,
            "r2": 10000.0
        }
    }
    response = client.post("/api/simulations/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["calculated_values"]["unloaded_vout_v"] == 5.0

def test_troubleshooting_endpoint_schema():
    payload = {
        "experiment_type": "LED Circuit",
        "problem_description": "The red LED does not turn on when bench supply is connected.",
        "observed_symptoms": "Resistor feels warm, LED remains dark.",
        "expected_behavior": "LED should emit red light with 2V drop.",
        "measurements": {
            "supply_voltage": 5.0,
            "measured_voltage": 0.04,
            "measured_current": 0.0
        }
    }
    response = client.post("/api/troubleshoot", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "circuit_observations" in data
    assert len(data["potential_faults"]) > 0
    assert len(data["verification_tests"]) > 0
    assert "safety_precautions" in data
    assert "concepts_explained" in data
    assert "is_live_ai" in data

def test_experiment_library_endpoint():
    response = client.get("/api/experiments")
    assert response.status_code == 200
    experiments = response.json()
    assert len(experiments) >= 3
    assert experiments[0]["title"] == "LED Forward Characteristics & Current Limiting"

def test_objective_grading_deterministic():
    payload = {
        "submission_items": [
            {
                "question_id": "q1",
                "question_type": "mcq",
                "student_answer": "14.1 mA",
                "correct_answer": "14.1 mA",
                "marks": 2.0
            },
            {
                "question_id": "q2",
                "question_type": "mcq",
                "student_answer": "wrong answer",
                "correct_answer": "14.1 mA",
                "marks": 2.0
            }
        ]
    }
    response = client.post("/api/assessments/grade", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_score"] == 2.0
    assert data["max_score"] == 4.0
    assert data["percentage"] == 50.0

def test_instructor_invite_verification():
    # Valid code
    res_valid = client.post("/api/auth/verify-instructor-code", json={"invite_code": "LABSENSE-INST-2026"})
    assert res_valid.status_code == 200
    assert res_valid.json()["valid"] is True

    # Invalid code
    res_invalid = client.post("/api/auth/verify-instructor-code", json={"invite_code": "UNAUTHORIZED_CODE_999"})
    assert res_invalid.status_code == 200
    assert res_invalid.json()["valid"] is False

def test_missing_api_credentials_fallback():
    """Verify that absent API key gracefully triggers offline heuristic with is_live_ai=False."""
    from backend.services.gemma_service import gemma_service
    orig_client = gemma_service.client
    orig_key = gemma_service.api_key
    try:
        gemma_service.client = None
        gemma_service.api_key = ""
        payload = {
            "experiment_type": "LED Forward Characteristics",
            "problem_description": "LED does not emit light when connected to supply rail.",
            "measurements": {"supply_voltage": 5.0, "measured_voltage": 0.05, "measured_current": 0.0}
        }
        response = client.post("/api/troubleshoot", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["is_live_ai"] is False
        assert "heuristic" in data["model_identifier"].lower() or "fallback" in data["model_identifier"].lower()
        assert len(data["potential_faults"]) > 0
    finally:
        gemma_service.client = orig_client
        gemma_service.api_key = orig_key

def test_live_vs_fallback_labeling_strict():
    """Verify strict boolean false for fallback outputs and proper labeling."""
    from backend.services.gemma_service import gemma_service
    orig_client = gemma_service.client
    orig_key = gemma_service.api_key
    try:
        gemma_service.client = None
        gemma_service.api_key = ""
        payload = {
            "experiment_type": "Ohm's Law Verification",
            "problem_description": "Current through series loop registers 0 mA on DMM.",
            "measurements": {"supply_voltage": 5.0, "measured_voltage": 0.0, "measured_current": 0.0}
        }
        response = client.post("/api/troubleshoot", json=payload)
        assert response.status_code == 200
        data = response.json()
        # Live AI must be strictly False when fallback is invoked
        assert data["is_live_ai"] is False
        assert "(domain heuristic fallback)" in data["model_identifier"]
    finally:
        gemma_service.client = orig_client
        gemma_service.api_key = orig_key

def test_markdown_json_parsing_robustness():
    """Verify that _parse_json cleanly handles LLM outputs with markdown code fences."""
    from backend.services.gemma_service import gemma_service
    sample_fenced = "```json\n{\"test_key\": \"test_val\", \"count\": 42}\n```"
    parsed = gemma_service._parse_json(sample_fenced)
    assert parsed["test_key"] == "test_val"
    assert parsed["count"] == 42

def test_invalid_request_validation():
    """Verify that malformed payloads return HTTP 422 with descriptive validation details."""
    # Problem description too short (< 5 chars)
    res_short = client.post("/api/troubleshoot", json={"experiment_type": "LED", "problem_description": "bad"})
    assert res_short.status_code == 422

    # Missing experiment_type
    res_missing = client.post("/api/troubleshoot", json={"problem_description": "Valid length problem description"})
    assert res_missing.status_code == 422

def test_invalid_image_upload_validation():
    """Verify that unsupported MIME types uploaded via multipart return HTTP 400."""
    import io
    fake_pdf = io.BytesIO(b"%PDF-1.4 test file content")
    response = client.post(
        "/api/troubleshoot/upload",
        files={"image": ("test.pdf", fake_pdf, "application/pdf")},
        data={
            "experiment_type": "Diode Test",
            "problem_description": "Valid length problem description here"
        }
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]
