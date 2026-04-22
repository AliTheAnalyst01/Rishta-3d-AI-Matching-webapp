# AGENTS.md — Kilo CLI Instructions

## Quick Dev Commands

### Setup
```bash
# Copy env
cp backend/.env.example backend/.env
# Fill in GOOGLE_SHEETS_CREDENTIALS_B64 (optional: CLAUDE_API_KEY)

# Install Ollama (required for AI features)
# macOS/Linux:
curl -fsSL https://ollama.com/install.sh | sh

# Pull the AI model
ollama pull qwen3:14b

# Start Ollama server
ollama serve

# Start all services with Docker
docker-compose up -d

# Or manually:
# Terminal 1 — PostgreSQL
docker run --name rishta-postgres -e POSTGRES_USER=rishta_user -e POSTGRES_PASSWORD=pass123 -e POSTGRES_DB=rishta_db -p 5432:5432 -d postgres:15-alpine

# Terminal 2 — Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev
```

### Endpoints
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Ollama: http://localhost:11434

### AI Services
AI Match and Chat features require Ollama running locally:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Pull model (first time only)
ollama pull qwen3:14b

# If using Docker, Ollama is included in docker-compose
docker-compose up -d ollama
```

### Trigger Pipeline Manually
```bash
curl -X POST http://localhost:8000/api/admin/sync
```

### Useful DB Queries
```sql
-- Count profiles
SELECT count(*) FROM profiles WHERE is_active = true;

-- Check pipeline logs
SELECT * FROM pipeline_log ORDER BY started_at DESC LIMIT 5;
```

## Lint / Typecheck
```bash
# Frontend lint
cd frontend && npm run lint

# Backend (optional): add to requirements.txt: black, flake8, mypy
```

## Deploy
```bash
# Build and push
docker-compose build
docker-compose up -d

# Or deploy with your favourite PaaS (Fly.io, Railway, Render)
# Use same docker-compose.yml
```
