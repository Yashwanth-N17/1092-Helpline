# 1092 Helpline - AI Service Layer

This is the intelligence layer of the 1092 Helpline, built with **FastAPI**. It handles computationally intensive AI tasks that require a Python environment.

## Features

- **DeBERTa v3 Zeroshot**:
    - **AI Analysis**: Classifies intent and provides detailed analysis.
    - **Severity Detection**: Detects incident severity (LOW to CRITICAL).
- **DeepSeek Reasoner**:
    - **Case Summary Generation**: Generates concise summaries from call transcripts.

## Tech Stack
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Libraries**: Transformers, Torch, Pydantic, HTTPX

## Getting Started

### Prerequisites
- Python installed
- Virtual environment (recommended)

### Installation
1. Navigate to the directory:
   ```bash
   cd ai_service
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` with your API keys.*

### Running the Service
```bash
uvicorn app.main:app --port 8001 --reload
```
The API will be available at `http://localhost:8001`.
Documentation can be found at `http://localhost:8001/api/v1/docs`.

## API Request Examples

### 1. AI Analysis
**Endpoint**: `POST /api/v1/analysis/analyze`
**Request**:
```json
{
  "text": "There is a major water pipeline burst near the main gate of Rajajinagar park."
}
```
**Response**:
```json
{
  "top_label": "Infrastructure",
  "scores": { "Infrastructure": 0.85, "Emergency": 0.1 },
  "intent": "Reporting a water leakage",
  "confidence": 0.92
}
```

### 2. Case Summary
**Endpoint**: `POST /api/v1/summary/summarize`
**Request**:
```json
{
  "transcript": "Citizen: Hello, there is a fire in the building. AI: I understand, what is your location? Citizen: MG Road, Apartment 402."
}
```
**Response**:
```json
{
  "summary": "Emergency fire report at MG Road, Apartment 402. Occupants may be trapped."
}
```
