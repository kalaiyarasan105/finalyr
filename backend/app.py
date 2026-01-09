from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional, List
import os
import uuid
import shutil

# Local imports
from database import engine, get_db
from models import Base, User, Conversation, Message
from schemas import (
    UserCreate, UserResponse, UserLogin, Token,
    ConversationCreate, ConversationResponse,
    MessageResponse, EmotionPrediction
)
from auth import (
    authenticate_user, create_access_token, get_current_user,
    get_password_hash, verify_password
)
from emotion_service import emotion_service
from config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Emotion Recognition API",
    description="A complete emotion recognition web application with multimodal support",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ----------------------
# Authentication Routes
# ----------------------

@app.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# ----------------------
# Conversation Routes
# ----------------------

@app.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_conversation = Conversation(
        title=conversation.title,
        user_id=current_user.id
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

@app.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()
    return conversations

@app.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conversation)
    db.commit()
    return {"message": "Conversation deleted successfully"}

# ----------------------
# Emotion Prediction Routes
# ----------------------

@app.post("/predict", response_model=EmotionPrediction)
async def predict_emotion(
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    conversation_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not text and not image:
        raise HTTPException(
            status_code=400,
            detail="Either text or image must be provided"
        )
    
    # Process image if provided
    image_bytes = None
    image_path = None
    if image:
        # Save uploaded image
        file_extension = image.filename.split(".")[-1] if "." in image.filename else "jpg"
        image_filename = f"{uuid.uuid4()}.{file_extension}"
        image_path = f"uploads/{image_filename}"
        
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # Read image bytes for prediction
        with open(image_path, "rb") as f:
            image_bytes = f.read()
    
    # Get emotion prediction
    prediction = emotion_service.predict_multimodal(text, image_bytes)
    
    # Save user message to database if conversation_id provided
    if conversation_id:
        # Verify conversation belongs to user
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        
        if conversation:
            # Save user message
            user_message = Message(
                conversation_id=conversation_id,
                content=text or "[Image]",
                is_user_message=True,
                text_emotion=prediction["text_emotion"],
                text_confidence=prediction["text_confidence"],
                face_emotion=prediction["face_emotion"],
                face_confidence=prediction["face_confidence"],
                image_path=image_path
            )
            db.add(user_message)
            
            # Save bot response
            bot_message = Message(
                conversation_id=conversation_id,
                content=prediction["bot_response"],
                is_user_message=False
            )
            db.add(bot_message)
            
            db.commit()
    
    return prediction

@app.post("/predict_multimodal", response_model=EmotionPrediction)
async def predict_multimodal_legacy(
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Legacy endpoint for backward compatibility"""
    if not text and not image:
        raise HTTPException(
            status_code=400,
            detail="Either text or image must be provided"
        )
    
    # Process image if provided
    image_bytes = None
    if image:
        image_bytes = await image.read()
    
    # Get emotion prediction
    prediction = emotion_service.predict_multimodal(text, image_bytes)
    return prediction

# ----------------------
# Health Check
# ----------------------

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/")
async def root():
    return {
        "message": "Emotion Recognition API",
        "version": "2.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.environment == "development" else False
    )