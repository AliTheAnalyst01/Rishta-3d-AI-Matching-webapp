from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
import httpx
import time
import json
import hashlib
from app.db.session import get_db
from app.db.models import Profile
from app.core.config import settings, get_ollama_url

router = APIRouter(prefix="/match", tags=["match"])

# Lightweight in-memory cache for repeated match searches.
MATCH_CACHE_TTL_SECONDS = 120
MATCH_CACHE_MAX_ITEMS = 100
_match_cache: dict[str, tuple[float, dict]] = {}


@router.get("/health")
def health_check():
    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.get(f"{get_ollama_url()}/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                model_ready = any(
                    model == settings.OLLAMA_MODEL
                    or model.startswith(f"{settings.OLLAMA_MODEL}:")
                    or settings.OLLAMA_MODEL in model
                    for model in models
                )
                return {
                    "status": "healthy",
                    "service": "ollama",
                    "model": settings.OLLAMA_MODEL,
                    "model_ready": model_ready,
                }
    except Exception:
        pass
    return {
        "status": "unavailable",
        "service": "ollama",
        "model": settings.OLLAMA_MODEL,
        "model_ready": False,
    }


class MatchRequest(BaseModel):
    seeking_gender: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    sect: Optional[str] = None
    caste: Optional[str] = None
    city: Optional[str] = None
    education_level: Optional[str] = None
    profession: Optional[str] = None
    category: Optional[str] = None


class MatchResult(BaseModel):
    profile_id: int = 0
    reg_no: Optional[str] = None
    name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    city: Optional[str] = None
    education: Optional[str] = None
    profession: Optional[str] = None
    income: Optional[int] = None
    sect: Optional[str] = None
    caste: Optional[str] = None
    category: Optional[str] = None
    marital_status: Optional[str] = None
    photo_url: Optional[str] = None
    score: Optional[int] = None
    reasoning: Optional[str] = None


def _request_cache_key(request: MatchRequest) -> str:
    payload = {
        "seeking_gender": request.seeking_gender,
        "min_age": request.min_age,
        "max_age": request.max_age,
        "sect": request.sect,
        "caste": request.caste,
        "city": request.city,
        "education_level": request.education_level,
        "profession": request.profession,
        "category": request.category,
    }
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _cleanup_cache() -> None:
    now = time.time()
    expired = [k for k, (ts, _) in _match_cache.items() if now - ts > MATCH_CACHE_TTL_SECONDS]
    for key in expired:
        _match_cache.pop(key, None)
    if len(_match_cache) > MATCH_CACHE_MAX_ITEMS:
        for key in sorted(_match_cache, key=lambda k: _match_cache[k][0])[: len(_match_cache) - MATCH_CACHE_MAX_ITEMS]:
            _match_cache.pop(key, None)


def _quick_compatibility_score(request: MatchRequest, p: Profile) -> int:
    score = 35
    if request.sect and p.sect == request.sect:
        score += 22
    if request.city and p.city == request.city:
        score += 10
    if request.category and p.category == request.category:
        score += 8
    if request.caste and p.caste == request.caste:
        score += 8

    if request.min_age or request.max_age:
        min_age = request.min_age or 18
        max_age = request.max_age or 70
        if p.age is None:
            score -= 2
        elif min_age <= p.age <= max_age:
            midpoint = (min_age + max_age) / 2
            distance = abs(p.age - midpoint)
            score += max(6, 14 - int(distance * 1.2))
        else:
            score -= 6

    if request.education_level and p.education:
        if request.education_level.lower() in p.education.lower():
            score += 7
    if request.profession and p.profession:
        if request.profession.lower() in p.profession.lower():
            score += 7
    # Favor richer profiles slightly so ranking feels more human.
    completeness = sum(
        1 for value in [p.education, p.profession, p.city, p.sect, p.category, p.age] if value
    )
    score += min(6, completeness)
    # Stable tie-breaker to avoid identical visible scores.
    score += (p.id % 4)

    return max(0, min(100, score))


def _build_fast_reason(request: MatchRequest, p: Profile) -> str:
    reasons: list[str] = []
    if request.sect and p.sect == request.sect:
        reasons.append("same sect preference")
    if request.city and p.city == request.city:
        reasons.append("same city")
    if request.category and p.category == request.category:
        reasons.append("matching category")
    if request.min_age and request.max_age and p.age and request.min_age <= p.age <= request.max_age:
        reasons.append("within preferred age range")
    if request.education_level and p.education and request.education_level.lower() in p.education.lower():
        reasons.append("education preference aligned")
    if request.profession and p.profession and request.profession.lower() in p.profession.lower():
        reasons.append("profession preference aligned")
    if not reasons:
        return "Strong overall compatibility based on available profile data."
    return "Fast ranking: " + ", ".join(reasons[:3]) + "."


def get_candidate_profiles(
    db: Session, filters: MatchRequest, limit: int = 80
) -> List[Profile]:
    """Get candidate pool matching basic criteria."""
    query = db.query(Profile).filter(Profile.is_active == True)

    if filters.seeking_gender:
        query = query.filter(Profile.gender == filters.seeking_gender)
    if filters.sect:
        query = query.filter(Profile.sect == filters.sect)
    if filters.caste:
        query = query.filter(Profile.caste == filters.caste)
    if filters.city:
        query = query.filter(Profile.city == filters.city)
    if filters.category:
        query = query.filter(Profile.category == filters.category)
    if filters.min_age:
        query = query.filter(Profile.age >= filters.min_age)
    if filters.max_age:
        query = query.filter(Profile.age <= filters.max_age)

    return (
        query.order_by(
            desc(Profile.updated_at),
            desc(Profile.created_at),
            desc(Profile.id),
        )
        .limit(limit)
        .all()
    )


def get_candidate_profiles_with_relaxation(
    db: Session, filters: MatchRequest, limit: int = 80
) -> List[Profile]:
    """
    Try strict matching first, then progressively relax optional filters.
    This prevents user-facing 400 errors when a filter combination is too narrow.
    """
    strict = get_candidate_profiles(db, filters, limit=limit)
    if strict:
        return strict

    attempts = [
        # Drop the most restrictive optional profile-shaping filters first.
        {**filters.model_dump(), "caste": None, "profession": None, "education_level": None},
        {**filters.model_dump(), "caste": None, "profession": None, "education_level": None, "category": None},
        {**filters.model_dump(), "caste": None, "profession": None, "education_level": None, "category": None, "city": None},
        {**filters.model_dump(), "caste": None, "profession": None, "education_level": None, "category": None, "city": None, "min_age": None, "max_age": None},
        {**filters.model_dump(), "caste": None, "profession": None, "education_level": None, "category": None, "city": None, "min_age": None, "max_age": None, "sect": None},
    ]

    for payload in attempts:
        relaxed = MatchRequest(**payload)
        candidates = get_candidate_profiles(db, relaxed, limit=limit)
        if candidates:
            return candidates

    return []


def build_match_prompt(request: MatchRequest, candidates: List[Profile]) -> str:
    """Construct prompt for Claude match scoring."""
    # Build candidate descriptions
    candidate_list = []
    for p in candidates:
        desc_parts = [
            f"ID:{p.id} Reg:{p.reg_no}",
            f"Name:{p.name or 'N/A'}",
            f"Age:{p.age or 'N/A'}",
            f"Education:{p.education or 'N/A'}",
            f"Profession:{p.profession or 'N/A'}",
            f"City:{p.city or 'N/A'}",
            f"Sect:{p.sect or 'N/A'}",
            f"Caste:{p.caste or 'N/A'}",
        ]
        candidate_list.append(" | ".join(desc_parts))

    candidates_text = "\n".join(candidate_list)

    prompt = f"""Visitor preferences:
- Seeking: {request.seeking_gender or "Any"} gender
- Age range: {request.min_age or 18}-{request.max_age or 70}
- Sect: {request.sect or "Any"}
- City: {request.city or "Any"}
- Caste: {request.caste or "Any"}
- Education: {request.education_level or "Any"}
- Profession: {request.profession or "Any"}
- Category: {request.category or "Any"}

Candidates:
{candidates_text}

Score each candidate 0-100 for compatibility. Output ONLY lines like:
ID:1 Score:85 Reason:Matching sect and age range
ID:2 Score:60 Reason:Different city but similar education

No other text. Sort descending by score."""

    return prompt


def parse_claude_response(text: str) -> List[MatchResult]:
    """Parse Claude text response into MatchResult objects."""
    import re as _re

    results = []
    for line in text.strip().split("\n"):
        if not line.strip():
            continue
        try:
            # Parse "ID:123 Score:85 Reason:Good match on sect and profession"
            id_match = _re.search(r"ID:(\d+)", line)
            score_match = _re.search(r"Score:(\d+)", line)
            reason_match = _re.search(r"Reason:(.*)", line)

            profile_id = int(id_match.group(1)) if id_match else None
            score = int(score_match.group(1)) if score_match else 0
            reason = reason_match.group(1).strip() if reason_match else ""

            if profile_id is not None:
                results.append(
                    MatchResult(
                        profile_id=profile_id,
                        reg_no="",  # Filled from DB later
                        name="",
                        score=score,
                        reasoning=reason,
                    )
                )
        except Exception as e:
            print(f"Parse error on line '{line}': {e}")
            continue
    return results


@router.post("/score")
def get_match_scores(request: MatchRequest, db: Session = Depends(get_db)):
    """
    Get AI-powered compatibility scores for profiles matching visitor preferences.
    Returns top 10 matches with score 0-100 and reasoning.
    """
    _cleanup_cache()
    cache_key = _request_cache_key(request)
    cached = _match_cache.get(cache_key)
    if cached and (time.time() - cached[0] <= MATCH_CACHE_TTL_SECONDS):
        return cached[1]

    # Fetch broader pool then pre-rank quickly to reduce LLM workload.
    candidates = get_candidate_profiles_with_relaxation(db, request, limit=80)

    if len(candidates) < 1:
        raise HTTPException(
            status_code=400,
            detail="No profiles match your criteria. Please broaden your filters.",
        )

    candidates = sorted(
        candidates,
        key=lambda p: _quick_compatibility_score(request, p),
        reverse=True,
    )
    llm_candidates = candidates[:8]

    prompt = build_match_prompt(request, llm_candidates)
    system = (
        "You are a matchmaking assistant. Given candidate profiles and visitor preferences, "
        "output ONLY lines in this exact format with NO extra text:\n"
        "ID:<id> Score:<score> Reason:<one-line reason>\n"
        "Score 0-100: 100=perfect match, 0=no match. "
        "Prioritize: matching sect > age range > city > education. "
        "Return all candidates sorted by score descending."
    )

    try:
        response = httpx.post(
            f"{get_ollama_url()}/api/chat",
            json={
                "model": settings.OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                "stream": False,
                "options": {"temperature": 0.05, "num_predict": 320},
            },
            timeout=20.0,
        )
        response.raise_for_status()
        import re as _re2

        content = response.json()["message"]["content"].strip()
        content = _re2.sub(
            r"<think>.*?</think>", "", content, flags=_re2.DOTALL
        ).strip()
        results = parse_claude_response(content)

        # If model output is not parseable, fallback to deterministic ranking.
        if not results:
            fallback = []
            for p in candidates[:10]:
                fallback.append(
                    MatchResult(
                        profile_id=p.id,
                        reg_no=p.reg_no,
                        name=p.name,
                        gender=p.gender,
                        age=p.age,
                        city=p.city,
                        education=p.education,
                        profession=p.profession,
                        income=p.income,
                        sect=p.sect,
                        caste=p.caste,
                        category=p.category,
                        marital_status=p.marital_status,
                        photo_url=p.photo_url,
                        score=_quick_compatibility_score(request, p),
                        reasoning=_build_fast_reason(request, p),
                    )
                )
            fallback.sort(key=lambda x: x.score, reverse=True)
            payload = {"matches": fallback[:10], "candidates_considered": len(candidates)}
            _match_cache[cache_key] = (time.time(), payload)
            return payload

        # Enrich with full profile data
        for r in results:
            p = db.query(Profile).filter(Profile.id == r.profile_id).first()
            if p:
                r.reg_no = p.reg_no
                r.name = p.name
                r.gender = p.gender
                r.age = p.age
                r.city = p.city
                r.education = p.education
                r.profession = p.profession
                r.income = p.income
                r.sect = p.sect
                r.caste = p.caste
                r.category = p.category
                r.marital_status = p.marital_status
                r.photo_url = p.photo_url

        # Sort by score desc
        results.sort(key=lambda x: x.score, reverse=True)
        payload = {"matches": results[:10], "candidates_considered": len(candidates)}
        _match_cache[cache_key] = (time.time(), payload)
        return payload
    except httpx.TimeoutException:
        # Fast deterministic fallback, so UI is still responsive.
        fallback = []
        for p in candidates[:10]:
            fallback.append(
                MatchResult(
                    profile_id=p.id,
                    reg_no=p.reg_no,
                    name=p.name,
                    gender=p.gender,
                    age=p.age,
                    city=p.city,
                    education=p.education,
                    profession=p.profession,
                    income=p.income,
                    sect=p.sect,
                    caste=p.caste,
                    category=p.category,
                    marital_status=p.marital_status,
                    photo_url=p.photo_url,
                    score=_quick_compatibility_score(request, p),
                    reasoning=_build_fast_reason(request, p),
                )
            )
        fallback.sort(key=lambda x: x.score, reverse=True)
        payload = {"matches": fallback[:10], "candidates_considered": len(candidates)}
        _match_cache[cache_key] = (time.time(), payload)
        return payload
    except httpx.ConnectError:
        fallback = []
        for p in candidates[:10]:
            fallback.append(
                MatchResult(
                    profile_id=p.id,
                    reg_no=p.reg_no,
                    name=p.name,
                    gender=p.gender,
                    age=p.age,
                    city=p.city,
                    education=p.education,
                    profession=p.profession,
                    income=p.income,
                    sect=p.sect,
                    caste=p.caste,
                    category=p.category,
                    marital_status=p.marital_status,
                    photo_url=p.photo_url,
                    score=_quick_compatibility_score(request, p),
                    reasoning=_build_fast_reason(request, p),
                )
            )
        fallback.sort(key=lambda x: x.score, reverse=True)
        payload = {"matches": fallback[:10], "candidates_considered": len(candidates)}
        _match_cache[cache_key] = (time.time(), payload)
        return payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI match failed: {str(e)}")
