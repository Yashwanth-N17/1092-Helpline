from groq import Groq
from app.core.config import settings

class AnalyzerService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    async def analyze_call(self, text: str):
        prompt = f"""
        Analyze the following emergency helpline transcript and return a JSON object with:
        - emotion: (PANIC, FEAR, ANGER, NEUTRAL, SAD)
        - urgency: (HIGH, MEDIUM, LOW)
        - intent: brief summary of what the user wants
        - location: any location mentioned
        - issue: specific problem
        - prank_score: 0-1 confidence that this is a real call
        - suggested_actions: list of 3 actions for the agent
        
        Transcript: "{text}"
        """
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-8b-8192",
                response_format={"type": "json_object"}
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq Analysis Error: {e}")
            return {
                "emotion": "NEUTRAL",
                "urgency": "LOW",
                "intent": "Unknown",
                "location": "Unknown",
                "issue": "Unknown",
                "prank_score": 0.1,
                "suggested_actions": ["Keep the caller calm", "Ask for location", "Listen carefully"]
            }
