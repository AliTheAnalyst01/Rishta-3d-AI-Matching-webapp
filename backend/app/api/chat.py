from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List
import httpx
import re
from app.db.session import get_db
from app.db.models import Profile
from app.core.config import settings, get_ollama_url

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class ProfileSummaryOut(BaseModel):
    id: int
    reg_no: str
    name: Optional[str]
    gender: Optional[str]
    sect: Optional[str]
    age: Optional[int]
    city: Optional[str]
    education: Optional[str]
    profession: Optional[str]
    income: Optional[int]
    category: Optional[str]
    photo_url: Optional[str]


def detect_language(text: str) -> str:
    urdu_count = sum(1 for c in text if "\u0600" <= c <= "\u06ff")
    return "ur" if urdu_count > 0 else "en"


def extract_search_terms(message: str) -> dict:
    """Extract search filters from user message."""
    msg_lower = message.lower()
    filters = {"limit": 10}

    if "female" in msg_lower or "girl" in msg_lower or "women" in msg_lower:
        filters["gender"] = "Female"
    elif "male" in msg_lower or "boy" in msg_lower or "men" in msg_lower:
        filters["gender"] = "Male"

    if "shia" in msg_lower:
        filters["sect"] = "Shia"
    elif "sunni" in msg_lower:
        filters["sect"] = "Sunni"

    cities = [
        "karachi",
        "lahore",
        "islamabad",
        "rawalpindi",
        "faisalabad",
        "peshawar",
        "quetta",
        "multan",
        "karachi",
        "hyd",
    ]
    for city in cities:
        if city in msg_lower:
            filters["city"] = city.capitalize()
            break

    if "doctor" in msg_lower or "physician" in msg_lower or "medical" in msg_lower:
        filters["profession"] = "Doctor"
    elif "engineer" in msg_lower:
        filters["profession"] = "Engineer"
    elif "business" in msg_lower:
        filters["profession"] = "Business"

    if "syed" in msg_lower:
        filters["category"] = "Syed"
    elif "second" in msg_lower or "divorced" in msg_lower:
        filters["category"] = "2nd Marriage"

    if "doctor" in msg_lower:
        filters["profession"] = "Doctor"

    return filters


def search_profiles(db: Session, filters: dict) -> List[Profile]:
    """Search profiles based on extracted filters."""
    query = db.query(Profile).filter(Profile.is_active == True)

    if filters.get("gender"):
        query = query.filter(Profile.gender == filters["gender"])
    if filters.get("sect"):
        query = query.filter(Profile.sect == filters["sect"])
    if filters.get("city"):
        query = query.filter(Profile.city == filters["city"])
    if filters.get("category"):
        query = query.filter(Profile.category == filters["category"])
    if filters.get("profession"):
        query = query.filter(Profile.profession.ilike(f"%{filters['profession']}%"))

    return query.limit(filters.get("limit", 10)).all()


def format_profile_list(profiles: List[Profile], lang: str) -> str:
    """Format profiles for display in chat."""
    if not profiles:
        if lang == "ur":
            return (
                "معافی کیجئے، آپ کے معیار سے مطابقت رکھنے والا کوئی پروفائل نہیں ملا۔"
            )
        return "No profiles found matching your criteria. You can also contact us on WhatsApp: 0345-4100742"

    lines = []
    for p in profiles:
        info = []
        if p.name:
            info.append(p.name)
        if p.age:
            info.append(f"{p.age}y")
        if p.city:
            info.append(p.city)
        if p.education:
            info.append(p.education)
        if p.profession:
            info.append(p.profession)
        if p.sect:
            info.append(p.sect)

        reg_line = f"• {p.reg_no}: {', '.join(info)}"
        lines.append(reg_line)

    header = (
        f"Found {len(profiles)} profiles:"
        if lang == "en"
        else f"{len(profiles)} پروفائل ملے:"
    )
    return (
        header
        + "\n"
        + "\n".join(lines)
        + "\n\n💬 To express interest, message us on WhatsApp: 0345-4100742"
    )


def build_system_prompt(lang: str, profiles: List[Profile] = None) -> str:
    """Build system prompt with profile data if available."""
    if profiles:
        profile_data = []
        for p in profiles:
            pd = {
                "id": p.id,
                "reg": p.reg_no,
                "name": p.name or "N/A",
                "age": p.age,
                "city": p.city or "N/A",
                "edu": p.education or "N/A",
                "prof": p.profession or "N/A",
                "sect": p.sect or "N/A",
            }
            profile_data.append(pd)

        if lang == "ur":
            return f"""آپ Rishta Assistant ہیں۔
جہاں تک ممکن ہو، مندرجہ پروفائلز دکھائیں:
{profile_data}

ہر پروفائل کے لیے: رجسٹریشن نمبر، نام، عمر، شہر، تعلیم، پیشہ، مذہبی فرقہ بتائیں۔
تفصیلات کے لیے WhatsApp پر رابطہ کریں: 0345-4100742"""

        return f"""You are Rishta Assistant for RishtaConnect, a Muslim matrimonial platform.
Show the user these matching profiles with their details:
{profile_data}

For each profile, include: Reg No, Name, Age, City, Education, Profession, Sect.
Encourage them to contact via WhatsApp for more details: 0345-4100742"""

    base = """You are Rishta Assistant — an AI guide for RishtaConnect, a Muslim matrimonial platform.
Help visitors find profiles by searching our database. Be helpful, warm, and concise.
When users ask about profiles, search and show actual profile data - don't just say 'contact us'.
Only provide WhatsApp contact after showing actual profile information."""

    if lang == "ur":
        return base + "\n\nجب صارف اردو میں لکھے تو اردو میں جواب دیں۔"
    return base


@router.post("/")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    lang = detect_language(request.message)
    msg_lower = request.message.lower()

    is_profile_query = any(
        keyword in msg_lower
        for keyword in [
            "show",
            "find",
            "search",
            "looking for",
            "proposal",
            "marriage",
            "profile",
            "doctor",
            "engineer",
            "shia",
            "sunni",
            "syed",
            "karachi",
            "lahore",
            "islamabad",
            "female",
            "male",
            "girl",
            "boy",
        ]
    )

    profiles = []
    profile_text = ""

    if is_profile_query:
        filters = extract_search_terms(request.message)
        profiles = search_profiles(db, filters)
        profile_text = format_profile_list(profiles, lang)

    system_prompt = build_system_prompt(lang, profiles)

    messages = [
        {"role": m["role"], "content": m["content"]}
        for m in request.history
        if m.get("role") in ("user", "assistant") and m.get("content")
    ]
    messages.append({"role": "user", "content": request.message})

    ollama_messages = [{"role": "system", "content": system_prompt}] + messages

    try:
        response = httpx.post(
            f"{get_ollama_url()}/api/chat",
            json={
                "model": settings.OLLAMA_MODEL,
                "messages": ollama_messages,
                "stream": False,
                "options": {"temperature": 0.7, "num_predict": 600},
            },
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()
        reply = data["message"]["content"].strip()
        reply = re.sub(r"<think>.*?</think>", "", reply, flags=re.DOTALL).strip()

        if profiles and profile_text:
            reply = profile_text + "\n\n" + reply

        return {"reply": reply, "language": lang, "profiles_found": len(profiles)}

    except httpx.TimeoutException:
        if profiles:
            return {
                "reply": profile_text,
                "language": lang,
                "profiles_found": len(profiles),
            }
        raise HTTPException(
            status_code=504, detail="AI response timed out. Please try again."
        )
    except httpx.ConnectError:
        if profiles:
            return {
                "reply": profile_text,
                "language": lang,
                "profiles_found": len(profiles),
            }
        raise HTTPException(
            status_code=503,
            detail=f"Ollama is unreachable at {get_ollama_url()}. Please ensure Ollama is running.",
        )
    except Exception as e:
        if profiles:
            return {
                "reply": profile_text,
                "language": lang,
                "profiles_found": len(profiles),
            }
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
