from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.deberta_service import deberta_service

router = APIRouter()

class AudioInputRequest(BaseModel):
    text: str
    originalText: str = ""

def detect_language(text: str) -> str:
    kannada_chars = any('\u0C80' <= c <= '\u0CFF' for c in text)
    hindi_chars = any('\u0900' <= c <= '\u097F' for c in text)
    tamil_chars = any('\u0B80' <= c <= '\u0BFF' for c in text)

    if kannada_chars:
        return "Kannada"
    elif hindi_chars:
        return "Hindi"
    elif tamil_chars:
        return "Tamil"
    else:
        return "English"

@router.post("/input")
async def pipeline_input(request: AudioInputRequest):
    try:
        language = detect_language(request.originalText or request.text)
        analysis = await deberta_service.analyze_text(request.text)
        severity = await deberta_service.detect_severity(request.text)

        return {
            "text": request.text,
            "language": language,
            "originalText": request.originalText or request.text,
            "intent": analysis.get("intent", "Unknown"),
            "severity": severity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))