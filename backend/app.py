from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, HTMLResponse
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import Optional, List
import os
import uuid
import shutil
import json

# Local imports
from database import engine, get_db
from models import Base, User, Conversation, Message, MoodJournalEntry, WellnessRecommendation, WellnessFeedback
# Import recommendation models to register them with SQLAlchemy
import recommendation_models  # This ensures all models are registered
from schemas import (
    UserCreate, UserResponse, UserLogin, Token,
    ConversationCreate, ConversationResponse,
    MessageResponse, EmotionPrediction,
    WellnessRecommendationResponse, WellnessFeedbackCreate, WellnessFeedbackResponse,
    MoodJournalEntryResponse, SmartPromptResponse, EmotionalInsightsResponse
)
from auth import (
    authenticate_user, create_access_token, get_current_user,
    get_password_hash, verify_password
)
from emotion_service import emotion_service
from wellness_service import wellness_engine
from mood_journal_service import mood_journal_service
from analytics import AnalyticsService
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

# Global state for real-time emotion tracking
current_emotions = {}  # user_id -> emotion_data

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
# HTMX Real-time Emotion Routes
# ----------------------

@app.get("/api/emotions/live")
async def get_live_emotions(current_user: User = Depends(get_current_user)):
    """HTMX endpoint for real-time emotion updates"""
    user_emotion = current_emotions.get(current_user.id, {
        "current_emotion": "neutral",
        "confidence": 0.5,
        "timestamp": datetime.now().isoformat(),
        "intensity": "medium"
    })
    
    return JSONResponse(content=user_emotion)

@app.get("/api/emotions/live/html")
async def get_live_emotions_html(current_user: User = Depends(get_current_user)):
    """HTMX endpoint returning HTML for emotion indicator"""
    user_emotion = current_emotions.get(current_user.id, {
        "current_emotion": "neutral",
        "confidence": 0.5,
        "timestamp": datetime.now().isoformat(),
        "intensity": "medium"
    })
    
    emotion_icons = {
        "joy": "😊",
        "sadness": "😢", 
        "anger": "😠",
        "fear": "😨",
        "surprise": "😲",
        "disgust": "🤢",
        "neutral": "😐"
    }
    
    icon = emotion_icons.get(user_emotion["current_emotion"], "🤔")
    confidence_percent = int(user_emotion["confidence"] * 100)
    
    html = f"""
    <div class="emotion-indicator" 
         data-emotion="{user_emotion['current_emotion']}"
         data-confidence="{confidence_percent}"
         title="{user_emotion['current_emotion']} ({confidence_percent}%)">
        <span class="emotion-icon">{icon}</span>
        <span class="emotion-confidence">{confidence_percent}%</span>
    </div>
    """
    
    return HTMLResponse(content=html)

@app.post("/api/emotions/update")
async def update_current_emotion(
    emotion: str,
    confidence: float,
    intensity: str = "medium",
    current_user: User = Depends(get_current_user)
):
    """Update current user's emotion state for real-time tracking"""
    current_emotions[current_user.id] = {
        "current_emotion": emotion,
        "confidence": confidence,
        "intensity": intensity,
        "timestamp": datetime.now().isoformat()
    }
    
    return {"status": "updated", "emotion": emotion, "confidence": confidence}

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
    prediction = emotion_service.predict_multimodal(text, image_bytes, conversation_id)
    
    # Update real-time emotion state
    if prediction["final_emotion"]:
        current_emotions[current_user.id] = {
            "current_emotion": prediction["final_emotion"],
            "confidence": prediction["final_confidence"],
            "intensity": prediction["emotion_intensity"],
            "timestamp": datetime.now().isoformat()
        }
    
    # Generate wellness recommendations based on emotion and mood insights
    wellness_recommendations = []
    if prediction["final_emotion"] and prediction["final_emotion"] != "neutral":
        # Get recent mood insights for personalization
        mood_insights = {}
        user_history = {}
        
        if conversation_id:
            # Get recent conversations for mood analysis
            recent_messages = db.query(Message).join(Conversation).filter(
                Conversation.user_id == current_user.id,
                Message.created_at >= datetime.now() - timedelta(days=7),
                Message.is_user_message == True
            ).order_by(Message.created_at.desc()).limit(20).all()
            
            if recent_messages:
                mood_insights = mood_journal_service.pattern_analyzer.analyze_conversations(recent_messages)
                user_history = {"recent_conversations": [{"content": msg.content} for msg in recent_messages]}
        
        # Generate personalized wellness recommendations
        recommendations = wellness_engine.generate_recommendations(
            prediction["final_emotion"],
            mood_insights,
            user_history,
            str(current_user.id)
        )
        
        # Save recommendations to database
        for rec in recommendations[:3]:  # Save top 3 recommendations
            db_recommendation = WellnessRecommendation(
                user_id=current_user.id,
                recommendation_id=rec.id,
                action=rec.action,
                duration=rec.duration,
                type=rec.type.value,
                priority=rec.priority,
                confidence=rec.confidence,
                rationale=rec.rationale,
                instructions=rec.instructions,
                personalized=rec.personalized,
                emotion_context=prediction["final_emotion"],
                emotion_intensity=prediction["emotion_intensity"],
                timeframe=getattr(rec, 'timeframe', 'immediate')
            )
            db.add(db_recommendation)
            wellness_recommendations.append(rec)
    
    # Save user message to database if conversation_id provided
    if conversation_id:
        # Verify conversation belongs to user
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        
        if conversation:
            # Check if this is the first user message in the conversation
            message_count = db.query(Message).filter(
                Message.conversation_id == conversation_id,
                Message.is_user_message == True
            ).count()
            
            # Generate title from first message
            if message_count == 0 and text:
                # Create a meaningful title from the first message
                title_text = text.strip()
                # Limit to first 50 characters
                if len(title_text) > 50:
                    title_text = title_text[:47] + "..."
                conversation.title = title_text
            
            # Save user message
            user_message = Message(
                conversation_id=conversation_id,
                content=text or "[Image]",
                is_user_message=True,
                text_emotion=prediction["text_emotion"],
                text_confidence=prediction["text_confidence"],
                face_emotion=prediction["face_emotion"],
                face_confidence=prediction["face_confidence"],
                final_emotion=prediction["final_emotion"],
                final_confidence=prediction["final_confidence"],
                emotion_intensity=prediction["emotion_intensity"],
                fusion_method=prediction["fusion_method"],
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
    
    # Add wellness recommendations to response
    prediction["wellness_recommendations"] = [
        {
            "id": rec.id,
            "action": rec.action,
            "duration": rec.duration,
            "type": rec.type.value,
            "priority": rec.priority,
            "confidence": rec.confidence,
            "rationale": rec.rationale,
            "instructions": rec.instructions,
            "personalized": rec.personalized,
            "timeframe": getattr(rec, 'timeframe', 'immediate')
        } for rec in wellness_recommendations
    ]
    
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

# ----------------------
# Wellness Recommendations Routes
# ----------------------

@app.get("/api/wellness/recommendations", response_model=List[WellnessRecommendationResponse])
async def get_wellness_recommendations(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent wellness recommendations for the user"""
    recommendations = db.query(WellnessRecommendation).filter(
        WellnessRecommendation.user_id == current_user.id
    ).order_by(WellnessRecommendation.created_at.desc()).limit(limit).all()
    
    return recommendations

@app.post("/api/wellness/recommendations/{recommendation_id}/feedback")
async def submit_wellness_feedback(
    recommendation_id: int,
    feedback: WellnessFeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit feedback for a wellness recommendation"""
    # Verify recommendation belongs to user
    recommendation = db.query(WellnessRecommendation).filter(
        WellnessRecommendation.id == recommendation_id,
        WellnessRecommendation.user_id == current_user.id
    ).first()
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    # Create feedback entry
    db_feedback = WellnessFeedback(
        recommendation_id=recommendation_id,
        completed=feedback.completed,
        rating=feedback.rating,
        notes=feedback.notes
    )
    db.add(db_feedback)
    
    # Update wellness engine with feedback for learning
    if feedback.rating is not None:
        from wellness_service import UserFeedback
        user_feedback = UserFeedback(
            recommendation_id=recommendation.recommendation_id,
            completed=feedback.completed,
            rating=feedback.rating,
            notes=feedback.notes,
            timestamp=datetime.now()
        )
        wellness_engine.record_feedback(str(current_user.id), user_feedback)
    
    db.commit()
    db.refresh(db_feedback)
    
    return {"message": "Feedback submitted successfully", "feedback_id": db_feedback.id}

@app.get("/api/wellness/recommendations/personalized")
async def get_personalized_recommendations(
    emotion: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized wellness recommendations for a specific emotion"""
    # Get recent mood insights
    recent_messages = db.query(Message).join(Conversation).filter(
        Conversation.user_id == current_user.id,
        Message.created_at >= datetime.now() - timedelta(days=7),
        Message.is_user_message == True
    ).order_by(Message.created_at.desc()).limit(20).all()
    
    mood_insights = {}
    user_history = {}
    
    if recent_messages:
        mood_insights = mood_journal_service.pattern_analyzer.analyze_conversations(recent_messages)
        user_history = {"recent_conversations": [{"content": msg.content} for msg in recent_messages]}
    
    # Generate recommendations
    recommendations = wellness_engine.generate_recommendations(
        emotion,
        mood_insights,
        user_history,
        str(current_user.id)
    )
    
    return {
        "emotion": emotion,
        "recommendations": [
            {
                "id": rec.id,
                "action": rec.action,
                "duration": rec.duration,
                "type": rec.type.value,
                "priority": rec.priority,
                "confidence": rec.confidence,
                "rationale": rec.rationale,
                "instructions": rec.instructions,
                "personalized": rec.personalized,
                "timeframe": getattr(rec, 'timeframe', 'immediate')
            } for rec in recommendations
        ]
    }

# ----------------------
# Mood Journal Routes
# ----------------------

@app.get("/api/mood-journal/entries", response_model=List[MoodJournalEntryResponse])
async def get_mood_journal_entries(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get mood journal entries for the specified number of days"""
    cutoff_date = datetime.now().date() - timedelta(days=days)
    
    entries = db.query(MoodJournalEntry).filter(
        MoodJournalEntry.user_id == current_user.id,
        MoodJournalEntry.date >= cutoff_date
    ).order_by(MoodJournalEntry.date.desc()).all()
    
    return entries

@app.get("/api/mood-journal/entries/{date}")
async def get_mood_journal_entry(
    date: str,  # Format: YYYY-MM-DD
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get or generate mood journal entry for a specific date"""
    try:
        entry_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Check if entry already exists
    existing_entry = db.query(MoodJournalEntry).filter(
        MoodJournalEntry.user_id == current_user.id,
        MoodJournalEntry.date == entry_date
    ).first()
    
    if existing_entry:
        return existing_entry
    
    # Generate new entry
    entry_datetime = datetime.combine(entry_date, datetime.min.time())
    mood_entry = mood_journal_service.generate_daily_entry(current_user.id, entry_datetime, db)
    
    # Save to database
    db_entry = MoodJournalEntry(
        user_id=current_user.id,
        date=entry_date,
        dominant_emotions=mood_entry.dominant_emotions,
        emotion_intensity_curve=[(t.isoformat(), e, i) for t, e, i in mood_entry.emotion_intensity_curve],
        identified_triggers=[{
            "trigger_text": t.trigger_text,
            "category": t.category,
            "emotion_before": t.emotion_before,
            "emotion_after": t.emotion_after,
            "intensity_change": t.intensity_change,
            "timestamp": t.timestamp.isoformat(),
            "context": t.context
        } for t in mood_entry.identified_triggers],
        natural_coping_strategies=[{
            "strategy_description": s.strategy_description,
            "category": s.category,
            "effectiveness": s.effectiveness,
            "emotional_context": s.emotional_context,
            "timestamp": s.timestamp.isoformat()
        } for s in mood_entry.natural_coping_strategies],
        activity_correlations=mood_entry.activity_correlations,
        social_context=mood_entry.social_context,
        physical_symptoms=mood_entry.physical_symptoms,
        environmental_factors=mood_entry.environmental_factors,
        sleep_mentions=mood_entry.sleep_mentions,
        work_stress_indicators=mood_entry.work_stress_indicators,
        overall_mood_trend=mood_entry.overall_mood_trend,
        key_insights=mood_entry.key_insights
    )
    
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return db_entry

@app.get("/api/mood-journal/smart-prompts", response_model=List[SmartPromptResponse])
async def get_smart_prompts(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get smart prompts based on recent mood patterns"""
    prompts = mood_journal_service.generate_smart_prompts(current_user.id, days, db)
    return prompts

@app.get("/api/mood-journal/insights")
async def get_mood_insights(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive mood insights and analytics"""
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Get recent messages for analysis
    messages = db.query(Message).join(Conversation).filter(
        Conversation.user_id == current_user.id,
        Message.created_at >= cutoff_date,
        Message.is_user_message == True
    ).order_by(Message.created_at).all()
    
    if not messages:
        return {
            "message": "No conversation data available for the specified period",
            "date_range": {"start": cutoff_date.date(), "end": datetime.now().date()},
            "total_conversations": 0
        }
    
    # Analyze conversations
    analysis = mood_journal_service.pattern_analyzer.analyze_conversations(messages)
    
    # Get mood journal entries
    entries = db.query(MoodJournalEntry).filter(
        MoodJournalEntry.user_id == current_user.id,
        MoodJournalEntry.date >= cutoff_date.date()
    ).all()
    
    # Calculate emotion distribution
    all_emotions = [msg.final_emotion for msg in messages if msg.final_emotion]
    emotion_distribution = {}
    if all_emotions:
        from collections import Counter
        emotion_counts = Counter(all_emotions)
        total = len(all_emotions)
        emotion_distribution = {emotion: count/total for emotion, count in emotion_counts.items()}
    
    # Get wellness recommendations effectiveness
    recommendations = db.query(WellnessRecommendation).filter(
        WellnessRecommendation.user_id == current_user.id,
        WellnessRecommendation.created_at >= cutoff_date
    ).all()
    
    wellness_feedback = db.query(WellnessFeedback).join(WellnessRecommendation).filter(
        WellnessRecommendation.user_id == current_user.id,
        WellnessFeedback.created_at >= cutoff_date
    ).all()
    
    return {
        "date_range": {"start": cutoff_date.date(), "end": datetime.now().date()},
        "total_conversations": len(messages),
        "emotion_distribution": emotion_distribution,
        "mood_trends": analysis.get("emotion_timeline", []),
        "trigger_analysis": {
            "total_triggers": len(analysis.get("triggers", [])),
            "trigger_categories": [t.category for t in analysis.get("triggers", [])]
        },
        "coping_effectiveness": {
            "strategies_identified": len(analysis.get("coping_strategies", [])),
            "average_effectiveness": sum(s.effectiveness for s in analysis.get("coping_strategies", [])) / max(len(analysis.get("coping_strategies", [])), 1)
        },
        "wellness_progress": {
            "recommendations_received": len(recommendations),
            "feedback_provided": len(wellness_feedback),
            "average_rating": sum(f.rating for f in wellness_feedback if f.rating) / max(len([f for f in wellness_feedback if f.rating]), 1)
        },
        "activity_correlations": analysis.get("activity_correlations", {}),
        "social_context": analysis.get("social_context", {}),
        "physical_symptoms": analysis.get("physical_symptoms", []),
        "environmental_factors": analysis.get("environmental_factors", []),
        "journal_entries_count": len(entries)
    }

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

# ----------------------
# Analytics Endpoints
# ----------------------

analytics_service = AnalyticsService()

@app.get("/analytics/overview")
async def get_analytics_overview(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics for the current user"""
    try:
        analytics = analytics_service.get_user_analytics(db, current_user.id, days)
        return analytics
    except Exception as e:
        print(f"Analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/emotions")
async def get_emotion_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed emotion analytics"""
    try:
        analytics = analytics_service.get_user_analytics(db, current_user.id, 30)
        return {
            "emotion_distribution": analytics["emotion_distribution"],
            "emotion_trends": analytics["emotion_trends"],
            "intensity_analysis": analytics["intensity_analysis"]
        }
    except Exception as e:
        print(f"Emotion analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/insights")
async def get_user_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-generated insights about user's emotional patterns"""
    try:
        analytics = analytics_service.get_user_analytics(db, current_user.id, 30)
        return {
            "insights": analytics.get("insights", []),
            "emotional_journey": analytics.get("emotional_journey", [])[-10:],  # Last 10 interactions
            "overview": analytics.get("overview", {})
        }
    except Exception as e:
        print(f"Insights error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.environment == "development" else False
    )


# Import recommendation service
from recommendation_service import get_recommendation_service
# Recommendation models use the same Base, so tables are already created above

# ==================== RECOMMENDATION ENDPOINTS ====================

@app.get("/api/recommendations/categories")
async def get_recommendation_categories():
    """Get all available recommendation categories"""
    categories = [
        {
            'id': 'siddha',
            'name': 'Siddha Remedies',
            'icon': '🌿',
            'description': 'Traditional Tamil healing practices',
            'subtitle': 'Ancient Siddha medicine techniques'
        },
        {
            'id': 'idioms',
            'name': 'Tamil Wisdom',
            'icon': '💬',
            'description': 'Chennai-style idioms & proverbs',
            'subtitle': 'Traditional Tamil sayings'
        },
        {
            'id': 'quotes',
            'name': 'Motivational Quotes',
            'icon': '✨',
            'description': 'Inspiring words from great minds',
            'subtitle': 'Thirukkural and modern inspiration'
        },
        {
            'id': 'music',
            'name': 'Music Therapy',
            'icon': '🎵',
            'description': 'Healing through sound',
            'subtitle': 'Carnatic ragas and therapeutic music'
        },
        {
            'id': 'all',
            'name': 'Complete Wellness',
            'icon': '🌟',
            'description': 'All recommendations together',
            'subtitle': 'Holistic wellness approach'
        }
    ]
    return {'categories': categories}

@app.get("/api/recommendations/{emotion}/{category}")
async def get_recommendations(
    emotion: str,
    category: str,
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get recommendations by emotion and category
    
    Args:
        emotion: Detected emotion (sadness, anger, anxiety, etc.)
        category: siddha, idioms, quotes, music, or all
        limit: Number of recommendations to return
    """
    try:
        rec_service = get_recommendation_service(db)
        recommendations = rec_service.get_recommendations_by_category(
            emotion=emotion,
            category=category,
            user_id=current_user.id,
            limit=limit
        )
        
        return {
            'emotion': emotion,
            'category': category,
            'recommendations': recommendations,
            'count': len(recommendations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendations/color-theme/{emotion}")
async def get_emotion_color_theme(
    emotion: str,
    db: Session = Depends(get_db)
):
    """Get color theme for specific emotion"""
    try:
        rec_service = get_recommendation_service(db)
        theme = rec_service.get_emotion_color_theme(emotion)
        
        if not theme:
            # Return default neutral theme
            theme = {
                'emotion': emotion,
                'primary_color': '#F0F8FF',
                'secondary_color': '#F5F5F5',
                'accent_color': '#E6F3FF',
                'gradient': 'linear-gradient(135deg, #F0F8FF 0%, #F5F5F5 100%)',
                'reasoning': 'Default neutral theme',
                'avoid_colors': [],
                'transition_duration': '2s'
            }
        
        return theme
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/feedback")
async def submit_recommendation_feedback(
    recommendation_id: int = Form(...),
    recommendation_type: str = Form(...),
    completed: bool = Form(False),
    effectiveness_rating: Optional[int] = Form(None),
    time_spent: Optional[int] = Form(None),
    feedback_text: Optional[str] = Form(None),
    mood_before: Optional[str] = Form(None),
    mood_after: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit feedback for a recommendation"""
    try:
        rec_service = get_recommendation_service(db)
        
        feedback_data = {
            'completed': completed,
            'effectiveness_rating': effectiveness_rating,
            'time_spent': time_spent,
            'feedback_text': feedback_text,
            'mood_before': mood_before,
            'mood_after': mood_after
        }
        
        feedback = rec_service.save_recommendation_feedback(
            user_id=current_user.id,
            recommendation_id=recommendation_id,
            recommendation_type=recommendation_type,
            feedback_data=feedback_data
        )
        
        return {
            'message': 'Feedback submitted successfully',
            'feedback_id': feedback.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/recommendation-preferences")
async def get_user_recommendation_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's recommendation preferences"""
    try:
        rec_service = get_recommendation_service(db)
        preferences = rec_service.get_user_preferences(current_user.id)
        
        if not preferences:
            # Return default preferences
            preferences = {
                'preferred_categories': [],
                'language_preference': 'tamil',
                'color_therapy_enabled': True,
                'audio_enabled': True,
                'music_autoplay': False
            }
        
        return preferences
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/user/recommendation-preferences")
async def update_user_recommendation_preferences(
    preferred_categories: Optional[List[str]] = Form(None),
    language_preference: Optional[str] = Form(None),
    color_therapy_enabled: Optional[bool] = Form(None),
    audio_enabled: Optional[bool] = Form(None),
    music_autoplay: Optional[bool] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's recommendation preferences"""
    try:
        rec_service = get_recommendation_service(db)
        
        preferences = {}
        if preferred_categories is not None:
            preferences['preferred_categories'] = preferred_categories
        if language_preference is not None:
            preferences['language_preference'] = language_preference
        if color_therapy_enabled is not None:
            preferences['color_therapy_enabled'] = color_therapy_enabled
        if audio_enabled is not None:
            preferences['audio_enabled'] = audio_enabled
        if music_autoplay is not None:
            preferences['music_autoplay'] = music_autoplay
        
        updated_prefs = rec_service.update_user_preferences(
            user_id=current_user.id,
            preferences=preferences
        )
        
        return {
            'message': 'Preferences updated successfully',
            'preferences': {
                'preferred_categories': updated_prefs.preferred_categories,
                'language_preference': updated_prefs.language_preference,
                'color_therapy_enabled': updated_prefs.color_therapy_enabled,
                'audio_enabled': updated_prefs.audio_enabled,
                'music_autoplay': updated_prefs.music_autoplay
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
