# Alexander AI Solutions — Backend API

Node.js + Express REST API for the AI-powered remote computer repair platform.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env — set JWT_SECRET and OPENAI_API_KEY at minimum

# 3. (Optional) Set up PostgreSQL
psql -U postgres -c "CREATE DATABASE alexander_ai;"
psql -U postgres -d alexander_ai -f src/db/schema.sql

# 4. Start the server
npm run dev       # development (nodemon)
npm start         # production
```

## Running Without a Database

Set `SKIP_DB=true` in your `.env` (or the default `.env.example` behavior when `DATABASE_URL` is not set). The app will use an in-memory mock with pre-seeded technicians. Data is lost on restart — fine for testing.

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |

**Register body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "full_name": "Jane Doe"
}
```

**Login body:**
```json
{ "email": "user@example.com", "password": "securepass123" }
```

**Response:** `{ token, user: { id, email, full_name } }`

---

### Diagnose *(requires Bearer token)*
| Method | Path | Description |
|--------|------|-------------|
| POST | `/diagnose` | AI diagnosis |

**Body** (`multipart/form-data`):
- `description` (string, required) — problem description
- `image` (file, optional) — photo of the computer/error
- `device_type` (string) — `desktop` or `laptop`
- `device_brand` (string) — e.g. `Dell`, `HP`, `Apple`
- `symptoms` (JSON array string) — e.g. `["won't turn on","no display"]`

**Response:**
```json
{
  "jobId": "uuid",
  "diagnosis": {
    "summary": "...",
    "top_causes": [
      {
        "rank": 1,
        "cause": "Failing Hard Drive",
        "confidence": 87,
        "difficulty": "Moderate",
        "estimated_cost": "$50–120",
        "description": "...",
        "fix_guide": ["Step 1...", "Step 2..."],
        "parts_needed": ["2.5\" SATA SSD"],
        "tools_needed": ["Phillips screwdriver"],
        "warning": null
      }
    ],
    "urgent": false,
    "data_loss_risk": true
  }
}
```

---

### Jobs *(requires Bearer token)*
| Method | Path | Description |
|--------|------|-------------|
| GET | `/jobs` | List your jobs |
| POST | `/jobs` | Create job manually |
| GET | `/jobs/:id` | Get a single job |

---

### Technicians *(requires Bearer token)*
| Method | Path | Description |
|--------|------|-------------|
| GET | `/technicians` | List available technicians |
| POST | `/technicians/request` | Book a remote session |

**Request body:**
```json
{
  "technician_id": "uuid",
  "job_id": "uuid (optional)",
  "scheduled_at": "2025-03-01T14:00:00Z (optional)",
  "notes": "Please help with my GPU issue"
}
```

---

### Health
```
GET /health → { status: "ok", version: "1.0.0", timestamp }
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `JWT_SECRET` | **Yes** | Secret for signing JWTs |
| `DATABASE_URL` | No | PostgreSQL connection string |
| `SKIP_DB` | No | `true` to use in-memory mock |
| `OPENAI_API_KEY` | **Yes** | OpenAI API key |
| `OPENAI_MODEL` | No | Model to use (default: `gpt-4o`) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (for payments) |

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **AI:** OpenAI Vision API (gpt-4o)
- **Database:** PostgreSQL (pg) with in-memory mock fallback
- **File uploads:** Multer
- **Payments:** Stripe
