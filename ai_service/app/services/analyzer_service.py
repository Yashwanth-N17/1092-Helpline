import json
import random
import google.generativeai as genai
from app.core.config import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

MOCK_RESPONSES = [
    {
        "emotion": "PANIC",
        "urgency": "HIGH",
        "intent": "Report fire emergency",
        "location": "Rajajinagar, Bengaluru",
        "issue": "Building is on fire on 2nd floor",
        "prank_score": 0.92,
        "confidence": 0.88,
        "suggested_actions": [
            "Dispatch Fire Brigade immediately",
            "Alert nearby hospitals",
            "Notify police for crowd control"
        ],
        "verification_sentence": "You are reporting a fire on the 2nd floor in Rajajinagar, Bengaluru?"
    },
    {
        "emotion": "FEAR",
        "urgency": "HIGH",
        "intent": "Report medical emergency",
        "location": "Koramangala, Bengaluru",
        "issue": "Person collapsed and unresponsive",
        "prank_score": 0.85,
        "confidence": 0.82,
        "suggested_actions": [
            "Send ambulance to Koramangala",
            "Guide caller on CPR steps",
            "Alert nearest hospital ER"
        ],
        "verification_sentence": "You need an ambulance urgently in Koramangala?"
    }
]

class AnalyzerService:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    async def analyze_call(self, text: str) -> dict:
        if settings.AI_MODE == "mock":
            return random.choice(MOCK_RESPONSES)

        prompt = f"""
        You are an emergency call analyzer for the 1092 Helpline in India.
        Analyze the following emergency transcript and return ONLY a JSON object with these fields:
        - emotion: one of PANIC, FEAR, ANGER, CONFUSED, NEUTRAL, SAD
        - urgency: one of HIGH, MEDIUM, LOW
        - intent: brief what caller wants (max 10 words)
        - location: specific location mentioned or "Unknown"
        - issue: specific problem (max 15 words)
        - prank_score: float 0-1 (probability this is a genuine call)
        - confidence: float 0-1 (AI confidence in understanding)
        - suggested_actions: list of exactly 3 actions for agent
        - verification_sentence: a yes/no question to confirm understanding

        Transcript: "{text}"
        """
        try:
            response = self.model.generate_content(prompt)
            text_response = response.text
            
            # Simple JSON extraction
            if "```json" in text_response:
                text_response = text_response.split("```json")[1].split("```")[0].strip()
            elif "```" in text_response:
                text_response = text_response.split("```")[1].split("```")[0].strip()
            
            return json.loads(text_response)
        except Exception as e:
            print(f"[AnalyzerService] Gemini error: {e}")
            return random.choice(MOCK_RESPONSES)
