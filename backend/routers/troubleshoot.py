from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import base64
from ..models.schemas import (
    TroubleshootingRequest,
    TroubleshootingReport,
    FollowUpRequest,
    FollowUpResponse,
    CircuitMeasurements
)
from ..services.gemma_service import gemma_service

router = APIRouter(prefix="/api/troubleshoot", tags=["Troubleshooting"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 # 10MB

@router.post("", response_model=TroubleshootingReport)
async def analyze_circuit(request: TroubleshootingRequest):
    """
    Main multimodal circuit troubleshooting endpoint.
    Accepts JSON payload containing problem description, bench telemetry, and optional base64 circuit photo.
    """
    try:
        report = await gemma_service.analyze_circuit(
            experiment_type=request.experiment_type,
            problem_description=request.problem_description,
            observed_symptoms=request.observed_symptoms or "",
            expected_behavior=request.expected_behavior or "",
            measurements=request.measurements.model_dump(),
            image_base64=request.image_base64,
            image_mime_type=request.image_mime_type or "image/jpeg"
        )
        return report
    except RuntimeError as re:
        raise HTTPException(status_code=502, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic analysis error: {str(e)}")

@router.post("/upload", response_model=TroubleshootingReport)
async def analyze_circuit_multipart(
    image: UploadFile = File(...),
    experiment_type: str = Form(...),
    problem_description: str = Form(...),
    observed_symptoms: Optional[str] = Form(""),
    expected_behavior: Optional[str] = Form(""),
    supply_voltage: Optional[float] = Form(None),
    measured_voltage: Optional[float] = Form(None),
    measured_current: Optional[float] = Form(None)
):
    """
    Multipart form-data variant for direct multipart uploads from HTML forms.
    """
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{image.content_type}'. Supported: JPEG, PNG, WebP."
        )

    file_bytes = await image.read()
    if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the 10 MB limit."
        )

    b64_str = base64.b64encode(file_bytes).decode("utf-8")
    measurements = {
        "supply_voltage": supply_voltage,
        "measured_voltage": measured_voltage,
        "measured_current": measured_current
    }

    try:
        report = await gemma_service.analyze_circuit(
            experiment_type=experiment_type,
            problem_description=problem_description,
            observed_symptoms=observed_symptoms or "",
            expected_behavior=expected_behavior or "",
            measurements=measurements,
            image_base64=b64_str,
            image_mime_type=image.content_type
        )
        return report
    except RuntimeError as re:
        raise HTTPException(status_code=502, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic analysis error: {str(e)}")

@router.post("/follow-up", response_model=FollowUpResponse)
async def handle_follow_up(request: FollowUpRequest):
    """
    Multi-turn follow-up question answering for active diagnostic sessions.
    """
    try:
        response = await gemma_service.answer_follow_up(
            experiment_type=request.experiment_type,
            problem_description=request.problem_description,
            initial_report_summary=request.initial_report_summary,
            student_question=request.student_question,
            previous_messages=request.previous_messages
        )
        return response
    except RuntimeError as re:
        raise HTTPException(status_code=502, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Follow-up error: {str(e)}")
