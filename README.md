# 1092 AI Helpline

An AI-powered emergency helpline system designed to assist operators in managing emergency calls more effectively. The system provides real-time transcription, emotion detection, language identification, and automated summarization to prioritize and handle critical situations.

## Project Structure

- **[frontend](file:///c:/Users/yashu/OneDrive/Desktop/WorkSpace/1092%20Helpline/frontend)**: React-based dashboard for helpline agents and administrators.
- **[backend](file:///c:/Users/yashu/OneDrive/Desktop/WorkSpace/1092%20Helpline/backend)**: Node.js server handling WebSockets, Database (Prisma), and coordination between frontend and AI services.
- **[ai_service](file:///c:/Users/yashu/OneDrive/Desktop/WorkSpace/1092%20Helpline/ai_service)**: FastAPI (Python) service handling STT (Bhashini), Analysis (Groq/Llama 3), and TTS.

## Workflow Pipeline

1. **Audio Capture**: Incoming calls via **Twilio**, streamed to the Node.js backend using WebSockets.
2. **STT**: Processed by Bhashini (IndicWhisper) in `ai_service`.
3. **Analysis**: Sentiment, urgency, and intent analysis via Groq (Llama 3).
4. **Verification**: Automated understanding checks via Bhashini TTS.
5. **Storage**: Call packets and analytics stored in PostgreSQL via Prisma.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- PostgreSQL

### Installation & Run

1. **AI Service**:
   ```bash
   cd ai_service
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Backend**:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## License

This project is licensed under the MIT License.
