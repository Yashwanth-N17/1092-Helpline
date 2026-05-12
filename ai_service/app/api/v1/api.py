from fastapi import APIRouter
from app.api.v1.endpoints import analysis, summary

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