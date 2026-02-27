# recommendation_models.py - Database models for recommendation system
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class RecommendationCategory(Base):
    __tablename__ = "recommendation_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    icon = Column(String(10))
    description = Column(Text)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class SiddhaRemedy(Base):
    __tablename__ = "siddha_remedies"
    
    id = Column(Integer, primary_key=True, index=True)
    emotion = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100))
    duration = Column(String(50))
    difficulty = Column(String(20))
    instructions = Column(JSON)  # List of steps
    materials = Column(JSON)  # List of required materials
    benefits = Column(Text)
    tamil_context = Column(Text)
    best_time = Column(String(50))
    audio_guide_url = Column(String(500))
    video_guide_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

class TamilIdiom(Base):
    __tablename__ = "tamil_idioms"
    
    id = Column(Integer, primary_key=True, index=True)
    emotion = Column(String(50), nullable=False, index=True)
    tamil_text = Column(Text, nullable=False)
    transliteration = Column(Text)
    english_translation = Column(Text)
    context = Column(Text)
    usage_example = Column(Text)
    story = Column(Text)
    audio_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

class MotivationalQuote(Base):
    __tablename__ = "motivational_quotes"
    
    id = Column(Integer, primary_key=True, index=True)
    emotion = Column(String(50), nullable=False, index=True)
    quote_type = Column(String(50))  # thirukkural, tamil_proverb, universal, etc.
    tamil_text = Column(Text)
    transliteration = Column(Text)
    english_translation = Column(Text)
    source = Column(String(200))
    author = Column(String(100))
    context = Column(Text)
    reflection_prompt = Column(Text)
    image_url = Column(String(500))
    audio_url = Column(String(500))
    shareable = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MusicTrack(Base):
    __tablename__ = "music_tracks"
    
    id = Column(Integer, primary_key=True, index=True)
    emotion = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    music_type = Column(String(100))  # Carnatic, Devotional, Instrumental, etc.
    raga = Column(String(100))
    duration = Column(String(50))
    artist = Column(String(200))
    description = Column(Text)
    benefits = Column(Text)
    best_time = Column(String(50))
    spotify_link = Column(String(500))
    youtube_link = Column(String(500))
    apple_music_link = Column(String(500))
    preview_audio_url = Column(String(500))
    lyrics_available = Column(Boolean, default=False)
    instrumental_only = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserRecommendationPreference(Base):
    __tablename__ = "user_recommendation_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    preferred_categories = Column(JSON)  # List of preferred category names
    language_preference = Column(String(20), default='tamil')
    color_therapy_enabled = Column(Boolean, default=True)
    audio_enabled = Column(Boolean, default=True)
    music_autoplay = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", backref="recommendation_preferences")

class RecommendationFeedback(Base):
    __tablename__ = "recommendation_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommendation_id = Column(Integer, nullable=False)
    recommendation_type = Column(String(50), nullable=False)  # siddha, idiom, quote, music
    completed = Column(Boolean, default=False)
    effectiveness_rating = Column(Integer)  # 1-5 scale
    time_spent = Column(Integer)  # in seconds
    feedback_text = Column(Text)
    mood_before = Column(String(50))
    mood_after = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", backref="recommendation_feedbacks")

class EmotionColorTheme(Base):
    __tablename__ = "emotion_color_themes"
    
    id = Column(Integer, primary_key=True, index=True)
    emotion = Column(String(50), nullable=False, unique=True)
    primary_color = Column(String(7))  # Hex color
    secondary_color = Column(String(7))
    accent_color = Column(String(7))
    gradient = Column(String(200))
    reasoning = Column(Text)
    avoid_colors = Column(JSON)  # List of colors to avoid
    transition_duration = Column(String(10), default='3s')
    created_at = Column(DateTime, default=datetime.utcnow)
