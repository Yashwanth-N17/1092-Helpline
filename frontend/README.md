# 1092 Helpline - Frontend

A modern, responsive web application for the 1092 Helpline, built with React. This project provides an intuitive interface for both users seeking help and administrators managing the helpline services.

## Features

- **User Dashboard**: Track and manage support requests.
- **Admin Dashboard**: Oversee all requests, manage helpline operations, and view analytics.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Make sure you have Node.js installed.
- [Node.js](https://nodejs.org/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## API Documentation

The frontend communicates with the backend via a RESTful API and WebSockets.

### Base URL
- **API**: `http://localhost:3000/api`
- **WebSocket**: `ws://localhost:3000`

### Endpoints

#### Authentication
| Endpoint | Method | Body | Description |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | `{ "agentId": "string", "password": "string" }` | Authenticate agent |
| `/auth/logout` | `POST` | `none` | Invalidate session |

#### Dashboard & Calls
| Endpoint | Method | Query/Params | Description |
| :--- | :--- | :--- | :--- |
| `/dashboard/stats` | `GET` | `none` | General statistics |
| `/calls/active` | `GET` | `none` | Currently active calls |
| `/calls/recent` | `GET` | `?limit=10` | Recent call history |
| `/calls/:id` | `GET` | `id` | Get call details |
| `/calls/:id/interpret` | `PATCH` | `{ "key": "value" }` | Update AI interpretation |
| `/calls/:id/verify` | `POST` | `{ "result": "string" }` | Verify call outcome |
| `/calls/:id/escalate` | `POST` | `none` | Escalate call |
| `/calls/:id/end` | `POST` | `none` | Mark call as completed |

#### Analytics
| Endpoint | Method | Query Params | Description |
| :--- | :--- | :--- | :--- |
| `/analytics/overview` | `GET` | `?from=ISO&to=ISO` | Overall analytics |
| `/analytics/emotions` | `GET` | `?from=ISO&to=ISO` | Emotion trends |
| `/analytics/languages`| `GET` | `?from=ISO&to=ISO` | Language distribution |

### Request JSON Formats

#### Login Request
```json
{
  "agentId": "AGENT_001",
  "password": "securepassword"
}
```

#### Update Interpretation
```json
{
  "summary": "Updated summary of the call...",
  "urgency": "HIGH",
  "location": "Central Park"
}
```

#### Verification Result
```json
{
  "result": "verified"
}
```

---

## Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.
