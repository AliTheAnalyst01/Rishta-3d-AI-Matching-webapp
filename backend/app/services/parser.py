import httpx
import json
import re
from typing import Dict, Any, Optional
from app.core.config import settings, get_ollama_url

SYSTEM_PROMPT = """
You are a profile data extraction assistant. Extract structured profile information from provided text.
Output ONLY valid JSON matching the exact schema below. No commentary.

The profile may be in English or Urdu/Hindi. Translate values appropriately.

Schema:
{
  "name": "full name or null",
  "gender": "Male or Female",
  "sect": "Shia, Sunni, or null",
  "caste": "caste name or null",
  "marital_status": "Never Married / Married / Divorced / Widowed / Separated / 2nd Marriage",
  "age": integer or null,
  "dob": "date string (dd/mm/yyyy or mm/dd/yyyy) or null",
  "height_cm": integer in cm (convert feet/inches or meters) or null,
  "weight_kg": integer in kg or null,
  "complexion": "Fair / Wheatish / Dark / Medium or null",
  "body_type": "Slim / Medium / Athletic / Heavy / null",
  "education": "highest qualification or null",
  "profession": "job title or null",
  "income": integer (PKR monthly) or null,
  "family_status": "middle class / upper middle / wealthy / null",
  "city": "city name only (normalized)",
  "country": "Pakistan / India / USA / UK / UAE / etc",
  "requirements": "partner preferences summary or null",
  "no_of_kids": integer or null
}

Conversion rules:
- "5'6\"" or "5 ft 6 in" → 168 cm
- "1.75m" → 175 cm
- Age from DOB if exact date given
- Income: "50,000" → 50000; "50k" → 50000
- Marital: "Single" → "Never Married"; "2nd" → "2nd Marriage"
- Sect: "Shia Muslim" → "Shia"
- City: "Karachi" stay "Karachi", "LHR" → "Lahore"
"""


def parse_raw_profile(raw_text: str, source_sheet: str = None) -> Dict[str, Any]:
    """
    Use Claude to extract structured profile from unstructured text blob.
    Returns dict with keys matching Profile model fields.
    """
    try:
        response = httpx.post(
            f"{get_ollama_url()}/api/chat",
            json={
                "model": settings.OLLAMA_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": raw_text},
                ],
                "stream": False,
                "options": {"temperature": 0, "num_predict": 400},
            },
            timeout=60.0,
        )
        response.raise_for_status()
        raw_content = response.json()["message"]["content"].strip()
        content = re.sub(
            r"<think>.*?</think>", "", raw_content, flags=re.DOTALL
        ).strip()
        # Extract JSON from response if wrapped in markdown
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        parsed = json.loads(content)

        # Normalize height to cm
        if parsed.get("height_cm") and parsed["height_cm"] > 0:
            parsed["height_cm"] = int(parsed["height_cm"])
        else:
            parsed["height_cm"] = None

        # Normalize age
        if parsed.get("age"):
            parsed["age"] = int(parsed["age"])
            if not (18 <= parsed["age"] <= 80):
                parsed["age"] = None

        # Normalize weight
        if parsed.get("weight_kg"):
            parsed["weight_kg"] = int(re.sub(r"[^0-9]", "", str(parsed["weight_kg"])))

        # Normalize income to monthly number
        if parsed.get("income"):
            inc_str = str(parsed["income"]).lower()
            inc_num = float(re.sub(r"[^0-9.]", "", inc_str))
            if "k" in inc_str:
                inc_num *= 1000
            elif "lac" in inc_str or "lakh" in inc_str:
                inc_num *= 100000
            elif "m" in inc_str and "l" not in inc_str:
                inc_num *= 1000000
            parsed["income"] = int(inc_num)

        return parsed
    except Exception as e:
        print(f"Ollama parse failed: {e}")
        return {}


def _get(row: Dict[str, str], *keys: str) -> str:
    """Try multiple possible column name variants, return first non-empty match."""
    for key in keys:
        val = str(row.get(key, "")).strip()
        if val:
            return val
    return ""


def clean_structured_profile(row: Dict[str, str]) -> Dict[str, Any]:
    """
    Clean and normalise a row from the 'Data' sheet.
    Column names contain Urdu suffixes so we try multiple variants per field.
    """
    cleaned = {
        "reg_no": _get(
            row, "Registration No.:", "Registration No.", "Reg No", "reg_no"
        ),
        "name": _get(row, "Name") or None,
        "gender": _get(row, "Gender") or None,
        "sect": _get(row, "Sect (فرقہ)", "Sect", "sect") or None,
        "caste": _get(row, "Caste (ذات)", "Caste", "caste") or None,
        "marital_status": _get(
            row, "Marital Status (ازدواجی حیثیت)", "Marital Status", "marital_status"
        )
        or None,
        "dob": _get(row, "Date of Birth تاریخ پیدائش", "Date of Birth", "dob") or None,
        "height_str": _get(row, "Height"),
        "weight_str": _get(row, "Weight"),
        "complexion": _get(
            row, "Color/Complexion (آپ کے چہرے کا رنگ)", "Complexion", "complexion"
        )
        or None,
        "body_type": _get(row, "Body (جسمانی ساخت)", "Body Type", "body_type") or None,
        "education": _get(row, "Education (تعلیم)", "Education", "education") or None,
        "profession": _get(row, "Profession (پیشہ)", "Profession", "profession")
        or None,
        "income_str": _get(
            row, "About Your Job / Business and Monthly Income", "Income", "income"
        ),
        "family_status": _get(
            row, "Family Status (خاندانی حیثیت)", "Family Status", "family_status"
        )
        or None,
        "city_country": _get(
            row, "Current City & Country", "City & Country", "city_country"
        ),
        "requirements": _get(row, "Demand/Requirements", "requirements") or None,
        "photo_url": _get(row, "Share Your Photo", "Photo URL", "photo_url") or None,
        "age_str": _get(row, "Age"),
        "raw_text": _get(row, "Raw Text", "raw_text") or None,
    }

    # Calculate age from DOB if missing
    if not cleaned["age_str"] and cleaned["dob"]:
        cleaned["age_str"] = str(calculate_age_from_dob(cleaned["dob"]))

    # Parse age
    cleaned["age"] = parse_age(cleaned["age_str"])

    # Parse height in cm
    cleaned["height_cm"] = parse_height_to_cm(cleaned["height_str"])

    # Parse weight
    cleaned["weight_kg"] = parse_weight(cleaned["weight_str"])

    # Parse income
    cleaned["income"] = parse_income(cleaned["income_str"])

    # Parse city & country
    cleaned["city"], cleaned["country"] = parse_city_country(cleaned["city_country"])

    # Sect normalisation
    if cleaned["sect"]:
        s = cleaned["sect"].lower()
        if "shia" in s:
            cleaned["sect"] = "Shia"
        elif "sunni" in s:
            cleaned["sect"] = "Sunni"

    # Marital normalisation
    if cleaned["marital_status"]:
        m = cleaned["marital_status"].lower()
        marital_map = {
            "single": "Never Married",
            "never married": "Never Married",
            "unmarried": "Never Married",
            "married": "Married",
            "divorced": "Divorced",
            "widowed": "Widowed",
            "separated": "Separated",
            "2nd": "2nd Marriage",
            "second": "2nd Marriage",
        }
        for k, v in marital_map.items():
            if k in m:
                cleaned["marital_status"] = v
                break

    return cleaned


# Helper parsers


def parse_age(age_str: str) -> Optional[int]:
    if not age_str:
        return None
    match = re.search(r"\d+", age_str)
    if match:
        age = int(match.group())
        if 18 <= age <= 80:
            return age
    return None


def parse_height_to_cm(height_str: str) -> Optional[int]:
    if not height_str:
        return None
    h = height_str.lower()

    # Feet and inches pattern: 5'6" or 5 ft 6 in or 5.6"
    ft_match = re.search(r"(\d+)\s*(?:ft|\'|feet)\s*(\d+)?", h)
    if ft_match:
        feet = int(ft_match.group(1))
        inches = int(ft_match.group(2)) if ft_match.group(2) else 0
        return int(feet * 30.48 + inches * 2.54)

    # Meters: 1.75m or 1.75 m
    m_match = re.search(r"(\d+\.?\d*)\s*m", h)
    if m_match:
        return int(float(m_match.group(1)) * 100)

    # Just number in cm
    cm_match = re.search(r"(\d+)\s*cm", h)
    if cm_match:
        return int(cm_match.group(1))

    # Plain number (assume cm)
    num_match = re.search(r"\d+", h)
    if num_match:
        num = int(num_match.group())
        if num < 100:  # Likely feet/inches misinterpreted as number
            return int(num * 30.48)
        return num

    return None


def parse_weight(weight_str: str) -> Optional[int]:
    if not weight_str:
        return None
    match = re.search(r"\d+", str(weight_str))
    if match:
        return int(match.group())
    return None


def parse_income(income_str: str) -> Optional[int]:
    if not income_str:
        return None
    s = str(income_str).lower()
    # Must have at least one digit
    num_match = re.search(r"\d[\d,]*\.?\d*", s)
    if not num_match:
        return None
    try:
        num = float(num_match.group().replace(",", ""))
    except ValueError:
        return None
    if num == 0:
        return None
    if "k" in s:
        num *= 1000
    elif "lac" in s or "lakh" in s:
        num *= 100000
    elif "million" in s:
        num *= 1000000
    return int(num)


def parse_city_country(city_country: str):
    if not city_country:
        return None, None
    parts = city_country.split(",")
    city = parts[0].strip() if parts else None
    country = parts[1].strip() if len(parts) > 1 else None

    # Normalise common typos
    city_map = {
        "karachi": "Karachi",
        "lahore": "Lahore",
        "islamabad": "Islamabad",
        "rawalpindi": "Rawalpindi",
        "multan": "Multan",
        "faisalabad": "Faisalabad",
        "peshawar": "Peshawar",
        "quetta": "Quetta",
        "lhr": "Lahore",
        "khi": "Karachi",
        "isd": "Islamabad",
    }
    if city:
        city_low = city.lower()
        if city_low in city_map:
            city = city_map[city_low]
        else:
            city = city.title()

    return city, country


def calculate_age_from_dob(dob_str: str) -> Optional[int]:
    """Calculate age from date of birth string."""
    from datetime import datetime, date

    for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"]:
        try:
            dob = datetime.strptime(dob_str, fmt).date()
            today = date.today()
            return (
                today.year
                - dob.year
                - ((today.month, today.day) < (dob.month, dob.day))
            )
        except ValueError:
            continue
    return None
