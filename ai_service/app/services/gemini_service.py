import google.generativeai as genai
import os
import json
import base64
import tempfile
from app.core.config import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

MOCK_SENTENCES = [
    "There is a fire in our building please help us",
    "My father collapsed and is not breathing",
    "There is a flood in our area send help",
    "Someone is trying to break into my house",
    "There has been a road accident near the highway",
]

class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    async def process_audio(self, audio_bytes: bytes, language: str = "kn") -> dict:
        """
        Processes audio directly using Gemini 1.5 Flash.
        Returns transcript, urgency, emotion, and category.
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
            # Save audio to a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
                temp_audio.write(audio_bytes)
                temp_path = temp_audio.name

            # Upload to Gemini
            audio_file = genai.upload_file(path=temp_path, display_name="Emergency Audio")
            
            prompt = """
            Listen to this audio (mostly in Kannada or English). 
            1. Transcribe the audio precisely.
            2. Analyze the emergency:
               - Urgency: (Low, Medium, High, Critical)
               - Emotion: (Panic, Calm, Crying, Aggressive)
               - Category: (Fire, Medical, Crime, Accident, Natural Disaster, Other)
            3. Provide a short verification sentence in the SAME language as the caller to comfort them.
            
            Return ONLY a JSON object with keys: 
            "transcript", "urgency", "emotion", "category", "verification_sentence"
            """

            response = self.model.generate_content([prompt, audio_file])
            
            # Extract JSON from response
            text_response = response.text
            # Simple JSON extraction (remove markdown code blocks if present)
            if "```json" in text_response:
                text_response = text_response.split("```json")[1].split("```")[0].strip()
            elif "```" in text_response:
                text_response = text_response.split("```")[1].split("```")[0].strip()
            
            result = json.loads(text_response)
            
            # Cleanup temp file
            os.remove(temp_path)
            
            return result
        except Exception as e:
            print(f"[GeminiService] Error: {e}")
            return {
                "transcript": "Error processing audio",
                "urgency": "Unknown",
                "emotion": "Unknown",
                "category": "Other",
                "verification_sentence": "We are having trouble hearing you. Please stay on the line."
            }

    async def text_to_speech(self, text: str, language: str = "kn") -> bytes | None:
        """
        Note: Gemini doesn't do TTS natively yet. 
        For now, we can use a basic alternative or return None.
        """
        # If the user wants a full Gemini experience, they might use Google Cloud TTS.
        # For this shift, we'll keep it as a placeholder or use a simple free alternative.
        return None
