from app.api.auth import create_token


def test_health_endpoint(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "healthy"
    assert body["service"] == "backend"


def test_auth_signup_login_me_flow(client):
    payload = {
        "full_name": "Qa User",
        "email": "qa.user@example.com",
        "password": "StrongPass123!",
        "gender": "Male",
        "sect": "Shia",
        "caste": "Syed",
        "city_country": "Karachi, Pakistan",
    }
    signup = client.post("/api/auth/signup", json=payload)
    assert signup.status_code == 200
    signup_json = signup.json()
    assert "token" in signup_json
    assert signup_json["user"]["email"] == "qa.user@example.com"

    # Duplicate signup should fail.
    dup = client.post("/api/auth/signup", json=payload)
    assert dup.status_code == 400

    login = client.post(
        "/api/auth/login",
        json={"email": "qa.user@example.com", "password": "StrongPass123!"},
    )
    assert login.status_code == 200
    token = login.json()["token"]

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "qa.user@example.com"


def test_auth_rejects_invalid_credentials_and_missing_token(client):
    login = client.post(
        "/api/auth/login",
        json={"email": "missing@example.com", "password": "wrong"},
    )
    assert login.status_code == 401

    me = client.get("/api/auth/me")
    assert me.status_code == 401
    assert me.json()["detail"] == "Missing auth token"


def test_profiles_endpoints_and_filtering(client, seeded_profiles):
    count = client.get("/api/profiles/count")
    assert count.status_code == 200
    assert count.json()["total"] == 3

    filtered = client.get("/api/profiles/?gender=Female&sect=Shia&limit=10")
    assert filtered.status_code == 200
    data = filtered.json()
    assert len(data) == 1
    assert data[0]["name"] == "Amina"

    profile_id = seeded_profiles[0].id
    detail = client.get(f"/api/profiles/{profile_id}")
    assert detail.status_code == 200
    assert detail.json()["reg_no"] == "R-001"

    missing = client.get("/api/profiles/99999")
    assert missing.status_code == 404


def test_personalized_proposals_authorized(client, db_session, seeded_profiles):
    token = create_token(user_id=1, email="proposal@example.com")
    from app.db.models import User

    user = User(
        id=1,
        full_name="Proposal User",
        email="proposal@example.com",
        password_hash="x",
        gender="Male",
        sect="Shia",
        caste="Syed",
        city_country="Karachi, Pakistan",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    resp = client.get(
        "/api/auth/proposals?skip=0&limit=5",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert "results" in resp.json()
