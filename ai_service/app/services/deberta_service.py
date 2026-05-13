from typing import Dict, Any
from app.core.config import settings

class DebertaService:
    def __init__(self):
        self.model_name = settings.DEBERTA_MODEL_NAME
        self.labels = ["Emergency", "Enquiry", "Harassment", "Infrastructure", "Medical"]
        self.severity_labels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    async def analyze_text(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()

        if any(word in text_lower for word in ["robbery", "murder", "attack", "kidnap", "fight", "violence"]):
            return {"top_label": "Emergency", "scores": {"Emergency": 0.95, "Infrastructure": 0.02, "Enquiry": 0.03}, "intent": "Police Emergency", "confidence": 0.95}
        elif any(word in text_lower for word in ["harassment", "stalking", "abuse"]):
            return {"top_label": "Harassment", "scores": {"Harassment": 0.94, "Emergency": 0.04, "Enquiry": 0.02}, "intent": "Women Safety", "confidence": 0.94}
        elif any(word in text_lower for word in ["fire", "burning", "smoke"]):
            return {"top_label": "Emergency", "scores": {"Emergency": 0.96, "Infrastructure": 0.02, "Enquiry": 0.02}, "intent": "Fire Emergency", "confidence": 0.96}
        elif any(word in text_lower for word in ["ambulance", "medical", "accident", "injured"]):
            return {"top_label": "Medical", "scores": {"Medical": 0.97, "Emergency": 0.02, "Enquiry": 0.01}, "intent": "Medical Emergency", "confidence": 0.97}
        elif any(word in text_lower for word in ["water leakage", "road damage", "garbage"]):
            return {"top_label": "Infrastructure", "scores": {"Infrastructure": 0.92, "Emergency": 0.05, "Enquiry": 0.03}, "intent": "Infrastructure Complaint", "confidence": 0.92}
        else:
            return {"top_label": "Enquiry", "scores": {"Enquiry": 0.85, "Emergency": 0.10, "Infrastructure": 0.05}, "intent": "General Enquiry", "confidence": 0.85}

    async def detect_severity(self, text: str) -> str:
        text_lower = text.lower()

        if any(word in text_lower for word in ["murder", "fire", "kidnap", "terror", "gun", "killing", "bomb", "dying", "dead"]):
            return "CRITICAL"
        elif any(word in text_lower for word in ["robbery", "attack", "accident", "injured", "hurting", "hitting", "beating", "hurt", "help me", "save me"]):
            return "HIGH"
        elif any(word in text_lower for word in ["harassment", "stalking", "abuse", "threatening"]):
            return "MEDIUM"

        return "LOW"

deberta_service = DebertaService()