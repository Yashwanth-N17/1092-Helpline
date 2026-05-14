from fastapi import FastAPI
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=f"{settings.PROJECT_NAME} - Groq AI",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="FastAPI backend integrated with Groq AI for citizen complaint analysis and summarization."
)

app.include_router(
    api_router,
    prefix=settings.API_V1_STR
)


@app.get("/")
async def root():
    return {
        "message": "Groq AI Service is running",
        "version": settings.VERSION,
        "model": settings.GROQ_MODEL_NAME,
        "status": "active"
    }