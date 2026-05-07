from fastapi import APIRouter
from app.api.endpoints import analysis

api_router = APIRouter()
api_router.include_router(analysis.router, tags=["analysis"])
