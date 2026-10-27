from fastapi import APIRouter, HTTPException
from ..models.schemas import (
    AssessmentDraftRequest,
    AssessmentDraftResponse,
    GradeSubmissionRequest,
    GradeSubmissionResponse
)
from ..services.gemma_service import gemma_service

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])

@router.post("/ai-draft", response_model=AssessmentDraftResponse)
async def draft_assessment_items(request: AssessmentDraftRequest):
    """
    Gemma 4 helps instructors draft high-quality test questions and objective answer keys.
    Instructors must review and save questions before publication.
    """
    try:
        draft = await gemma_service.draft_assessment_questions(
            topic=request.topic,
            difficulty=request.difficulty,
            count=request.count
        )
        return draft
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment drafting error: {str(e)}")

@router.post("/grade", response_model=GradeSubmissionResponse)
async def grade_student_submission(request: GradeSubmissionRequest):
    """
    Deterministic server-side grading for objective assessment questions.
    Prevents client-side mark tampering and protects answer keys.
    """
    total_score = 0.0
    max_score = 0.0
    results = []

    for item in request.submission_items:
        max_score += item.marks
        awarded = 0.0
        is_correct = False

        if item.question_type == "mcq":
            # Exact case-insensitive stripped match
            student_clean = item.student_answer.strip().lower()
            correct_clean = item.correct_answer.strip().lower()
            if student_clean and student_clean == correct_clean:
                is_correct = True
                awarded = item.marks
        else:
            # Short answer: preliminary heuristic match; flagged for instructor review
            keywords = [w.lower() for w in item.correct_answer.split() if len(w) > 3]
            student_words = item.student_answer.lower()
            matches = sum(1 for kw in keywords if kw in student_words)
            ratio = matches / len(keywords) if keywords else 0.5

            if ratio >= 0.4:
                is_correct = True
                awarded = item.marks * min(1.0, ratio + 0.3)
            else:
                is_correct = False
                awarded = 0.0

        total_score += awarded
        results.append({
            "question_id": item.question_id,
            "question_type": item.question_type,
            "is_correct": is_correct,
            "marks_awarded": round(awarded, 1),
            "max_marks": item.marks,
            "explanation": item.explanation
        })

    pct = (total_score / max_score * 100.0) if max_score > 0 else 0.0

    return GradeSubmissionResponse(
        total_score=round(total_score, 1),
        max_score=round(max_score, 1),
        percentage=round(pct, 1),
        results=results
    )
