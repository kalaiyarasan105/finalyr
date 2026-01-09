from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class AccountDeletion(BaseModel):
    password: str

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Message schemas
class MessageBase(BaseModel):
    content: str
    is_user_message: bool = True

class MessageCreate(MessageBase):
    conversation_id: int

class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    text_emotion: Optional[str] = None
    text_confidence: Optional[float] = None
    face_emotion: Optional[str] = None
    face_confidence: Optional[float] = None
    final_emotion: Optional[str] = None
    final_confidence: Optional[float] = None
    emotion_intensity: Optional[str] = None
    fusion_method: Optional[str] = None
    image_path: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Conversation schemas
class ConversationBase(BaseModel):
    title: str = "New Conversation"

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True

# Emotion prediction schemas
class EmotionPrediction(BaseModel):
    text_emotion: Optional[str] = None
    text_confidence: Optional[float] = None
    face_emotion: Optional[str] = None
    face_confidence: Optional[float] = None
    final_emotion: str
    final_confidence: float
    emotion_intensity: str
    fusion_method: str
    bot_response: str
    example_inputs: List[str]