from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db, SessionLocal
from app.db.models import Profile
from app.db.models_log import PipelineLog
from app.workers.pipeline import run_pipeline_job

router = APIRouter(prefix="/admin", tags=["admin"])

# In-memory job store for demo
last_job = {"started_at": None, "finished_at": None, "stats": None, "status": "idle"}


@router.post("/sync")
def trigger_sync(force: bool = False, db: Session = Depends(get_db)):
    """
    Manually trigger the Google Sheets → PostgreSQL sync pipeline.
    """
    global last_job
    last_job["started_at"] = datetime.utcnow()
    last_job["status"] = "running"
    last_job["stats"] = None

    try:
        stats = run_pipeline_job(manual=True)
        last_job["finished_at"] = datetime.utcnow()
        last_job["status"] = "completed"
        last_job["stats"] = stats
        return {"status": "completed", "message": "Sync finished", "stats": stats}
    except Exception as e:
        last_job["status"] = "failed"
        last_job["stats"] = {"error": str(e)}
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pipeline-status")
def get_pipeline_status():
    """
    Get the status of the last pipeline run and recent logs.
    """
    # Also fetch last few logs from DB for historical view
    logs = []
    try:
        local_db = SessionLocal()
        recent = (
            local_db.query(PipelineLog)
            .order_by(PipelineLog.started_at.desc())
            .limit(5)
            .all()
        )
        logs = [
            {
                "id": l.id,
                "started_at": l.started_at.isoformat(),
                "finished_at": l.finished_at.isoformat() if l.finished_at else None,
                "status": l.status,
                "success": l.success_count,
                "errors": l.error_count,
            }
            for l in recent
        ]
        local_db.close()
    except Exception:
        pass

    return {"current": last_job, "recent_logs": logs}


@router.get("/profiles/count")
def get_profile_count(db: Session = Depends(get_db)):
    """
    Get total active profile count.
    """
    count = db.query(Profile).filter(Profile.is_active == True).count()
    return {"total": count}
