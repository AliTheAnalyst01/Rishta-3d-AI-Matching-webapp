from sqlalchemy.orm import Session
from app.db.models import Profile
from app.db.models_log import PipelineLog
from app.db.session import SessionLocal
from app.services.google_sheets import extract_data_sheet, extract_categorised_sheets
from app.services.parser import clean_structured_profile, parse_raw_profile
from typing import Optional
import datetime


def run_pipeline_job(manual: bool = False) -> dict:
    """
    Run the full data pipeline:
    1. Extract from Google Sheets ('Data' sheet + category sheets)
    2. Parse/clean with AI parser
    3. Upsert to PostgreSQL
    Returns success count and error count.
    """
    db: Session = SessionLocal()
    stats = {
        "total_processed": 0,
        "success": 0,
        "errors": 0,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "manual": manual,
        "from_data_sheet": 0,
        "from_category_sheets": 0,
        "skipped": 0,
    }

    log = None
    try:
        # Create pipeline log
        log = PipelineLog(started_at=datetime.datetime.utcnow(), status="running")
        db.add(log)
        db.commit()
        db.refresh(log)

        # Step 1: Process 'Data' sheet (already structured)
        data_profiles = extract_data_sheet()
        stats["from_data_sheet"] = len(data_profiles)

        for raw_row in data_profiles:
            stats["total_processed"] += 1
            try:
                clean = clean_structured_profile(raw_row)
                upsert_profile(db, clean)
                stats["success"] += 1
            except Exception as e:
                print(f"Error processing row {raw_row.get('Registration No.')}: {e}")
                stats["errors"] += 1

        # Step 2: Process category sheets (raw text blobs) with Claude
        raw_entries = extract_categorised_sheets()
        stats["from_category_sheets"] = len(raw_entries)

        for entry in raw_entries:
            stats["total_processed"] += 1
            try:
                parsed = parse_raw_profile(entry["raw_text"], entry.get("source_sheet"))
                if not parsed:
                    stats["errors"] += 1
                    continue

                # Use sheet-extracted hints as fallbacks
                if not parsed.get("reg_no") and entry.get("reg_no_hint"):
                    parsed["reg_no"] = entry["reg_no_hint"]
                if not parsed.get("photo_url") and entry.get("photo_url_hint"):
                    parsed["photo_url"] = entry["photo_url_hint"]

                # Aggressively dedupe on reg_no if found
                reg_no = parsed.get("reg_no")
                if reg_no:
                    existing = (
                        db.query(Profile).filter(Profile.reg_no == reg_no).first()
                    )
                    if existing:
                        if not existing.raw_text and entry.get("raw_text"):
                            existing.raw_text = entry["raw_text"]
                            db.commit()
                        stats["skipped"] += 1
                        continue

                parsed["raw_text"] = entry["raw_text"]
                upsert_profile(db, parsed)
                stats["success"] += 1
            except Exception as e:
                print(f"Error parsing raw entry: {e}")
                stats["errors"] += 1

        # Commit log
        if log:
            log.finished_at = datetime.datetime.utcnow()
            log.status = "completed"
            log.total_processed = stats["total_processed"]
            log.success_count = stats["success"]
            log.error_count = stats["errors"]
            log.stats_json = stats
            db.commit()

    except Exception as e:
        db.rollback()
        stats["fatal_error"] = str(e)
        if log:
            log.finished_at = datetime.datetime.utcnow()
            log.status = "failed"
            log.error_message = str(e)
            db.commit()
    finally:
        db.close()

    return stats


def upsert_profile(db: Session, data: dict):
    """
    Insert or update a profile based on registration number.
    """
    reg_no = data.get("reg_no", "").strip()
    if not reg_no:
        print("Warning: profile missing reg_no, skipping")
        return

    # Map cleaned data to model fields
    profile_data = {
        "reg_no": reg_no,
        "name": data.get("name"),
        "gender": data.get("gender"),
        "sect": data.get("sect"),
        "caste": data.get("caste"),
        "marital_status": data.get("marital_status"),
        "no_of_kids": data.get("no_of_kids"),
        "age": data.get("age"),
        "dob": data.get("dob"),
        "height_cm": data.get("height_cm"),
        "weight_kg": data.get("weight_kg"),
        "complexion": data.get("complexion"),
        "body_type": data.get("body_type"),
        "education": data.get("education"),
        "profession": data.get("profession"),
        "income": data.get("income"),
        "family_status": data.get("family_status"),
        "city": data.get("city"),
        "country": data.get("country"),
        "nationality": data.get("nationality"),
        "requirements": data.get("requirements"),
        "photo_url": data.get("photo_url"),
        "category": data.get("category"),
        "is_active": True,
        "raw_text": data.get("raw_text"),
    }

    existing = db.query(Profile).filter(Profile.reg_no == reg_no).first()
    if existing:
        for key, value in profile_data.items():
            if value is not None:
                setattr(existing, key, value)
    else:
        new_profile = Profile(**profile_data)
        db.add(new_profile)

    db.commit()


def mark_inactive_profiles():
    """
    Mark profiles as inactive that are no longer in the latest sheet sync.
    Not implemented yet - would require tracking sheet IDs.
    For now, we keep everything active.
    """
    pass
