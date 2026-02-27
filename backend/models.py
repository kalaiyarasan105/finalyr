from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey, Boolean, JSON, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    conversations = relationship("Conversation", back_populates="user")
    mood_journal_entries = relationship("MoodJournalEntry", back_populates="user")
    wellness_recommendations = relationship("WellnessRecommendation", back_populates="user")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), default="New Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_user_message = Column(Boolean, default=True)
    text_emotion = Column(String(50))
    text_confidence = Column(Float)
    face_emotion = Column(String(50))
    face_confidence = Column(Float)
    final_emotion = Column(String(50))
    final_confidence = Column(Float)
    emotion_intensity = Column(String(20))
    fusion_method = Column(String(50))
    image_path = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    conversation = relationship("Conversation", back_populates="messages")

class MoodJournalEntry(Base):
    __tablename__ = "mood_journal_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    dominant_emotions = Column(JSON)  # {"sadness": 0.6, "anxiety": 0.4}
    emotion_intensity_curve = Column(JSON)  # Timeline of emotions throughout the day
    identified_triggers = Column(JSON)  # List of emotional triggers
    natural_coping_strategies = Column(JSON)  # Coping strategies user naturally uses
    activity_correlations = Column(JSON)  # Activities and their emotional correlations
    social_context = Column(JSON)  # Social interaction analysis
    physical_symptoms = Column(JSON)  # Physical symptoms mentioned
    environmental_factors = Column(JSON)  # Environmental factors affecting mood
    sleep_mentions = Column(JSON)  # Sleep-related mentions
    work_stress_indicators = Column(JSON)  # Work stress indicators
    overall_mood_trend = Column(String(50))  # "improving", "declining", "stable"
    key_insights = Column(JSON)  # Key insights from the day
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="mood_journal_entries")

class WellnessRecommendation(Base):
    __tablename__ = "wellness_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommendation_id = Column(String(100), nullable=False)  # From wellness engine
    action = Column(Text, nullable=False)
    duration = Column(String(50))
    type = Column(String(50))  # breathing, physical_activity, social, etc.
    priority = Column(Integer, default=1)
    confidence = Column(String(20))  # high, medium, low
    rationale = Column(Text)
    instructions = Column(Text)
    personalized = Column(Boolean, default=False)
    emotion_context = Column(String(50))  # Emotion that triggered this recommendation
    emotion_intensity = Column(String(20))
    timeframe = Column(String(20))  # immediate, short_term, long_term
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="wellness_recommendations")
    feedback_entries = relationship("WellnessFeedback", back_populates="recommendation")

class WellnessFeedback(Base):
    __tablename__ = "wellness_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("wellness_recommendations.id"), nullable=False)
    completed = Column(Boolean, default=False)
    rating = Column(Integer)  # 1-5 scale
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    recommendation = relationship("WellnessRecommendation", back_populates="feedback_entries")