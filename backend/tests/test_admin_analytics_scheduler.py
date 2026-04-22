from app.api import admin as admin_api
from app.workers import scheduler as scheduler_module


def test_analytics_endpoint_shape(client, seeded_profiles):
    resp = client.get("/api/analytics/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_profiles"] == 3
    assert "female_count" in body
    assert "male_count" in body
    assert isinstance(body["top_cities"], list)


def test_admin_pipeline_status_and_count(client, seeded_profiles):
    status = client.get("/api/admin/pipeline-status")
    assert status.status_code == 200
    assert "current" in status.json()
    assert "recent_logs" in status.json()

    count = client.get("/api/admin/profiles/count")
    assert count.status_code == 200
    assert count.json()["total"] == 3


def test_admin_sync_success_and_failure(client, monkeypatch):
    monkeypatch.setattr(
        admin_api,
        "run_pipeline_job",
        lambda manual=True: {"success": 10, "errors": 0, "updated": 10},
    )
    ok = client.post("/api/admin/sync")
    assert ok.status_code == 200
    assert ok.json()["status"] == "completed"

    def _boom(*args, **kwargs):
        raise RuntimeError("sync failed")

    monkeypatch.setattr(admin_api, "run_pipeline_job", _boom)
    failed = client.post("/api/admin/sync")
    assert failed.status_code == 500


def test_scheduler_shutdown_noop_when_not_running():
    # Should not raise even if scheduler was never started.
    scheduler_module.shutdown_scheduler()
