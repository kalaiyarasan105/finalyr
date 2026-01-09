from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey, Boolean
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