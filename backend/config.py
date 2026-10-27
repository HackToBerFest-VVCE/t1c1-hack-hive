import os
from typing import List
from dotenv import load_dotenv

# Load from .env if present
load_dotenv()

class Settings:
    APP_NAME: str = "LabSense AI Backend"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "127.0.0.1")
    
    # Gemma 4 / Gemini API settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    # Verified Gemma 4 multimodal model identifier per Google AI documentation
    GEMMA_MODEL_ID: str = os.getenv("GEMMA_MODEL_ID", "gemma-4-31b-it")
    GEMMA_FALLBACK_MODEL_ID: str = os.getenv("GEMMA_FALLBACK_MODEL_ID", "gemma-4-26b-a4b-it")
    
    # Supabase credentials (server-side only)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    
    # Security: Instructor bootstrap invite code
    INSTRUCTOR_INVITE_CODE: str = os.getenv("INSTRUCTOR_INVITE_CODE", "LABSENSE-INST-2026")
    
    # Allowed CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

settings = Settings()
