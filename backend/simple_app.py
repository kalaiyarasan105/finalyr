from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional, List
import os

# Try importing our modules one by one
try:
    from database import engine, get_db
    print("✅ Database imported")
except Exception as e:
    print(f"❌ Database import failed: {e}")

try:
    from models import Base, User, Conversation, Message
    print("✅ Models imported")
except Exception as e:
    print(f"❌ Models import failed: {e}")

try:
    from schemas import (
        UserCreate, UserResponse, UserLogin, Token,
        ConversationCreate, ConversationResponse,
        MessageResponse, EmotionPrediction
    )
    print("✅ Schemas imported")
except Exception as e:
    print(f"❌ Schemas import failed: {e}")

try:
    from auth import (
        authenticate_user, create_access_token, get_current_user,
        get_password_hash, verify_password
    )
    print("✅ Auth imported")
except Exception as e:
    print(f"❌ Auth import failed: {e}")

try:
    from emotion_service import emotion_service
    print("✅ Emotion service imported")
except Exception as e:
    print(f"❌ Emotion service import failed: {e}")

try:
    from config import settings
    print("✅ Config imported")
except Exception as e:
    print(f"❌ Config import failed: {e}")

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
except Exception as e:
    print(f"❌ Database table creation failed: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="Emotion Recognition API",
    description="A complete emotion recognition web application with multimodal support",
    version="2.0.0"
)

print("✅ FastAPI app created successfully")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Emotion Recognition API",
        "version": "2.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)