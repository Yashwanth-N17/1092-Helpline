import google.generativeai as genai
import os
import json
import base64
from app.core.config import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

MOCK_SENTENCES = [
    "There is a fire in our building please help us",
    "My father collapsed and is not breathing",
    "Someone is trying to break into my house",
]

class GeminiService:
    def __init__(self):
        # We use flash for speed
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    async def process_audio(self, audio_bytes: bytes, language: str = "kn") -> dict:
        """
        Processes audio directly using Gemini 1.5 Flash via inline data.
        """
        if settings.AI_MODE == "mock":
            import random
            return {
                "transcript": random.choice(MOCK_SENTENCES),
                "urgency": "High",
                "emotion": "Panic",
                "category": "Fire",
                "verification_sentence": "Stay calm, help is on the way."
            }

        try:
            # Prepare audio part for Gemini
            audio_part = {
                "mime_type": "audio/webm", # Most browsers record in webm
                "data": base64.b64encode(audio_bytes).decode("utf-8")
            }
            
            prompt = """
            You are an AI Emergency Dispatcher for the 1092 Helpline. 
            Your goal is to gather critical information from the caller (Kannada or English).
            
            1. Transcribe the audio exactly.
            2. Analyze the emergency:
               - urgency: (Low, Medium, High, Critical)
               - emotion: (Panic, Calm, Crying, Aggressive)
               - category: (Fire, Medical, Crime, Accident, Other)
            3. respond_text: Based on what you heard, ask the NEXT most important question.
               - If you don't know the location, ASK for it.
               - If you don't know the nature of the emergency, ASK for it.
               - If they are panicking, comfort them first then ask.
               - Keep it brief and professional.
            
            Return ONLY a valid JSON object:
            {"transcript": "...", "urgency": "...", "emotion": "...", "category": "...", "respond_text": "..."}
            """

            response = self.model.generate_content([prompt, audio_part])
            
            text_response = response.text.strip()
            # Advanced JSON extraction
            if "{" in text_response and "}" in text_response:
                start = text_response.find("{")
                end = text_response.rfind("}") + 1
                text_response = text_response[start:end]
            
            result = json.loads(text_response)
            
            # Ensure mandatory fields
            if "respond_text" not in result:
                result["respond_text"] = "I am listening. Please continue."
            
            return result

        except Exception as e:
            print(f"[GeminiService] Error: {e}")
            return {
                "transcript": "Listening...",
                "urgency": "Normal",
                "emotion": "Neutral",
                "category": "Other",
                "verification_sentence": "We are listening, please continue."
            }

    async def text_to_speech(self, text: str, language: str = "kn") -> bytes | None:
        return None
