from typing import Dict, Any
from app.core.config import settings
import httpx


class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = settings.GROQ_BASE_URL
        self.model_name = settings.GROQ_MODEL_NAME

    async def generate_summary(self, transcript: str) -> str:
        """
        Generate Case Summary using Groq AI
        """

        if not self.api_key:
            return (
                f"Summary of the case: [MOCK] Citizen reported an issue. "
                f"Transcript length: {len(transcript)} chars."
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model_name,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an AI assistant that summarizes "
                        "citizen complaint calls for government helpline officers."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Summarize the following citizen complaint "
                        f"transcript clearly and concisely:\n\n{transcript}"
                    ),
                },
            ],
            "temperature": 0.3,
            "max_tokens": 200,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.base_url,
                headers=headers,
                json=payload,
            )

            response.raise_for_status()

            data = response.json()

            return data["choices"][0]["message"]["content"]


groq_service = GroqService()