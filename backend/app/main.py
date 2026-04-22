from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.core.config import settings, get_cors_origins
from app.db.session import engine
from app.db.models import Base
from app.db.models_log import PipelineLog
from app.api import profiles, analytics, admin, match, chat, auth
from app.workers.scheduler import start_scheduler, shutdown_scheduler

# Create all tables (profiles + pipeline_log)
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: start APScheduler
    start_scheduler()
    yield
    # Shutdown: stop scheduler
    shutdown_scheduler()


app = FastAPI(
    title="RishtaConnect API",
    description="Backend for RishtaConnect 3D matrimonial webapp",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(profiles.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(match.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


# Health check
@app.get("/health")
def health():
    return {"status": "healthy", "service": "backend"}


# Root
@app.get("/")
def root():
    return {"message": "RishtaConnect API", "docs": "/docs"}
