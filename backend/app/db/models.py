from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    reg_no = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    gender = Column(String, nullable=True)  # Male/Female
    sect = Column(String, nullable=True)  # Shia/Sunni
    caste = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    no_of_kids = Column(Integer, nullable=True)
    age = Column(Integer, nullable=True)
    dob = Column(String, nullable=True)
    height_cm = Column(Integer, nullable=True)
    weight_kg = Column(Integer, nullable=True)
    complexion = Column(String, nullable=True)
    body_type = Column(String, nullable=True)
    education = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    income = Column(Integer, nullable=True)
    family_status = Column(String, nullable=True)
    city = Column(String, nullable=True, index=True)
    country = Column(String, nullable=True)
    nationality = Column(String, nullable=True)
    requirements = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    category = Column(
        String, nullable=True, index=True
    )  # Syed/NonSyed/Doctor/2ndMarriage
    is_active = Column(Boolean, default=True)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)

    gender = Column(String, nullable=False)  # Male/Female
    marital_status = Column(String, nullable=True)
    caste = Column(String, nullable=True)
    sect = Column(String, nullable=True)
    dob = Column(String, nullable=True)
    height = Column(String, nullable=True)
    weight = Column(String, nullable=True)
    body_type = Column(String, nullable=True)
    complexion = Column(String, nullable=True)
    education = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    job_income = Column(Text, nullable=True)
    family_status = Column(Text, nullable=True)
    parents_profession = Column(Text, nullable=True)
    siblings = Column(Text, nullable=True)
    nationality = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    city_country = Column(String, nullable=True)
    demand_requirements = Column(Text, nullable=True)
    relation_with_person = Column(String, nullable=True)

    kids_info = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    affidavit_agreed = Column(Boolean, default=False)
    agreement_allowed = Column(Boolean, default=False)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
