from typing import Dict, Any
from app.core.config import settings
import httpx
import logging
import asyncio

logger = logging.getLogger(__name__)

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = settings.GROQ_BASE_URL
        self.model_name = settings.GROQ_MODEL_NAME
        
        # Connection Pooling Optimization: 
        # Reuse a single HTTP client across all requests to save TCP/TLS handshake time
        self.client = httpx.AsyncClient(timeout=30.0)
        
        # Simple In-Memory Cache to prevent duplicate processing
        self.cache: Dict[str, str] = {}

    async def generate_summary(self, transcript: str) -> str:
        """
        Generate Case Summary using Groq AI
        """

        if not self.api_key:
            return (
                f"Summary of the case: [MOCK] Citizen reported an issue. "
                f"Transcript length: {len(transcript)} chars."
            )

        # 1. Cache Check: If we've already summarized this exact transcript, return it instantly
        transcript_hash = str(hash(transcript))
        if transcript_hash in self.cache:
            return self.cache[transcript_hash]

        # 2. Context Truncation: Prevent exceeding token limits by capping the input.
        # ~6000 chars is roughly 1500 tokens, a safe limit for fast Groq summarization.
        MAX_CHARS = 6000
        if len(transcript) > MAX_CHARS:
            # Take the most recent/relevant part of the conversation (the end)
            transcript = "..." + transcript[-(MAX_CHARS - 3):]

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
                        "You are a fast and precise AI that summarizes "
                        "citizen complaint calls for government helpline officers. "
                        "Provide a concise, factual summary."
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

        # 3. Retry Logic: AI APIs can blip. We attempt twice before failing.
        max_retries = 2
        for attempt in range(max_retries):
            try:
                # Reusing the existing connection pool
                response = await self.client.post(
                    self.base_url,
                    headers=headers,
                    json=payload,
                )

                response.raise_for_status()
                data = response.json()
                
                summary = data["choices"][0]["message"]["content"]
                
                # Save to cache for future duplicate requests
                self.cache[transcript_hash] = summary
                
                return summary
                
            except httpx.HTTPStatusError as e:
                if attempt == max_retries - 1:
                    logger.error(f"Groq API HTTP error: {e.response.text}")
                    return "Error: Unable to generate summary due to a service error."
                await asyncio.sleep(1) # wait a second before retrying
                
            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(f"Unexpected error communicating with Groq: {e}")
                    return "Error: Failed to process summary."
                await asyncio.sleep(1)