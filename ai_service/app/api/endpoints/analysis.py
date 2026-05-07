from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.analyzer_service import AnalyzerService
import json

router = APIRouter()
analyzer = AnalyzerService()

class AnalysisRequest(BaseModel):
    text: str
    call_id: str

@router.post("/analyze")
async def analyze_text(request: AnalysisRequest):
    result = await analyzer.analyze_call(request.text)
    if isinstance(result, str):
        return json.loads(result)
    return result
