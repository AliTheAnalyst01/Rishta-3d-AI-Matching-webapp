from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from app.db.models import Base
import datetime


class PipelineLog(Base):
    __tablename__ = "pipeline_log"

    id = Column(Integer, primary_key=True, index=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    status = Column(String)  # running / completed / failed
    total_processed = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    stats_json = Column(JSON, nullable=True)  # full stats payload
