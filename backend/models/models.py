from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from database import Base
import datetime

class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String, default="Agent")

class Call(Base):
    __tablename__ = "calls"
    id = Column(String, primary_key=True)
    citizen = Column(String, default="Anonymous")
    issue = Column(String)
    transcript = Column(Text)
    summary = Column(Text)
    emotion = Column(String)
    priority = Column(String)
    urgency = Column(String)
    confidence = Column(Float)
    language = Column(String, default="English")
    status = Column(String, default="live") # live, resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    time_label = Column(String)
    is_read = Column(Boolean, default=False)