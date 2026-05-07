# 1092 Helpline - AI Service

An AI-powered service layer handling complex tasks like Speech-to-Text (STT), Text-to-Speech (TTS), and advanced NLP analysis.

## Tech Stack
- **Framework**: FastAPI (Python)
- **AI Models**: 
  - **STT/TTS**: Bhashini APIs (IndicWhisper, etc.)
  - **Analysis**: Groq API (Llama 3)
  - **NLP**: MuRIL (planned integration)
- **Server**: Uvicorn

## Folder Structure
- `app/api/endpoints`: API route handlers.
- `app/services`: Core AI logic (Bhashini integration, Groq analysis).
- `app/core`: Configuration and security.

## Getting Started

### Prerequisites
- Python 3.9+
- Pip

### Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment:
   Create a `.env` file:
   ```env
   BHASHINI_API_KEY="your_bhashini_key"
   BHASHINI_USER_ID="your_user_id"
   GROQ_API_KEY="your_groq_key"
   ```
4. Start the service:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Key Features
- **Real-time Analysis**: Processes call transcripts for emotion, urgency, and intent.
- **Prank Detection**: Scores calls based on AI confidence.
- **Multi-lingual Support**: Powered by Bhashini for Indian languages.
