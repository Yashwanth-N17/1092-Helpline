# 1098 AI Helpline — Database Layer

PostgreSQL database layer built with **Sequelize ORM** using CommonJS.

---

## Directory Structure

```
src/database/
├── index.js                        # Sequelize instance (connection)
├── config/
│   └── database.config.js          # Environment-aware DB config
├── models/
│   ├── index.js                    # All models + associations
│   ├── Call.js
│   ├── Transcript.js
│   ├── AIResult.js
│   ├── Alert.js
│   ├── Officer.js
│   ├── Transfer.js
│   └── Notification.js
├── repositories/
│   ├── index.js                    # Single export point
│   ├── callRepository.js
│   ├── transcriptRepository.js
│   ├── aiResultRepository.js
│   ├── alertRepository.js
│   └── officerRepository.js
├── migrations/
│   └── initTables.js               # Sync / create all tables
├── seed/
│   ├── index.js                    # Seed entry point
│   └── seedMockData.js             # Mock data generator
└── utils/
    ├── index.js                    # Barrel export
    ├── constants.js                # Enums (severity, status, etc.)
    ├── helpers.js                  # Reusable utility functions
    └── validators.js               # Input validation functions
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=1098_helpline
DB_USER=postgres
DB_PASSWORD=yourpassword

# Optional
DB_NAME_TEST=1098_helpline_test
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# Production SSL
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true
```

---

## Setup

### 1. Install dependencies

```bash
npm install sequelize pg pg-hstore dotenv
```

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE 1098_helpline;"
```

### 3. Initialize tables

```bash
node src/database/migrations/initTables.js
```

**Flags (via environment variables):**

| Variable | Effect |
|---|---|
| *(none)* | `CREATE TABLE IF NOT EXISTS` — safe for production |
| `ALTER_SYNC=true` | Alters existing tables to match models (dev/staging) |
| `FORCE_SYNC=true` | Drops and recreates all tables — **destroys data** |

```bash
# Development reset
FORCE_SYNC=true node src/database/migrations/initTables.js
```

### 4. Seed mock data

```bash
node src/database/seed/index.js
```

> Seeding is blocked in `NODE_ENV=production` unless `ALLOW_SEED_IN_PROD=true` is set.

---

## package.json Scripts (recommended)

```json
{
  "scripts": {
    "db:init":       "node src/database/migrations/initTables.js",
    "db:seed":       "node src/database/seed/index.js",
    "db:reset":      "FORCE_SYNC=true node src/database/migrations/initTables.js",
    "db:fresh":      "npm run db:reset && npm run db:seed"
  }
}
```

---

## Models & Associations

```
Call
 ├── hasMany Transcript    (call_id)
 ├── hasMany AIResult      (call_id)
 ├── hasMany Alert         (call_id)
 └── hasMany Transfer      (call_id)

Officer
 └── hasMany Transfer      (officer_id)
```

All `hasMany` associations use `onDelete: CASCADE` (except Officer → Transfer which uses `SET NULL`).

---

## Using Repositories

Import from the barrel:

```js
const {
  callRepository,
  transcriptRepository,
  aiResultRepository,
  alertRepository,
  officerRepository,
} = require('./src/database/repositories');
```

### Example — Create a call

```js
const call = await callRepository.createCall({
  caller_phone: '+919876543210',
  language_detected: 'hi',
  status: 'IN_PROGRESS',
});
```

### Example — Fetch calls with pagination

```js
const calls = await callRepository.getAllCalls({ page: 1, limit: 20 });
// Returns: { data: [...], meta: { total, page, limit, totalPages, ... } }
```

### Example — Get call with all related data

```js
const call = await callRepository.getCallById(callId);
// Includes: transcripts, aiResults, alerts, transfers
```

---

## Using Constants

```js
const { SEVERITY, CALL_STATUS, ALERT_CATEGORY } = require('./src/database/utils/constants');

// e.g.
if (aiResult.severity === SEVERITY.CRITICAL) {
  // escalate immediately
}
```

---

## Using Helpers

```js
const { getPagination, formatPaginatedResponse, requiresEscalation, maskPhoneNumber } =
  require('./src/database/utils/helpers');

const { limit, offset, page } = getPagination(req.query);
const result = await Model.findAndCountAll({ limit, offset });
const response = formatPaginatedResponse(result, page, limit);
```

---

## Constants Reference

| Constant | Values |
|---|---|
| `SEVERITY` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `CALL_STATUS` | `INITIATED`, `IN_PROGRESS`, `TRANSFERRED`, `RESOLVED`, `DROPPED`, `MISSED` |
| `ALERT_STATUS` | `OPEN`, `ACKNOWLEDGED`, `RESOLVED`, `DISMISSED` |
| `ALERT_CATEGORY` | `CHILD_ABUSE`, `DOMESTIC_VIOLENCE`, `MISSING_CHILD`, `MEDICAL_EMERGENCY`, `MENTAL_HEALTH`, `EXPLOITATION`, `TRAFFICKING`, `HARASSMENT`, `GENERAL_DISTRESS`, `OTHER` |
| `OFFICER_STATUS` | `AVAILABLE`, `BUSY`, `ON_BREAK`, `OFFLINE` |
| `TRANSFER_STATUS` | `PENDING`, `ACCEPTED`, `COMPLETED`, `FAILED`, `CANCELLED` |
| `SPEAKER_TYPE` | `CALLER`, `AI`, `OFFICER` |
| `NOTIFICATION_TYPE` | `ALERT_CREATED`, `ALERT_ESCALATED`, `TRANSFER_INITIATED`, `TRANSFER_ACCEPTED`, `CALL_DROPPED`, `SYSTEM` |

---

## Production Notes

- Connection pooling is configured via `DB_POOL_*` env vars (defaults: max 20, min 5 in production).
- SSL is supported via `DB_SSL=true` (required for hosted PostgreSQL such as RDS, Supabase, Railway).
- Never run `FORCE_SYNC=true` in production — it drops all tables.
- Seed guard prevents accidental mock data insertion in production.
- All phone numbers are masked in logs via `maskPhoneNumber()`.

---

## Tech Stack

- **Node.js** + **Express.js**
- **PostgreSQL 14+**
- **Sequelize 6** (CommonJS)
- **dotenv**