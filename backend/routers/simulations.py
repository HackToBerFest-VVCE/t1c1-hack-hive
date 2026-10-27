from fastapi import APIRouter, HTTPException
from ..models.schemas import (
    SimulationCalculateRequest,
    SimulationCalculateResponse,
    SimulationTutorRequest,
    SimulationTutorResponse
)
from ..services.simulation_engine import calculate_simulation
from ..services.gemma_service import gemma_service

router = APIRouter(prefix="/api/simulations", tags=["Simulations"])

@router.post("/calculate", response_model=SimulationCalculateResponse)
async def run_simulation_calculation(request: SimulationCalculateRequest):
    """
    Executes transparent, deterministic electrical math (Ohm's Law, KVL, Diode models).
    Calculations are strictly mathematical and never hallucinated.
    """
    try:
        result = calculate_simulation(request.simulation_type, request.parameters)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Simulation calculation error: {str(e)}")

@router.post("/tutor", response_model=SimulationTutorResponse)
async def tutor_simulation_step(request: SimulationTutorRequest):
    """
    Gemma 4 explains why electrical quantities change, guides inquiry, and highlights misconceptions.
    """
    try:
        tutor_response = await gemma_service.explain_simulation(
            sim_type=request.simulation_type,
            parameters=request.parameters,
            calculated_values=request.calculated_values,
            student_question=request.student_question
        )
        return tutor_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation tutoring error: {str(e)}")
