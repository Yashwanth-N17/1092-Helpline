# 1092 Helpline - AI Service Layer

This is the intelligence layer of the 1092 Helpline, built with **FastAPI** and powered by **Groq AI**. It handles computationally intensive AI tasks that require a Python environment.

---

## Features

### DeBERTa v3 Zeroshot
- **AI Analysis**
  - Classifies citizen complaint intent
  - Provides detailed AI-based analysis

- **Severity Detection**
  - Detects issue severity levels:
    - LOW
    - MEDIUM
    - HIGH
    - CRITICAL

### Groq AI Integration
- **Case Summary Generation**
  - Generates concise summaries from call transcripts

- **AI Complaint Understanding**
  - Understands emergency situations
  - Extracts actionable complaint information

- **Fast Inference**
  - Powered by Groq ultra-fast LPU inference

---

## Tech Stack

- **Framework**: FastAPI
- **Language**: Python 3.9+
- **AI Models**:
  - DeBERTa v3
  - Groq Llama 3.3 70B
- **Libraries**:
  - Transformers
  - Torch
  - Pydantic
  - HTTPX

---

## Getting Started

### Prerequisites

- Python installed
- Virtual environment (recommended)

---

## Installation

### 1. Navigate to the directory

```bash
cd ai_service
```

### 2. Create and activate virtual environment

```bash
python -m venv venv
```

#### Windows
```bash
venv\Scripts\activate
```

#### Linux / Mac
```bash
source venv/bin/activate
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Configure Environment Variables

Create `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL_NAME=llama-3.3-70b-versatile
```

---

## Running the Service

```bash
uvicorn app.main:app --port 8001 --reload
```

---

## API URLs

### Base URL
```txt
http://localhost:8001
```

### Swagger Documentation
```txt
http://localhost:8001/docs
```

### OpenAPI JSON
```txt
http://localhost:8001/api/v1/openapi.json
```

---

# API Request Examples

---

## 1. AI Analysis

### Endpoint
```http
POST /api/v1/analysis/analyze
```

### Request

```json
{
  "text": "There is a major water pipeline burst near the main gate of Rajajinagar park."
}
```

### Response

```json
{
  "success": true,
  "summary": "Citizen reported a major water pipeline burst near Rajajinagar park requiring immediate repair."
}
```

---

## 2. Severity Detection

### Endpoint
```http
POST /api/v1/analysis/severity
```

### Request

```json
{
  "text": "There is a fire spreading rapidly inside the apartment building."
}
```

### Response

```json
{
  "severity": "CRITICAL"
}
```

---

## 3. Case Summary

### Endpoint
```http
POST /api/v1/summary/summarize
```

### Request

```json
{
  "transcript": "Citizen: Hello, there is a fire in the building. AI: I understand, what is your location? Citizen: MG Road, Apartment 402."
}
```

### Response

```json
{
  "success": true,
  "summary": "Emergency fire reported at MG Road Apartment 402. Immediate assistance required."
}
```

---

# Project Structure

```txt
ai_service/
│
├── app/
│   ├── api/
│   ├── core/
│   ├── services/
│   └── main.py
│
├── requirements.txt
├── .env
└── README.md
```

---

# Groq Model Used

```txt
llama-3.3-70b-versatile
```

---

# Author

1092 Helpline AI Backend Team