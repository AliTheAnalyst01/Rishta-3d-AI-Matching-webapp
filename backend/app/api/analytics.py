from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.db.session import get_db
from app.db.models import Profile
from app.models.schemas import AnalyticsStats

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/", response_model=AnalyticsStats)
def get_analytics(db: Session = Depends(get_db)):
    """
    Get aggregated statistics for the dashboard.
    """
    total = (
        db.query(func.count(Profile.id)).filter(Profile.is_active == True).scalar() or 0
    )
    female = (
        db.query(func.count(Profile.id))
        .filter(Profile.is_active == True, Profile.gender == "Female")
        .scalar()
        or 0
    )
    male = total - female

    # Average age
    avg_age_result = (
        db.query(func.avg(Profile.age))
        .filter(Profile.is_active == True, Profile.age.isnot(None))
        .first()
    )
    avg_age = round(float(avg_age_result[0]), 1) if avg_age_result[0] else None

    # Top cities
    top_cities = (
        db.query(Profile.city, func.count(Profile.id).label("count"))
        .filter(Profile.is_active == True, Profile.city.isnot(None))
        .group_by(Profile.city)
        .order_by(func.count(Profile.id).desc())
        .limit(10)
        .all()
    )
    top_cities_list = [{"city": c[0], "count": c[1]} for c in top_cities]

    # Sect breakdown
    sect_counts = (
        db.query(Profile.sect, func.count(Profile.id))
        .filter(Profile.is_active == True, Profile.sect.isnot(None))
        .group_by(Profile.sect)
        .all()
    )
    sect_breakdown = {s[0] or "Unknown": s[1] for s in sect_counts}

    # Marital status
    marital_counts = (
        db.query(Profile.marital_status, func.count(Profile.id))
        .filter(Profile.is_active == True, Profile.marital_status.isnot(None))
        .group_by(Profile.marital_status)
        .all()
    )
    marital_breakdown = {m[0] or "Unknown": m[1] for m in marital_counts}

    # Category breakdown
    cat_counts = (
        db.query(Profile.category, func.count(Profile.id))
        .filter(Profile.is_active == True, Profile.category.isnot(None))
        .group_by(Profile.category)
        .all()
    )
    category_breakdown = {c[0]: c[1] for c in cat_counts}

    # Age distribution in 5-year buckets
    age_buckets = []
    for start in range(18, 71, 5):
        end = start + 4
        count = (
            db.query(func.count(Profile.id))
            .filter(Profile.is_active == True, Profile.age >= start, Profile.age <= end)
            .scalar() or 0
        )
        age_buckets.append({"bucket": f"{start}-{end}", "count": count})

    return AnalyticsStats(
        total_profiles=total,
        female_count=female,
        male_count=male,
        avg_age=avg_age,
        top_cities=top_cities_list,
        sect_breakdown=sect_breakdown,
        marital_status_breakdown=marital_breakdown,
        category_breakdown=category_breakdown,
        age_distribution=age_buckets,
    )
