# RishtaConnect 3D Web App

A cinematic 3D matrimonial web app built with Next.js 14 and FastAPI.

## Stack

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS, React Three Fiber
- **Backend:** FastAPI (Python), PostgreSQL, APScheduler
- **AI:** Claude API
- **Deployment:** Docker Compose

## Quick Start

```bash
# Clone and setup
git clone <repo>
cd Rishta_3d_webapp
cp .env.example .env  # Edit with your API keys

# Development (Docker Compose)
docker-compose up -d

# Or run separately
# Backend (API + pipeline)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Production Deployment (Docker)

```bash
# 1) Prepare env
cp .env.example .env
# Edit .env and set strong values:
# - POSTGRES_PASSWORD
# - AUTH_TOKEN_SECRET
# - NEXT_PUBLIC_API_URL
# - CORS_ORIGINS / FRONTEND_URL

# 2) Build and run production stack
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# 3) Verify health
curl http://localhost:3000
curl http://localhost:8000/health
```

## Project Structure

```
.
├── backend/           # FastAPI + PostgreSQL pipeline
│   ├── app/
│   │   ├── api/      # REST endpoints
│   │   ├── core/     # config, security
│   │   ├── db/       # PostgreSQL models
│   │   ├── models/   # Pydantic schemas
│   │   ├── services/ # business logic
│   │   └── workers/  # pipeline + scheduler
│   └── requirements.txt
├── frontend/          # Next.js 14 app
│   ├── app/
│   │   ├── browse/   # profile browser
│   │   ├── profile/  # detail pages
│   │   ├── insights/ # 3D dashboard
│   │   ├── match/    # AI match page
│   │   └── admin/    # pipeline admin
│   └── components/   # shared UI + 3D
├── docker-compose.yml
└── README.md
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_SHEETS_CREDENTIALS` | GCP service account JSON (base64) |
| `CLAUDE_API_KEY` | Anthropic Claude API key |
| `FRONTEND_URL` | Next.js origin for CORS |

## API Endpoints

**Public**
- `GET /api/profiles` – Filtered profile list
- `GET /api/profiles/{id}` – Single profile
- `GET /api/analytics` – Dashboard stats
- `POST /api/match` – AI compatibility scoring
- `POST /api/chat` – Assistant chat

**Admin**
- `POST /api/admin/sync` – Trigger pipeline manually
- `GET /api/admin/pipeline-status` – Last run status

## Phase Delivery

| Phase | Features |
|-------|----------|
| 1 | Pipeline + Profiles API + Browse + Profile Pages |
| 2 | 3D Carousel + Insights Dashboard |
| 3 | AI Match + Chatbot |
