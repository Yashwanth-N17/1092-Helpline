import os

def analyze_text_logic(text: str):
    text_lower = text.lower()
    
    # Defaults
    res = {
        "intent": "general",
        "emotion": "neutral",
        "urgency": "low",
        "confidence": 85.0,
        "escalate": False,
        "summary": text[:50] + "..."
    }

    # Danger Keyword Rules
    danger_keywords = ["help", "attack", "knife", "following", "danger", "theft", "accident", "harassment", "chasing"]
    
    if any(k in text_lower for k in ["following", "chasing", "stalking"]):
        res["emotion"] = "fear"
        res["urgency"] = "high"
        res["escalate"] = True
        
    if "HELP" in text or "!!!" in text:
        res["emotion"] = "panic"
        res["urgency"] = "high"
        
    if any(k in text_lower for k in ["knife", "gun", "weapon", "attack", "blood"]):
        res["urgency"] = "critical"
        res["emotion"] = "panic"
        res["escalate"] = True

    if "theft" in text_lower or "stolen" in text_lower:
        res["intent"] = "complaint"
        res["urgency"] = "medium"

    res["verification_sentence"] = f"You are reporting {text_lower}, correct?"
    
    return res