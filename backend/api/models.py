from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# Many-to-Many relationship table for Party Members
party_members = Table(
    "party_members",
    Base.metadata,
    Column("user_id", String, ForeignKey("users.id")),
    Column("party_id", Integer, ForeignKey("parties.id"))
)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # usr_...
    name = Column(String)
    
    parties = relationship("Party", secondary=party_members, back_populates="members")
    metrics = relationship("DailyMetrics", back_populates="user")

class Party(Base):
    __tablename__ = "parties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    code = Column(String, unique=True, index=True) # 6-digit code
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("User", secondary=party_members, back_populates="parties")

class DailyMetrics(Base):
    __tablename__ = "daily_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    date = Column(String) # YYYY-MM-DD
    steps = Column(Integer, default=0)
    calories = Column(Integer, default=0)
    sleep_score = Column(Integer, default=0)

    user = relationship("User", back_populates="metrics")
