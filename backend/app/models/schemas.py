from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProfileBase(BaseModel):
    reg_no: str
    name: Optional[str] = None
    gender: Optional[str] = None
    sect: Optional[str] = None
    caste: Optional[str] = None
    marital_status: Optional[str] = None
    no_of_kids: Optional[int] = None
    age: Optional[int] = None
    dob: Optional[str] = None
    height_cm: Optional[int] = None
    weight_kg: Optional[int] = None
    complexion: Optional[str] = None
    body_type: Optional[str] = None
    education: Optional[str] = None
    profession: Optional[str] = None
    income: Optional[int] = None
    family_status: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    nationality: Optional[str] = None
    requirements: Optional[str] = None
    photo_url: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True


class ProfileCreate(ProfileBase):
    raw_text: Optional[str] = None


class ProfileOut(ProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileSummary(BaseModel):
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

    class Config:
        from_attributes = True


class AnalyticsStats(BaseModel):
    total_profiles: int
    female_count: int
    male_count: int
    avg_age: Optional[float]
    top_cities: List[dict]
    sect_breakdown: dict
    marital_status_breakdown: dict
    category_breakdown: dict
    age_distribution: List[dict]  # [{bucket: "18-22", count: N}, ...]


class UserSignupIn(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    password: str
    gender: str
    marital_status: Optional[str] = None
    kids_info: Optional[str] = None
    caste: Optional[str] = None
    sect: Optional[str] = None
    dob: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    body_type: Optional[str] = None
    complexion: Optional[str] = None
    education: Optional[str] = None
    profession: Optional[str] = None
    job_income: Optional[str] = None
    family_status: Optional[str] = None
    parents_profession: Optional[str] = None
    siblings: Optional[str] = None
    nationality: Optional[str] = None
    address: Optional[str] = None
    city_country: Optional[str] = None
    demand_requirements: Optional[str] = None
    remarks: Optional[str] = None
    photo_url: Optional[str] = None
    relation_with_person: Optional[str] = None
    affidavit_agreed: bool = False
    agreement_allowed: bool = False


class UserLoginIn(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    gender: str
    marital_status: Optional[str]
    caste: Optional[str]
    sect: Optional[str]
    city_country: Optional[str]
    demand_requirements: Optional[str]

    class Config:
        from_attributes = True
