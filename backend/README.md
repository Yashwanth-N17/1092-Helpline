# 1092 Helpline - Node.js Backend Service

This is the primary backend for the 1092 Helpline, built with **Node.js**. It follows a modular architecture and coordinates between the citizen-facing frontend and the specialized Python AI Service layer.

## Features

- **AI Service Integration**: Acts as a high-speed proxy connecting the citizen-facing frontend with the FastAPI `ai_service` for heavy ML processing.
- **Unified Pipeline Proxying**: Forwards unified analysis requests (Severity, Reply, Summary) directly to the Python Brain.
- **Modular Architecture**: Built cleanly with Routes, Controllers, and Services.
- **WebRTC/WebSocket Audio**: Handles live audio chunk streaming between the citizen browser and the telephony logic.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **HTTP Client**: Axios
- **Real-Time**: WebSockets / WebRTC

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation
1. Navigate to the directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file and set the Python service URL:
   ```env
   AI_SERVICE_URL=http://localhost:8001/api/v1
   ```

### Running the Service
```bash
npm run dev
```
The Node.js server will run on `http://localhost:3000`.

## API Request Examples

### 1. Unified Pipeline (Proxies to Python AI Brain)
**Endpoint**: `POST /cases/pipeline/analyze`

**Request**:
```json
{
  "text": "My father hit me"
}
```
**Response**:
```json
{
  "severity": "CRITICAL",
  "reply": "I have noted your emergency. Help is being dispatched immediately, please stay safe and on the line.",
  "summary": "Citizen reported domestic violence from father."
}
```

### 2. Individual Case Analysis (Proxies to Python AI Brain)
**Endpoint**: `POST /cases/analyze`

**Request**:
```json
{
  "text": "The tree has fallen on the road."
}
```

### 3. Individual Case Summary (Proxies to Python AI Brain)
**Endpoint**: `POST /cases/summarize`

**Request**:
```json
{
  "transcript": "Full call transcript text..."
}
```
