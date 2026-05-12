from fastapi import APIRouter, HTTPException
from app.services.deepseek_service import deepseek_service
from pydantic import BaseModel

router = APIRouter()

class SummaryRequest(BaseModel):
    transcript: str

@router.post("/summarize")
async def summarize_case(request: SummaryRequest):
    try:
        summary = await deepseek_service.generate_summary(request.transcript)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
