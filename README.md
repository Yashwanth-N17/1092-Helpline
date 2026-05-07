# 1092 AI Helpline (Modernized)

A high-performance, AI-powered emergency response system that bridges the gap between citizens and responders using WebRTC and Gemini 1.5 Flash.

## Project Structure

- **frontend**: React + Vite + Tailwind CSS dashboard and SOS interface.
- **backend**: Node.js server handling WebRTC signaling, Database (Prisma), and AI coordination.
- **ai_service**: Python FastAPI service leveraging Gemini 1.5 Flash for unified Audio Analysis and Transcription.

## Modernized Architecture (v2.0)

1. **WebRTC Pipeline**: Direct citizen-to-server audio streaming (no Twilio/legacy dependency).
2. **Unified AI Analysis**: Single-pass processing using **Gemini 1.5 Flash** for:
   - Real-time Transcription (Kannada/English).
   - Emotion & Urgency Detection.
   - Intent Analysis & Automated dispatcher interviewing.
3. **Dual-Channel Monitoring**: Simultaneous transcription of both citizen and responder.
4. **Live Voice Bridge**: Low-latency bi-directional voice communication between agent and citizen.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- PostgreSQL (Database)
- Gemini API Key

### Installation & Run

Open three terminal windows and run the following:

#### 1. AI Service (Port 8000)
```bash
cd ai_service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### 2. Backend (Port 3000)
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

#### 3. Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

## Features
- **SOS Page**: Public-facing WebRTC emergency link.
- **Agent Dashboard**: Real-time active call tracking with AI insights.
- **Auto-Escalation**: System automatically triggers human intervention for high-urgency cases.
- **Interactive AI Dispatcher**: AI asks clarifying questions (Location, Nature of emergency) until an agent takes over.

## License
MIT License
