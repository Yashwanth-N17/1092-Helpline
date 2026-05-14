import google.generativeai as genai
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use safety settings to ensure appropriate emergency responses
            self.model = genai.GenerativeModel(self.model_name)
        else:
            self.model = None
            logger.warning("GEMINI_API_KEY is missing. Gemini replies will be mocked.")

    async def generate_reply(self, transcript: str) -> str:
        """
        Generate context-aware, safe response to the caller
        """
        if not self.model:
            return "I have noted your issue. Help is on the way."

        prompt = f"""
You are an emergency responder AI for the 1092 Helpline.
Your goal is to provide a brief, calming, and context-aware safe response to the caller based on their transcript.
Do NOT ask multiple questions. Acknowledge the emergency and reassure them that help is coming.
Limit your response to 1-2 short sentences.

Caller Transcript: {transcript}

AI Reply:
"""

        try:
            response = await self.model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating Gemini reply: {e}")
            return "Help is on the way. Please stay safe and stay on the line."

gemini_service = GeminiService()
