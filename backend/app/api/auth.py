from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import Optional
import base64
import hashlib
import hmac
import json
import os
import time

from app.db.session import get_db
from app.db.models import User, Profile
from app.models.schemas import UserSignupIn, UserLoginIn, UserOut
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

TOKEN_SECRET = settings.AUTH_TOKEN_SECRET
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

if settings.APP_ENV.lower() == "production" and TOKEN_SECRET == "change-me-in-production":
    raise RuntimeError("AUTH_TOKEN_SECRET must be set in production")


def _hash_password(password: str, salt: Optional[bytes] = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
    return base64.b64encode(salt + digest).decode("utf-8")


def _verify_password(password: str, stored: str) -> bool:
    raw = base64.b64decode(stored.encode("utf-8"))
    salt, digest = raw[:16], raw[16:]
    check = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120000)
    return hmac.compare_digest(digest, check)


def _sign(data: bytes) -> str:
    sig = hmac.new(TOKEN_SECRET.encode("utf-8"), data, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(sig).decode("utf-8")


def create_token(user_id: int, email: str) -> str:
    payload = {
        "uid": user_id,
        "email": email,
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    body = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8"))
    sig = _sign(body)
    return body.decode("utf-8") + "." + sig


def decode_token(token: str) -> dict:
    try:
        body_b64, sig = token.split(".", 1)
        body = body_b64.encode("utf-8")
        if not hmac.compare_digest(_sign(body), sig):
            raise ValueError("invalid signature")
        payload = json.loads(base64.urlsafe_b64decode(body).decode("utf-8"))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("expired")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user = db.query(User).filter(User.id == payload["uid"], User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/signup")
def signup(data: UserSignupIn, db: Session = Depends(get_db)):
    exists = db.query(User).filter(func.lower(User.email) == data.email.lower()).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=data.full_name.strip(),
        email=data.email.strip().lower(),
        phone=data.phone,
        password_hash=_hash_password(data.password),
        gender=data.gender,
        marital_status=data.marital_status,
        kids_info=data.kids_info,
        caste=data.caste,
        sect=data.sect,
        dob=data.dob,
        height=data.height,
        weight=data.weight,
        body_type=data.body_type,
        complexion=data.complexion,
        education=data.education,
        profession=data.profession,
        job_income=data.job_income,
        family_status=data.family_status,
        parents_profession=data.parents_profession,
        siblings=data.siblings,
        nationality=data.nationality,
        address=data.address,
        city_country=data.city_country,
        demand_requirements=data.demand_requirements,
        remarks=data.remarks,
        photo_url=data.photo_url,
        relation_with_person=data.relation_with_person,
        affidavit_agreed=data.affidavit_agreed,
        agreement_allowed=data.agreement_allowed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": create_token(user.id, user.email), "user": UserOut.model_validate(user)}


@router.post("/login")
def login(data: UserLoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(func.lower(User.email) == data.email.lower(), User.is_active == True).first()
    if not user or not _verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": create_token(user.id, user.email), "user": UserOut.model_validate(user)}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)


@router.get("/proposals")
def personalized_proposals(
    skip: int = 0,
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_gender = "Female" if (user.gender or "").lower() == "male" else "Male"
    city = ""
    if user.city_country:
        city = user.city_country.split(",")[0].strip()

    base_query = db.query(Profile).filter(Profile.is_active == True, func.lower(Profile.gender) == target_gender.lower())

    def apply_filters(q, *, use_sect: bool, use_caste: bool, use_city: bool):
        if use_sect and user.sect:
            q = q.filter(func.lower(func.trim(Profile.sect)) == user.sect.strip().lower())
        if use_caste and user.caste:
            q = q.filter(func.lower(func.trim(Profile.caste)) == user.caste.strip().lower())
        if use_city and city:
            q = q.filter(func.lower(func.trim(Profile.city)) == city.lower())
        return q

    # Relax progressively: exact -> drop city -> drop caste -> drop sect -> gender only
    filter_attempts = [
        (True, True, True),
        (True, True, False),
        (True, False, False),
        (False, False, False),
    ]

    final_query = None
    for use_sect, use_caste, use_city in filter_attempts:
        candidate_query = apply_filters(base_query, use_sect=use_sect, use_caste=use_caste, use_city=use_city)
        if candidate_query.count() > 0:
            final_query = candidate_query
            break

    if final_query is None:
        final_query = base_query

    profiles = (
        final_query.order_by(desc(Profile.updated_at), desc(Profile.created_at), desc(Profile.id))
        .offset(max(skip, 0))
        .limit(min(max(limit, 1), 50))
        .all()
    )
    return {"total": len(profiles), "results": profiles}
