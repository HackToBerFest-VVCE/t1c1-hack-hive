"""
Test Runner for LabSense AI Backend using Python standard unittest / direct execution
"""
import sys
from backend.tests.test_api import (
    test_health_endpoint,
    test_deterministic_led_simulation,
    test_deterministic_ohms_law,
    test_deterministic_voltage_divider,
    test_troubleshooting_endpoint_schema,
    test_experiment_library_endpoint,
    test_objective_grading_deterministic,
    test_instructor_invite_verification,
    test_missing_api_credentials_fallback,
    test_live_vs_fallback_labeling_strict,
    test_markdown_json_parsing_robustness,
    test_invalid_request_validation,
    test_invalid_image_upload_validation
)

def run_all_tests():
    tests = [
        ("Health Endpoint", test_health_endpoint),
        ("Deterministic LED Simulation", test_deterministic_led_simulation),
        ("Deterministic Ohm's Law", test_deterministic_ohms_law),
        ("Deterministic Voltage Divider", test_deterministic_voltage_divider),
        ("Gemma 4 Troubleshooting Schema", test_troubleshooting_endpoint_schema),
        ("Experiment Library API", test_experiment_library_endpoint),
        ("Deterministic Objective Grading", test_objective_grading_deterministic),
        ("Instructor Invite Verification", test_instructor_invite_verification),
        ("Missing API Credentials Fallback", test_missing_api_credentials_fallback),
        ("Live vs Fallback Labeling Strictness", test_live_vs_fallback_labeling_strict),
        ("Markdown JSON Parsing Robustness", test_markdown_json_parsing_robustness),
        ("Invalid Request Validation (422)", test_invalid_request_validation),
        ("Invalid Image MIME Upload (400)", test_invalid_image_upload_validation),
    ]

    passed = 0
    failed = 0
    print("=" * 60)
    print("Running LabSense AI Backend Verification Tests")
    print("=" * 60)

    for name, test_func in tests:
        try:
            test_func()
            print(f"[PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"[FAIL] {name}: {e}")
            failed += 1

    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
