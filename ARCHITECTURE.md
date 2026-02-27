# EmotiAI System Architecture

## System Overview

EmotiAI is a multimodal emotion recognition system with personalized wellness recommendations, built using a modern microservices architecture with React frontend and FastAPI backend.

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                           │
│                         (React + Tailwind CSS)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Chat UI    │  │  Dashboard   │  │   Settings   │  │  Insights  │ │
│  │  Interface   │  │   Analytics  │  │  Preferences │  │  Analytics │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                  │                 │        │
│         └─────────────────┴──────────────────┴─────────────────┘        │
│                                    │                                     │
│                          ┌─────────▼─────────┐                          │
│                          │   State Manager   │                          │
│                          │  (Zustand Store)  │                          │
│                          └─────────┬─────────┘                          │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │    API Gateway      │
                          │  (Axios/Fetch API)  │
                          └──────────┬──────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────────────┐
│                          ┌─────────▼─────────┐                          │
│                          │   FastAPI Server  │                          │
│                          │   (Port 8000)     │                          │
│                          └─────────┬─────────┘                          │
│                                    │                                     │
│         ┌──────────────────────────┼──────────────────────────┐         │
│         │                          │                           │         │
│  ┌──────▼──────┐          ┌───────▼────────┐        ┌────────▼──────┐  │
│  │   Auth      │          │   Emotion      │        │ Recommendation│  │
│  │  Service    │          │   Service      │        │    Service    │  │
│  └──────┬──────┘          └───────┬────────┘        └────────┬──────┘  │
│         │                         │                           │         │
│         │                 ┌───────┴────────┐                  │         │
│         │                 │                │                  │         │
│  ┌──────▼──────┐   ┌──────▼──────┐  ┌─────▼──────┐   ┌──────▼──────┐  │
│  │   JWT       │   │  DistilBERT │  │    ViT     │   │     KNN     │  │
│  │   Token     │   │   (Text)    │  │   (Face)   │   │  Similarity │  │
│  └─────────────┘   └─────────────┘  └────────────┘   └─────────────┘  │
│                                                                          │
│                    BACKEND SERVICES LAYER (Python)                      │
└────────────────────────────────────────┬─────────────────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │   Database Layer    │
                              │   (SQLAlchemy)      │
                              └──────────┬──────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
             ┌──────▼──────┐      ┌─────▼─────┐      ┌──────▼──────┐
             │   SQLite    │      │   User    │      │ Recommend.  │
             │  Database   │      │   Data    │      │    Data     │
             └─────────────┘      └───────────┘      └─────────────┘
```

---

## Detailed Component Architecture

### 1. Frontend Architecture (React)

```
frontend/
├── src/
│   ├── components/
│   │   ├── ProfessionalChatInterface.js    ← Main chat UI
│   │   ├── WebcamCapture.js                ← Face capture
│   │   ├── RecommendationSelector.js       ← Category selection
│   │   ├── RecommendationDisplay.js        ← Show recommendations
│   │   ├── ColorTherapy.js                 ← Dynamic backgrounds
│   │   ├── Dashboard.js                    ← Analytics dashboard
│   │   ├── EmotionalInsights.js            ← Insights visualization
│   │   └── Navigation.js                   ← App navigation
│   │
│   ├── store/
│   │   └── recommendationStore.js          ← Zustand state management
│   │
│   ├── api/
│   │   ├── auth.js                         ← Authentication API
│   │   └── conversations.js                ← Conversation API
│   │
│   ├── contexts/
│   │   └── AuthContext.js                  ← Auth context provider
│   │
│   └── hooks/
│       └── useColorTherapy.js              ← Color therapy hook
```

**Key Technologies:**
- React 18.x
- Tailwind CSS
- Zustand (State Management)
- Axios (HTTP Client)
- Framer Motion (Animations)
- React Webcam (Camera Access)

---

### 2. Backend Architecture (FastAPI)

```
backend/
├── app.py                          ← Main FastAPI application
├── emotion_service.py              ← Emotion detection service
├── recommendation_service.py       ← Recommendation engine
├── wellness_service.py             ← Wellness recommendations
├── mood_journal_service.py         ← Mood tracking & analysis
├── analytics.py                    ← Analytics service
├── auth.py                         ← JWT authentication
├── database.py                     ← Database connection
├── models.py                       ← SQLAlchemy models
├── recommendation_models.py        ← Recommendation models
└── schemas.py                      ← Pydantic schemas
```

**Key Technologies:**
- FastAPI
- PyTorch
- Transformers (Hugging Face)
- SQLAlchemy
- Pydantic
- JWT (JSON Web Tokens)

---

## Data Flow Architecture

### Emotion Detection Flow

```
┌─────────────┐
│    User     │
│   Input     │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│    Text     │   │   Image     │
│   Input     │   │  (Webcam)   │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│ DistilBERT  │   │     ViT     │
│   Model     │   │    Model    │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │  Text Emotion   │  Face Emotion
       │  + Confidence   │  + Confidence
       │                 │
       └────────┬────────┘
                │
         ┌──────▼──────┐
         │  Multimodal │
         │   Fusion    │
         │  Algorithm  │
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │   Final     │
         │  Emotion    │
         │ + Intensity │
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │  Context    │
         │  Analysis   │
         └──────┬──────┘
                │
         ┌──────▼──────┐
         │    Bot      │
         │  Response   │
         └─────────────┘
```

### Recommendation Flow

```
┌─────────────┐
│  Detected   │
│  Emotion    │
└──────┬──────┘
       │
       │ (sadness, anger, fear, etc.)
       │
┌──────▼──────────────────────┐
│  Recommendation Trigger      │
│  (Negative emotions only)    │
└──────┬──────────────────────┘
       │
       ├──────────────────────────────────┐
       │                                  │
┌──────▼──────┐                    ┌──────▼──────┐
│   Emotion   │                    │    User     │
│   Context   │                    │  Preference │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       └──────────────┬───────────────────┘
                      │
               ┌──────▼──────┐
               │     KNN     │
               │  Algorithm  │
               │  (Similar   │
               │   Users)    │
               └──────┬──────┘
                      │
               ┌──────▼──────┐
               │   Cosine    │
               │ Similarity  │
               │  Scoring    │
               └──────┬──────┘
                      │
               ┌──────▼──────┐
               │  Thompson   │
               │  Sampling   │
               │ (Exploration)│
               └──────┬──────┘
                      │
       ┌──────────────┴──────────────┐
       │                             │
┌──────▼──────┐              ┌───────▼──────┐
│   Content   │              │  Collaborative│
│   Filtering │              │   Filtering  │
└──────┬──────┘              └───────┬──────┘
       │                             │
       └──────────────┬──────────────┘
                      │
               ┌──────▼──────┐
               │   Hybrid    │
               │   Ranking   │
               └──────┬──────┘
                      │
       ┌──────────────┴──────────────┐
       │              │              │
┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
│   Siddha    │ │   Tamil   │ │   Music   │
│  Remedies   │ │   Idioms  │ │   Tracks  │
└─────────────┘ └───────────┘ └───────────┘
```

---

## Machine Learning Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    ML PIPELINE ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Input     │
│   Data      │
└──────┬──────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│              PREPROCESSING LAYER                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐              ┌──────────────┐        │
│  │     Text     │              │    Image     │        │
│  │ Tokenization │              │  Extraction  │        │
│  │  (WordPiece) │              │   (Patches)  │        │
│  └──────┬───────┘              └──────┬───────┘        │
│         │                             │                 │
│  ┌──────▼───────┐              ┌──────▼───────┐        │
│  │ Normalization│              │ Normalization│        │
│  │   & Padding  │              │  & Resizing  │        │
│  └──────┬───────┘              └──────┬───────┘        │
└─────────┼──────────────────────────────┼───────────────┘
          │                              │
┌─────────▼──────────────────────────────▼───────────────┐
│              FEATURE EXTRACTION LAYER                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐              ┌──────────────┐        │
│  │  DistilBERT  │              │     ViT      │        │
│  │  Transformer │              │  Transformer │        │
│  │   Encoder    │              │   Encoder    │        │
│  └──────┬───────┘              └──────┬───────┘        │
│         │                             │                 │
│  ┌──────▼───────┐              ┌──────▼───────┐        │
│  │ Self-Attention│              │ Self-Attention│       │
│  │   Mechanism  │              │   Mechanism  │        │
│  └──────┬───────┘              └──────┬───────┘        │
│         │                             │                 │
│  ┌──────▼───────┐              ┌──────▼───────┐        │
│  │   Feature    │              │   Feature    │        │
│  │   Vectors    │              │   Vectors    │        │
│  └──────┬───────┘              └──────┬───────┘        │
└─────────┼──────────────────────────────┼───────────────┘
          │                              │
┌─────────▼──────────────────────────────▼───────────────┐
│            CLASSIFICATION LAYER                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐              ┌──────────────┐        │
│  │   Softmax    │              │   Softmax    │        │
│  │ Classifier   │              │ Classifier   │        │
│  └──────┬───────┘              └──────┬───────┘        │
│         │                             │                 │
│  ┌──────▼───────┐              ┌──────▼───────┐        │
│  │Text Emotion  │              │Face Emotion  │        │
│  │+ Confidence  │              │+ Confidence  │        │
│  └──────┬───────┘              └──────┬───────┘        │
└─────────┼──────────────────────────────┼───────────────┘
          │                              │
          └──────────────┬───────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              FUSION LAYER                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │      Weighted Average Fusion             │          │
│  │   (Confidence-based weighting)           │          │
│  └──────────────┬───────────────────────────┘          │
│                 │                                        │
│  ┌──────────────▼───────────────────────────┐          │
│  │      Intensity Calculation               │          │
│  │   (Threshold-based classification)       │          │
│  └──────────────┬───────────────────────────┘          │
└─────────────────┼──────────────────────────────────────┘
                  │
           ┌──────▼──────┐
           │   Final     │
           │  Emotion    │
           │ + Intensity │
           └─────────────┘
```

---

## Database Schema Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Users     │         │Conversations │         │   Messages   │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │◄───────┤ id (PK)      │◄───────┤ id (PK)      │
│ username     │         │ user_id (FK) │         │ conv_id (FK) │
│ email        │         │ title        │         │ content      │
│ password     │         │ created_at   │         │ is_user_msg  │
│ created_at   │         │ updated_at   │         │ text_emotion │
└──────────────┘         └──────────────┘         │ face_emotion │
                                                   │ final_emotion│
                                                   │ confidence   │
                                                   │ intensity    │
                                                   │ created_at   │
                                                   └──────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│SiddhaRemedies│         │ TamilIdioms  │         │ MusicTracks  │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ emotion      │         │ emotion      │         │ emotion      │
│ title        │         │ tamil_text   │         │ title        │
│ category     │         │ translation  │         │ artist       │
│ instructions │         │ context      │         │ youtube_link │
│ materials    │         │ story        │         │ duration     │
│ benefits     │         │ audio_url    │         │ raga         │
└──────────────┘         └──────────────┘         └──────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│MotivQuotes   │         │ColorThemes   │         │  Feedback    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ emotion      │         │ emotion      │         │ user_id (FK) │
│ tamil_text   │         │ primary_color│         │ rec_id (FK)  │
│ translation  │         │ secondary    │         │ rec_type     │
│ source       │         │ accent_color │         │ completed    │
│ author       │         │ gradient     │         │ rating       │
│ quote_type   │         │ reasoning    │         │ feedback_text│
└──────────────┘         └──────────────┘         └──────────────┘

┌──────────────┐         ┌──────────────┐
│MoodJournal   │         │UserPreferences│
├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │
│ user_id (FK) │         │ user_id (FK) │
│ date         │         │ categories   │
│ emotions     │         │ language     │
│ triggers     │         │ color_therapy│
│ coping       │         │ audio_enabled│
│ insights     │         │ music_autoplay│
└──────────────┘         └──────────────┘
```

---

## API Architecture

### REST API Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                            │
└─────────────────────────────────────────────────────────────┘

Authentication:
├── POST   /auth/register          → Register new user
├── POST   /auth/login             → Login & get JWT token
└── GET    /auth/me                → Get current user info

Conversations:
├── POST   /conversations          → Create new conversation
├── GET    /conversations          → Get all conversations
├── GET    /conversations/{id}     → Get specific conversation
└── DELETE /conversations/{id}     → Delete conversation

Emotion Detection:
├── POST   /predict                → Multimodal emotion prediction
├── GET    /api/emotions/live      → Real-time emotion updates
└── POST   /api/emotions/update    → Update current emotion

Recommendations:
├── GET    /api/recommendations/categories           → Get categories
├── GET    /api/recommendations/{emotion}/{category} → Get recommendations
├── GET    /api/recommendations/color-theme/{emotion}→ Get color theme
└── POST   /api/recommendations/feedback             → Submit feedback

Analytics:
├── GET    /analytics/overview     → User analytics overview
├── GET    /analytics/emotions     → Emotion analytics
└── GET    /analytics/insights     → AI-generated insights

Mood Journal:
├── GET    /api/mood-journal/entries        → Get journal entries
├── GET    /api/mood-journal/entries/{date} → Get specific entry
├── GET    /api/mood-journal/smart-prompts  → Get smart prompts
└── GET    /api/mood-journal/insights       → Get mood insights

Wellness:
├── GET    /api/wellness/recommendations              → Get recommendations
├── POST   /api/wellness/recommendations/{id}/feedback→ Submit feedback
└── GET    /api/wellness/recommendations/personalized → Personalized recs
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Layer 1: Authentication & Authorization                 │
├──────────────────────────────────────────────────────────┤
│  • JWT Token-based authentication                        │
│  • Password hashing (bcrypt)                             │
│  • Token expiration (configurable)                       │
│  • Protected routes with dependency injection            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Layer 2: CORS & Request Validation                      │
├──────────────────────────────────────────────────────────┤
│  • CORS middleware (localhost:3000, 3001)                │
│  • Pydantic schema validation                            │
│  • Request size limits                                   │
│  • Content-Type validation                               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Layer 3: Data Protection                                │
├──────────────────────────────────────────────────────────┤
│  • SQL injection prevention (SQLAlchemy ORM)             │
│  • XSS protection (React escaping)                       │
│  • File upload validation                                │
│  • Secure file storage (UUID naming)                     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Layer 4: Privacy & Compliance                           │
├──────────────────────────────────────────────────────────┤
│  • User data isolation (user_id filtering)               │
│  • Conversation privacy                                  │
│  • Secure image storage                                  │
│  • GDPR-compliant data handling                          │
└──────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT DIAGRAM                         │
└─────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │   Browser   │
                    │   (Client)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │
                    │ (Reverse    │
                    │   Proxy)    │
                    └──────┬──────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
     ┌──────▼──────┐              ┌───────▼──────┐
     │   React     │              │   FastAPI    │
     │   Frontend  │              │   Backend    │
     │ (Port 3000) │              │ (Port 8000)  │
     └─────────────┘              └───────┬──────┘
                                          │
                                   ┌──────▼──────┐
                                   │   SQLite    │
                                   │  Database   │
                                   └─────────────┘

Production Deployment Options:
├── Option 1: Docker Containers
│   ├── frontend-container (nginx + React build)
│   ├── backend-container (uvicorn + FastAPI)
│   └── docker-compose orchestration
│
├── Option 2: Cloud Platform (AWS/Azure/GCP)
│   ├── Frontend: S3 + CloudFront / Azure Static Web Apps
│   ├── Backend: EC2 / App Service / Cloud Run
│   └── Database: RDS / Azure SQL / Cloud SQL
│
└── Option 3: Platform as a Service
    ├── Frontend: Vercel / Netlify
    ├── Backend: Heroku / Railway / Render
    └── Database: PostgreSQL (managed)
```

---

## Technology Stack Summary

### Frontend Stack
- **Framework**: React 18.x
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Build Tool**: Create React App / Webpack

### Backend Stack
- **Framework**: FastAPI
- **ML Framework**: PyTorch
- **NLP/CV**: Hugging Face Transformers
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Authentication**: JWT (python-jose)
- **Server**: Uvicorn (ASGI)

### Database
- **Development**: SQLite
- **Production**: PostgreSQL (recommended)

### ML Models
- **Text Emotion**: DistilBERT (`bhadresh-savani/distilbert-base-uncased-emotion`)
- **Face Emotion**: Vision Transformer (`trpakov/vit-face-expression`)

### Recommendation Algorithms
- **K-Nearest Neighbors (KNN)**
- **Cosine Similarity**
- **Thompson Sampling (Multi-Armed Bandit)**
- **Content-Based Filtering**
- **Collaborative Filtering**
- **Hybrid Recommendation System**

---

## Performance Considerations

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization
- Memoization (React.memo, useMemo)
- Virtual scrolling for large lists
- Service workers for offline support

### Backend Optimization
- Model caching (loaded once at startup)
- Database connection pooling
- Async/await for I/O operations
- Response compression
- Rate limiting

### ML Model Optimization
- GPU acceleration (CUDA when available)
- Model quantization (future)
- Batch processing for multiple requests
- Model serving optimization

---

## Scalability Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              HORIZONTAL SCALING STRATEGY                    │
└─────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │Load Balancer│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
 ┌──────▼──────┐    ┌──────▼──────┐   ┌──────▼──────┐
 │  Backend    │    │  Backend    │   │  Backend    │
 │ Instance 1  │    │ Instance 2  │   │ Instance 3  │
 └──────┬──────┘    └──────┬──────┘   └──────┬──────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Database   │
                    │   Cluster   │
                    └─────────────┘
```

---

## Monitoring & Logging

```
Application Monitoring:
├── FastAPI built-in logging
├── Request/Response logging
├── Error tracking (Sentry integration ready)
├── Performance metrics
└── User analytics

ML Model Monitoring:
├── Prediction confidence tracking
├── Model accuracy metrics
├── Inference time monitoring
└── Resource usage (CPU/GPU/Memory)

Database Monitoring:
├── Query performance
├── Connection pool status
├── Storage usage
└── Backup status
```

---

## Future Architecture Enhancements

1. **Microservices Split**
   - Separate emotion service
   - Separate recommendation service
   - Message queue (RabbitMQ/Kafka)

2. **Real-time Features**
   - WebSocket support
   - Live emotion streaming
   - Real-time collaboration

3. **Advanced ML**
   - Model fine-tuning pipeline
   - A/B testing framework
   - Federated learning

4. **Enhanced Security**
   - OAuth2 integration
   - Two-factor authentication
   - End-to-end encryption

---

## Version Information

- **Architecture Version**: 2.0.0
- **Last Updated**: 2026-02-07
- **Status**: Production Ready

---

For implementation details, see:
- [README.md](README.md) - General documentation
- [HOW_TO_RUN.md](HOW_TO_RUN.md) - Setup instructions
- [IEEE_README.md](IEEE_README.md) - Research documentation
