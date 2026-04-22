# Pre-Deployment QA Gate

Run this gate before every deployment.

## 1) Backend unit + API tests

```bash
docker exec rishta_backend sh -lc "pip install -r requirements.txt && pytest"
```

What this covers:
- auth flow: signup/login/me, duplicate users, unauthorized requests
- profile listing/filter/detail + not-found behavior
- admin sync success/failure behavior
- analytics response shape and counts
- AI matching + chat happy paths and timeout fallback paths
- scheduler safe shutdown behavior

## 2) Frontend quality checks

```bash
docker exec rishta_frontend sh -lc "npm install && npm run lint"
```

## 3) Runtime health checks

```bash
curl -sS http://localhost:8000/health
curl -sS http://localhost:8000/api/match/health
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000
```

Expected:
- backend health `healthy`
- match health reports `model_ready: true`
- frontend returns HTTP `200`

## 4) Log sanity checks

```bash
docker logs --since 10m rishta_backend
docker logs --since 10m rishta_frontend
docker logs --since 10m rishta_db
docker logs --since 10m rishta_ollama
```

Block deployment on:
- unhandled exceptions / stack traces
- repeated 5xx bursts
- DB recovery loops
- AI unavailability in active runtime
