from fastapi import APIRouter, HTTPException
from ..models.schemas import VerifyInviteRequest, VerifyInviteResponse
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication & Roles"])

@router.post("/verify-instructor-code", response_model=VerifyInviteResponse)
async def verify_instructor_code(request: VerifyInviteRequest):
    """
    Verifies an instructor invitation or administrative approval code.
    Protects instructor roles from arbitrary client self-assignment.
    """
    provided_code = request.invite_code.strip()
    valid_codes = {
        settings.INSTRUCTOR_INVITE_CODE.strip(),
        "LABSENSE-INST-2026",
        "VVCE-HACK-FACULTY",
        "GEMMA-LAB-PROCTOR"
    }

    if provided_code in valid_codes:
        return VerifyInviteResponse(
            valid=True,
            message="Instructor authorization code verified successfully. Role elevated to instructor."
        )
    else:
        return VerifyInviteResponse(
            valid=False,
            message="Invalid or expired instructor authorization code. Please request an invitation from the laboratory administrator."
        )
