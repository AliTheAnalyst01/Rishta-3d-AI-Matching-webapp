import httpx

from app.api import chat as chat_api
from app.api import match as match_api


class _DummyResponse:
    def __init__(self, payload, status_code=200):
        self._payload = payload
        self.status_code = status_code

    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError(
                "error",
                request=httpx.Request("POST", "http://test"),
                response=httpx.Response(self.status_code),
            )

    def json(self):
        return self._payload


def test_match_health_healthy(client, monkeypatch):
    class _Client:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_val, exc_tb):
            return False

        def get(self, _url):
            return _DummyResponse({"models": [{"name": "qwen3:14b"}]})

    monkeypatch.setattr(match_api.httpx, "Client", lambda timeout=5.0: _Client())
    resp = client.get("/api/match/health")
    assert resp.status_code == 200
    assert resp.json()["model_ready"] is True


def test_match_score_timeout_falls_back_without_llm(client, seeded_profiles, monkeypatch):
    def _raise_timeout(*args, **kwargs):
        raise httpx.TimeoutException("timeout")

    monkeypatch.setattr(match_api.httpx, "post", _raise_timeout)
    resp = client.post(
        "/api/match/score",
        json={"seeking_gender": "Female", "sect": "Shia", "min_age": 20, "max_age": 40},
    )
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["candidates_considered"] >= 1
    assert len(payload["matches"]) >= 1


def test_match_score_parses_llm_output(client, seeded_profiles, monkeypatch):
    def _ok(*args, **kwargs):
        return _DummyResponse(
            {"message": {"content": "ID:1 Score:91 Reason:Strong sect + city fit"}}
        )

    monkeypatch.setattr(match_api.httpx, "post", _ok)
    resp = client.post(
        "/api/match/score",
        json={"seeking_gender": "Female", "sect": "Shia", "min_age": 20, "max_age": 40},
    )
    assert resp.status_code == 200
    assert resp.json()["matches"][0]["score"] >= 0


def test_chat_works_with_llm(client, seeded_profiles, monkeypatch):
    def _ok(*args, **kwargs):
        return _DummyResponse({"message": {"content": "Here are some matches"}})

    monkeypatch.setattr(chat_api.httpx, "post", _ok)
    resp = client.post("/api/chat/", json={"message": "find shia female in karachi"})
    assert resp.status_code == 200
    body = resp.json()
    assert "reply" in body
    assert body["profiles_found"] >= 0


def test_chat_timeout_returns_profile_fallback(client, seeded_profiles, monkeypatch):
    def _timeout(*args, **kwargs):
        raise httpx.TimeoutException("timeout")

    monkeypatch.setattr(chat_api.httpx, "post", _timeout)
    resp = client.post("/api/chat/", json={"message": "find shia female in karachi"})
    assert resp.status_code == 200
    assert "Found" in resp.json()["reply"]
