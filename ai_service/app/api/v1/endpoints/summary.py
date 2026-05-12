from fastapi import APIRouter, HTTPException
from app.services.groq_service import groq_service
from pydantic import BaseModel

router = APIRouter()


class SummaryRequest(BaseModel):
    transcript: str


@router.post("/summarize")
async def summarize_case(request: SummaryRequest):
    try:
        summary = await groq_service.generate_summary(
            request.transcript
        )

        return {
            "success": True,
            "summary": summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))