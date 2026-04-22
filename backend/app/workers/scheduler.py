from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.schedulers import SchedulerNotRunningError
from app.workers.pipeline import run_pipeline_job
from app.core.config import settings
import atexit

scheduler = BackgroundScheduler(timezone="UTC")


def start_scheduler():
    """Start the background pipeline scheduler (runs every N hours)."""
    if scheduler.running:
        return

    if not scheduler.get_jobs():
        scheduler.add_job(
            func=scheduled_pipeline,
            trigger=IntervalTrigger(hours=settings.SCHEDULER_HOURS),
            id="google-sheets-pipeline",
            replace_existing=True,
        )

    scheduler.start()
    print(f"Scheduler started — pipeline runs every {settings.SCHEDULER_HOURS}h")


def shutdown_scheduler():
    if not scheduler.running:
        return
    try:
        scheduler.shutdown(wait=True)
    except SchedulerNotRunningError:
        pass


def scheduled_pipeline():
    """Pipeline job wrapper with logging."""
    print("Pipeline job starting...")
    try:
        stats = run_pipeline_job(manual=False)
        print(
            f"Pipeline completed: {stats['success']} profiles synced, {stats['errors']} errors"
        )
    except Exception as exc:
        print(f"Pipeline failed: {exc}")


# Ensure scheduler shuts down cleanly on exit
atexit.register(shutdown_scheduler)
