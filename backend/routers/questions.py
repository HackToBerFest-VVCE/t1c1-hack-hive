from fastapi import APIRouter, HTTPException
from ..models.schemas import InstructorDraftReplyRequest, InstructorDraftReplyResponse
from ..services.gemma_service import gemma_service

router = APIRouter(prefix="/api/questions", tags=["Instructor Questions"])

@router.post("/ai-draft", response_model=InstructorDraftReplyResponse)
async def draft_instructor_response(request: InstructorDraftReplyRequest):
    """
    Gemma 4 drafts an insightful pedagogical response for the instructor to review/edit before sending.
    """
    try:
        draft = await gemma_service.draft_instructor_reply(
            experiment_title=request.experiment_title,
            student_description=request.student_description,
            student_symptoms=request.student_symptoms or "",
            student_measurements=request.student_measurements
        )
        return draft
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Instructor co-pilot drafting error: {str(e)}")
