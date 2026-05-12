from fastapi import APIRouter, HTTPException
from app.services.deberta_service import deberta_service
from pydantic import BaseModel

router = APIRouter()

class AnalysisRequest(BaseModel):
    text: str

@router.post("/analyze")
async def analyze_text(request: AnalysisRequest):
    try:
        result = await deberta_service.analyze_text(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/severity")
async def detect_severity(request: AnalysisRequest):
    try:
        severity = await deberta_service.detect_severity(request.text)
        return {"severity": severity}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
