from fastapi import APIRouter
from app.api.v1.endpoints import analysis, summary, pipeline

api_router = APIRouter()

api_router.include_router(
    analysis.router,
    prefix="/analysis",
    tags=["Groq Analysis"]
)

api_router.include_router(
    summary.router,
    prefix="/summary",
    tags=["Groq Summary"]
)

api_router.include_router(
    pipeline.router,
    prefix="/pipeline",
    tags=["Pipeline"]
)