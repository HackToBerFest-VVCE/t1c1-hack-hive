from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import troubleshoot, simulations, experiments, questions, assessments, auth
from .services.gemma_service import gemma_service

app = FastAPI(
    title="LabSense AI Backend",
    description="Multimodal Electronics Laboratory Learning Platform Intelligence Layer powered by Gemma 4",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(troubleshoot.router)
app.include_router(simulations.router)
app.include_router(experiments.router)
app.include_router(questions.router)
app.include_router(assessments.router)
app.include_router(auth.router)

@app.get("/api/health")
async def health_check():
    """
    Returns API health, Gemma 4 connection status, and configuration details.
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "gemma_model_id": settings.GEMMA_MODEL_ID,
        "gemma_live_ai_configured": gemma_service.is_live_configured(),
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY),
        "docs_url": "/docs"
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to LabSense AI Multimodal Backend. See /docs for the API specification."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
