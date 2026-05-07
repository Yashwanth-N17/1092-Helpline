from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_service import GeminiService
from app.services.analyzer_service import AnalyzerService
import base64
import json

router = APIRouter()
analyzer = AnalyzerService()
gemini = GeminiService()

class AnalysisRequest(BaseModel):
    text: str
    call_id: str

class AudioRequest(BaseModel):
    call_id: str
    audio_base64: str

class TTSRequest(BaseModel):
    text: str
    language: str = "kn"


@router.post("/analyze")
async def analyze_text(request: AnalysisRequest):
    """Analyze a text transcript and return structured emergency data."""
    result = await analyzer.analyze_call(request.text)
    return result


@router.post("/process-audio")
async def process_audio(request: AudioRequest):
    """
    Direct pipeline using Gemini 1.5 Flash:
    Audio -> Gemini -> (Transcript + Analysis + Response)
    """
    try:
        audio_bytes = base64.b64decode(request.audio_base64)
        
        # Gemini handles STT and Analysis in one call
        result = await gemini.process_audio(audio_bytes)
        
        # Return structured data
        return result

    except Exception as e:
        print(f"[process-audio] Error: {e}")
        return {"transcript": "", "error": str(e)}


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using Bhashini."""
    # Gemini placeholder for TTS
    audio_bytes = await gemini.text_to_speech(request.text, request.language)
    if audio_bytes:
        return {"audio_base64": base64.b64encode(audio_bytes).decode("utf-8")}
    return {"audio_base64": None}
