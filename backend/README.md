# 1092 Helpline - Backend

The core application server handling business logic, database management, and real-time WebSocket communication.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: `ws` (WebSockets)
- **Database**: PostgreSQL with Prisma ORM
- **API Communication**: Axios (for AI Service bridge)

## Folder Structure
- `src/controllers`: Request handlers for REST endpoints.
- `src/services`: Business logic and external integrations (WebSocket, AI Bridge).
- `src/routes`: API route definitions.
- `prisma`: Database schema and migrations.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL instance

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/helpline"
   AI_SERVICE_URL="http://localhost:8000"
   PORT=3000
   ```
3. Initialize Database:
   ```bash
   npx prisma migrate dev
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints
See the root `README.md` for a full list of supported endpoints.
