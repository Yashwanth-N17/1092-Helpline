from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio
import logging

from app.services.deberta_service import deberta_service
from app.services.groq_service import groq_service
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)
router = APIRouter()

class PipelineRequest(BaseModel):
    text: str

class PipelineResponse(BaseModel):
    severity: str
    reply: str
    summary: str

@router.post("/analyze", response_model=PipelineResponse)
async def analyze_pipeline(request: PipelineRequest):
    """
    Unified Pipeline endpoint combining:
    1. DeBERTa model for Severity Classification
    2. Gemini API for generating a context-aware safe reply
    3. Groq API for generating a 1-2 line case summary
    """
    try:
        # Run all three AI tasks concurrently to drastically minimize total latency
        severity_task = asyncio.create_task(deberta_service.detect_severity(request.text))
        reply_task = asyncio.create_task(gemini_service.generate_reply(request.text))
        summary_task = asyncio.create_task(groq_service.generate_summary(request.text))

        severity, reply, summary = await asyncio.gather(
            severity_task,
            reply_task,
            summary_task
        )

        return PipelineResponse(
            severity=severity,
            reply=reply,
            summary=summary
        )

    except Exception as e:
        logger.error(f"Error in analyze_pipeline: {e}")
        raise HTTPException(status_code=500, detail=f"Pipeline processing failed: {str(e)}")
