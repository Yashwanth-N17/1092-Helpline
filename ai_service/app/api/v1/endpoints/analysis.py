from fastapi import APIRouter, HTTPException
from app.services.groq_service import groq_service
from pydantic import BaseModel

router = APIRouter()


class AnalysisRequest(BaseModel):
    text: str


@router.post("/analyze")
async def analyze_text(request: AnalysisRequest):
    try:
        summary = await groq_service.generate_summary(request.text)

        return {
            "success": True,
            "summary": summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/severity")
async def detect_severity(request: AnalysisRequest):
    try:
        analysis = await groq_service.generate_summary(
            f"""
            Analyze the severity of this citizen complaint.
            Return only one word:
            LOW, MEDIUM, HIGH, or CRITICAL.

            Complaint:
            {request.text}
            """
        )

        return {
            "severity": analysis.strip()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))