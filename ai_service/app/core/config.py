import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "1092 AI Service"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "mock_gemini_key")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    AI_MODE: str = os.getenv("AI_MODE", "mock")  # "mock" or "live"

settings = Settings()
