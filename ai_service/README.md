# 1092 Helpline - AI Service Layer

This is the intelligence layer of the 1092 Helpline, built with **FastAPI**. It handles computationally intensive AI tasks that require a Python environment.

## Features

- **DeBERTa v3 Zeroshot**
  - **AI Analysis**: Classifies citizen intent and emergency type
  - **Severity Detection**: Detects severity from LOW to CRITICAL

- **DeepSeek Reasoner**
  - **Case Summary Generation**: Generates concise summaries from transcripts

## Tech Stack

- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Libraries**: Transformers, Torch, Pydantic, HTTPX

---

## Getting Started

### Prerequisites

- Python installed
- Virtual environment (recommended)

---

### Installation

1. Navigate to directory:

```bash
cd ai_service
```

2. Create virtual environment:

```bash
python -m venv venv
```

3. Activate environment:

Windows:

```bash
venv\Scripts\activate
```

Linux/Mac:

```bash
source venv/bin/activate
```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Environment setup:

```bash
cp .env.example .env
```

Edit `.env` with API keys if required.

---

## Running the Service

Run:

```bash
python -m uvicorn app.main:app --reload
```

Service will run at:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

---

## API Endpoints

### 1. AI Analysis

**Endpoint**

```http
POST /api/v1/analysis/analyze
```

**Request**

```json
{
  "text": "There is a robbery happening near MG Road Bangalore send police immediately"
}
```

**Response**

```json
{
  "top_label": "Emergency",
  "scores": {
    "Emergency": 0.95,
    "Infrastructure": 0.02,
    "Enquiry": 0.03
  },
  "intent": "Police Emergency",
  "confidence": 0.95
}
```

---

### 2. Severity Detection

**Endpoint**

```http
POST /api/v1/analysis/severity
```

**Request**

```json
{
  "text": "There is a murder happening with guns near MG Road"
}
```

**Response**

```json
{
  "severity": "CRITICAL"
}
```

---

### 3. Case Summary Generation

**Endpoint**

```http
POST /api/v1/summary/summarize
```

**Request**

```json
{
  "transcript": "Citizen: Hello, there is a fire in the building. AI: What is your location? Citizen: MG Road Apartment 402."
}
```

**Response**

```json
{
  "summary": "Emergency fire report at MG Road Apartment 402. Occupants may be trapped."
}
```

---

## Notes

Current implementation includes:

- Emergency intent classification
- Severity detection
- AI analysis endpoint
- Summary generation endpoint
- Swagger API testing support

Future integration:

- Real DeBERTa inference
- Telephony integration (Twilio/Exotel alternative)
- Live AI-human escalation routing