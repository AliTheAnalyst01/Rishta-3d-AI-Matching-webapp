from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.session import get_db
from app.db.models import Profile
from app.models.schemas import ProfileOut, ProfileSummary

router = APIRouter(prefix="/profiles", tags=["profiles"])


def _normalized_equals(column, value: str):
    return func.lower(func.trim(column)) == value.strip().lower()


def _apply_profile_filters(
    query,
    *,
    gender: Optional[str],
    sect: Optional[str],
    caste: Optional[str],
    city: Optional[str],
    category: Optional[str],
    min_age: Optional[int],
    max_age: Optional[int],
    search: Optional[str],
):
    if gender:
        query = query.filter(_normalized_equals(Profile.gender, gender))
    if sect:
        query = query.filter(_normalized_equals(Profile.sect, sect))
    if caste:
        query = query.filter(_normalized_equals(Profile.caste, caste))
    if city:
        query = query.filter(_normalized_equals(Profile.city, city))
    if category:
        query = query.filter(_normalized_equals(Profile.category, category))
    if min_age:
        query = query.filter(Profile.age >= min_age)
    if max_age:
        query = query.filter(Profile.age <= max_age)
    if search:
        query = query.filter(
            (Profile.name.ilike(f"%{search}%"))
            | (Profile.profession.ilike(f"%{search}%"))
            | (Profile.requirements.ilike(f"%{search}%"))
        )
    return query


@router.get("/count")
def count_profiles(
    db: Session = Depends(get_db),
    gender: Optional[str] = None,
    sect: Optional[str] = None,
    caste: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    search: Optional[str] = None,
):
    """Return total count of profiles matching the given filters."""
    base = db.query(func.count(Profile.id)).filter(Profile.is_active == True)
    strict_query = _apply_profile_filters(
        base,
        gender=gender,
        sect=sect,
        caste=caste,
        city=city,
        category=category,
        min_age=min_age,
        max_age=max_age,
        search=search,
    )
    strict_total = strict_query.scalar() or 0
    if strict_total > 0:
        return {"total": strict_total}

    relaxed_attempts = [
        # Keep core intent (gender/sect/search) and relax narrower filters.
        {"caste": None, "category": None},
        {"caste": None, "category": None, "city": None},
        {"caste": None, "category": None, "city": None, "min_age": None, "max_age": None},
    ]
    for attempt in relaxed_attempts:
        q = _apply_profile_filters(
            base,
            gender=gender,
            sect=sect,
            caste=attempt.get("caste", caste),
            city=attempt.get("city", city),
            category=attempt.get("category", category),
            min_age=attempt.get("min_age", min_age),
            max_age=attempt.get("max_age", max_age),
            search=search,
        )
        total = q.scalar() or 0
        if total > 0:
            return {"total": total}

    return {"total": 0}


@router.get("/", response_model=List[ProfileSummary])
def list_profiles(
    db: Session = Depends(get_db),
    gender: Optional[str] = None,
    sect: Optional[str] = None,
    caste: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
):
    """
    Get paginated list of profiles with optional filters.
    Returns public view (summary fields only).
    """
    base_query = db.query(Profile).filter(Profile.is_active == True)
    query = _apply_profile_filters(
        base_query,
        gender=gender,
        sect=sect,
        caste=caste,
        city=city,
        category=category,
        min_age=min_age,
        max_age=max_age,
        search=search,
    )

    if query.count() == 0:
        relaxed_attempts = [
            {"caste": None, "category": None},
            {"caste": None, "category": None, "city": None},
            {"caste": None, "category": None, "city": None, "min_age": None, "max_age": None},
        ]
        for attempt in relaxed_attempts:
            relaxed_query = _apply_profile_filters(
                base_query,
                gender=gender,
                sect=sect,
                caste=attempt.get("caste", caste),
                city=attempt.get("city", city),
                category=attempt.get("category", category),
                min_age=attempt.get("min_age", min_age),
                max_age=attempt.get("max_age", max_age),
                search=search,
            )
            if relaxed_query.count() > 0:
                query = relaxed_query
                break

    # Use deterministic ordering so users see authentic/stable database results,
    # not random row order between requests.
    profiles = (
        query.order_by(
            desc(Profile.updated_at),
            desc(Profile.created_at),
            desc(Profile.id),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return profiles


@router.get("/{profile_id}", response_model=ProfileOut)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    """
    Get single profile details (semi-private - for WhatsApp contact).
    """
    profile = (
        db.query(Profile)
        .filter(Profile.id == profile_id, Profile.is_active == True)
        .first()
    )
    if not profile:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.get("/by-reg-no/{reg_no}", response_model=ProfileOut)
def get_profile_by_reg_no(reg_no: str, db: Session = Depends(get_db)):
    profile = (
        db.query(Profile)
        .filter(Profile.reg_no == reg_no, Profile.is_active == True)
        .first()
    )
    if not profile:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
