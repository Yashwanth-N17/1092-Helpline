from typing import Dict, Any
from app.core.config import settings
from transformers import pipeline
import logging
import asyncio
import torch

logger = logging.getLogger(__name__)

class DebertaService:
    def __init__(self):
        self.model_name = settings.DEBERTA_MODEL_NAME
        
        try:
            # Use GPU if available to speed up inference significantly
            device = 0 if torch.cuda.is_available() else -1
            logger.info(f"Loading Zero-Shot Classification model: {self.model_name} on device: {'GPU' if device == 0 else 'CPU'}")
            self.classifier = pipeline(
                "zero-shot-classification", 
                model=self.model_name,
                device=device
            )
        except Exception as e:
            logger.error(f"Failed to load model {self.model_name}: {e}")
            self.classifier = None

        self.labels = [
            "Emergency",
            "Enquiry",
            "Harassment",
            "Infrastructure",
            "Medical"
        ]

        self.severity_labels = [
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL"
        ]

        # For mapping the detected generic label to a specific intent
        self.intent_labels = [
            "Police Emergency",
            "Fire Emergency",
            "Medical Emergency",
            "Women Safety",
            "Infrastructure Complaint",
            "General Enquiry"
        ]

        self.intent_to_top_label = {
            "Police Emergency": "Emergency",
            "Fire Emergency": "Emergency",
            "Women Safety": "Harassment",
            "Medical Emergency": "Medical",
            "Infrastructure Complaint": "Infrastructure",
            "General Enquiry": "Enquiry"
        }

    async def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Dynamic zero-shot classification for emergency routing
        """
        if not self.classifier:
            logger.warning("Classifier not loaded, using fallback.")
            return {
                "top_label": "Enquiry",
                "scores": {"Enquiry": 1.0},
                "intent": "General Enquiry",
                "confidence": 1.0
            }

        try:
            # Classify over intents using a thread pool so it doesn't block the FastAPI async event loop
            result = await asyncio.to_thread(
                self.classifier, 
                text, 
                candidate_labels=self.intent_labels
            )
            
            intent = result['labels'][0]
            confidence = result['scores'][0]
            top_label = self.intent_to_top_label.get(intent, "Enquiry")
            
            # Calculate scores for top_labels
            scores = {label: 0.0 for label in self.labels}
            for label, score in zip(result['labels'], result['scores']):
                tl = self.intent_to_top_label.get(label, "Enquiry")
                if tl in scores:
                    scores[tl] += score
                    
            # If the model is not very confident, default to General Enquiry
            CONFIDENCE_THRESHOLD = 0.35
            if confidence < CONFIDENCE_THRESHOLD:
                intent = "General Enquiry"
                top_label = "Enquiry"
                    
            return {
                "top_label": top_label,
                "scores": scores,
                "intent": intent,
                "confidence": confidence
            }
        except Exception as e:
            logger.error(f"Error in analyze_text: {e}")
            return {
                "top_label": "Enquiry",
                "scores": {"Enquiry": 1.0},
                "intent": "General Enquiry",
                "confidence": 1.0
            }

    async def detect_severity(self, text: str) -> str:
        """
        Detect severity from LOW to CRITICAL using zero-shot classification
        """
        if not self.classifier:
            return "LOW"
            
        try:
            # Run in a separate thread
            result = await asyncio.to_thread(
                self.classifier,
                text,
                candidate_labels=self.severity_labels
            )
            return result['labels'][0]
        except Exception as e:
            logger.error(f"Error in detect_severity: {e}")
            return "LOW"


deberta_service = DebertaService()