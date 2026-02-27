# Emotion Recognition Web Application

A complete full-stack web application that uses AI to detect emotions from text and facial expressions, providing empathetic responses through an intelligent chatbot interface.

## 🌟 Features

### Core Functionality
- **Multimodal Emotion Detection**: Analyzes both text sentiment and facial expressions
- **Real-time Chat Interface**: Interactive conversation with emotion-aware responses
- **User Authentication**: Secure login/registration system
- **Conversation History**: Persistent chat sessions with full message history
- **Responsive Design**: Modern, mobile-friendly interface

### Technical Features
- **FastAPI Backend**: High-performance async API with automatic documentation
- **React Frontend**: Modern SPA with real-time updates
- **SQLite Database**: Persistent data storage for users and conversations
- **JWT Authentication**: Secure token-based authentication
- **File Upload Support**: Image processing for facial emotion detection
- **RESTful API**: Well-structured endpoints with proper error handling

## 📋 System Requirements and Design

### 3.1 Problem Definition

Mental health awareness and emotional well-being have become critical concerns in today's digital age. Traditional methods of emotion recognition and mental health support face several challenges:

- **Limited Accessibility**: Mental health resources are often expensive and not readily available to everyone
- **Lack of Real-time Support**: Existing systems don't provide immediate emotional support when needed
- **Single-modal Analysis**: Most emotion detection systems rely on either text or visual input, not both
- **Generic Responses**: Current chatbots provide generic responses without considering emotional context
- **Privacy Concerns**: Users hesitate to share personal emotional data due to privacy issues
- **Scalability Issues**: Traditional therapy and counseling don't scale to meet growing demand

The need for an intelligent, accessible, and privacy-focused emotion recognition system that can provide real-time emotional support and wellness recommendations is evident.

### 3.2 Existing System

Current emotion recognition and mental health support systems include:

**Traditional Therapy and Counseling:**
- Face-to-face sessions with licensed therapists
- Telephone-based counseling services
- Group therapy sessions

**Digital Mental Health Platforms:**
- Basic mood tracking applications
- Simple chatbots with predefined responses
- Online therapy platforms with human therapists

**Emotion Recognition Tools:**
- Text-based sentiment analysis tools
- Facial expression recognition software
- Voice emotion detection systems

#### Key limitations of the existing system include:

- **High Cost**: Professional therapy sessions are expensive and not covered by all insurance plans
- **Limited Availability**: Therapists have limited availability and long waiting lists
- **Lack of Integration**: Existing tools work in isolation without comprehensive emotional analysis
- **Poor User Experience**: Most applications have outdated interfaces and poor usability
- **No Personalization**: Generic responses that don't adapt to individual user needs
- **Privacy Issues**: Data stored on external servers without proper encryption
- **Single Input Mode**: Limited to either text, voice, or visual input, not multimodal
- **No Real-time Analysis**: Delayed processing and response generation
- **Limited Wellness Support**: Focus on detection without actionable wellness recommendations

### 3.3 Proposed System

Our proposed EmotiAI system addresses the limitations of existing systems by providing:

**Comprehensive Emotion Recognition:**
- Multi-modal emotion detection combining text sentiment and facial expression analysis
- Real-time processing with confidence scoring
- Support for multiple emotion categories (joy, sadness, anger, fear, surprise, disgust, neutral)

**Intelligent Conversational Interface:**
- Context-aware chatbot with emotion-based response generation
- Personalized conversation history and user profiling
- Adaptive learning from user interactions

**Wellness Integration:**
- Automated mood journaling from conversation analysis
- Personalized wellness recommendations based on emotional state
- Evidence-based mental health resources and coping strategies

**Privacy and Security:**
- Local data processing where possible
- Encrypted data transmission and storage
- User-controlled data retention and deletion

#### Objectives of the Proposed System

1. **Primary Objectives:**
   - Provide accurate real-time emotion detection from multiple input modalities
   - Deliver personalized emotional support through intelligent conversation
   - Offer evidence-based wellness recommendations and mental health resources
   - Ensure user privacy and data security throughout the interaction

2. **Secondary Objectives:**
   - Create an intuitive and accessible user interface for all demographics
   - Maintain conversation history for tracking emotional patterns over time
   - Provide analytics and insights for users to understand their emotional trends
   - Support scalable deployment to serve thousands of concurrent users

3. **Long-term Objectives:**
   - Integration with healthcare providers and mental health professionals
   - Multi-language support for global accessibility
   - Advanced AI models for improved emotion recognition accuracy
   - Mobile application development for cross-platform availability

#### Module Identification

The system is divided into the following core modules:

1. **Authentication Module**
   - User registration and login
   - JWT token management
   - Password security and validation

2. **Emotion Detection Module**
   - Text sentiment analysis using DistilBERT
   - Facial expression recognition using Vision Transformer
   - Multi-modal emotion fusion and confidence scoring

3. **Conversation Management Module**
   - Real-time chat interface
   - Message history and persistence
   - Context-aware response generation

4. **Wellness Recommendation Module**
   - Mood journaling and tracking
   - Personalized wellness suggestions
   - Evidence-based mental health resources

5. **User Interface Module**
   - Responsive React-based frontend
   - Real-time emotion visualization
   - Dashboard and analytics display

6. **Data Management Module**
   - SQLite/PostgreSQL database integration
   - Data validation and sanitization
   - Backup and recovery mechanisms

7. **Security Module**
   - Input validation and sanitization
   - HTTPS/TLS encryption
   - CORS and security headers

#### System Requirements

**Hardware Requirements:**
- **Server**: Minimum 4GB RAM, 2 CPU cores, 20GB storage
- **Client**: Any device with web browser support
- **Network**: Stable internet connection (minimum 1 Mbps)

**Software Requirements:**
- **Backend**: Python 3.8+, FastAPI, SQLAlchemy, Transformers
- **Frontend**: Node.js 16+, React 18+, Modern web browser
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI Models**: Hugging Face Transformers library

**Performance Requirements:**
- Response time: < 2 seconds for emotion detection
- Concurrent users: Support for 1000+ simultaneous connections
- Uptime: 99.9% availability with proper error handling
- Scalability: Horizontal scaling capability

#### Design Process and Explanation

**1. Requirements Analysis Phase:**
- Conducted user research to understand emotional support needs
- Analyzed existing systems to identify gaps and opportunities
- Defined functional and non-functional requirements
- Created user personas and use case scenarios

**2. System Architecture Design:**
- Adopted microservices architecture for scalability
- Designed RESTful API with clear separation of concerns
- Implemented component-based frontend architecture
- Planned database schema with proper normalization

**3. AI Model Selection:**
- Evaluated multiple pre-trained models for accuracy and performance
- Selected DistilBERT for text emotion detection (lightweight and accurate)
- Chose Vision Transformer for facial expression recognition
- Implemented confidence scoring and fallback mechanisms

**4. User Interface Design:**
- Created wireframes and mockups for all major screens
- Implemented responsive design for mobile and desktop
- Designed intuitive conversation interface with real-time updates
- Ensured accessibility compliance (WCAG 2.1 AA)

**5. Security Design:**
- Implemented JWT-based authentication with secure token handling
- Designed input validation and sanitization mechanisms
- Planned HTTPS encryption and secure data transmission
- Created privacy-focused data handling procedures

**6. Testing Strategy:**
- Unit testing for individual components and functions
- Integration testing for API endpoints and database operations
- End-to-end testing for complete user workflows
- Performance testing for scalability and response times

**7. Deployment Architecture:**
- Containerized application for consistent deployment
- Implemented CI/CD pipeline for automated testing and deployment
- Designed monitoring and logging for production environments
- Planned backup and disaster recovery procedures

### Functional Requirements
- **User Authentication**: Secure registration and login system with JWT tokens
- **Emotion Detection**: Real-time analysis of text sentiment and facial expressions
- **Conversational AI**: Intelligent chatbot with emotion-aware responses
- **Data Persistence**: Store user conversations, emotion history, and preferences
- **Wellness Integration**: Mood journaling and personalized wellness recommendations
- **Multi-modal Input**: Support for text, image, and webcam input
- **Real-time Updates**: Live emotion detection and response generation

### Non-Functional Requirements
- **Performance**: Response time < 2 seconds for emotion detection
- **Scalability**: Support for 1000+ concurrent users
- **Security**: HTTPS encryption, JWT authentication, input validation
- **Availability**: 99.9% uptime with proper error handling
- **Usability**: Intuitive interface with accessibility compliance
- **Compatibility**: Cross-browser support (Chrome, Firefox, Safari, Edge)
- **Responsiveness**: Mobile-first design for all screen sizes

### System Design Principles
- **Microservices Architecture**: Separation of concerns between frontend and backend
- **RESTful API Design**: Stateless communication with proper HTTP methods
- **Database Normalization**: Efficient data storage with proper relationships
- **Component-Based UI**: Reusable React components with clear separation
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Security by Design**: Input validation, authentication, and authorization

### Technology Stack
- **Backend**: Python 3.8+, FastAPI, SQLAlchemy, SQLite/PostgreSQL
- **Frontend**: React 18+, JavaScript ES6+, HTML5, CSS3, Tailwind CSS
- **AI/ML**: Hugging Face Transformers, DistilBERT, Vision Transformer
- **Authentication**: JWT tokens, bcrypt password hashing
- **Development**: Node.js, npm, Python venv, Git version control

## 🔬 System Methodologies

### MODULE DESCRIPTION

The EmotiAI system is architected using a modular approach, where each module serves a specific purpose and can be developed, tested, and maintained independently. This modular design ensures scalability, maintainability, and code reusability.

#### 1. Authentication Module
**Purpose**: Manages user registration, login, and session management
**Components**:
- User registration with email validation
- Secure login with JWT token generation
- Password hashing using bcrypt
- Token refresh and logout functionality
**Key Files**: `auth.py`, `models.py` (User model)

#### 2. Emotion Detection Module
**Purpose**: Core AI functionality for detecting emotions from text and images
**Components**:
- Text sentiment analysis using DistilBERT transformer
- Facial expression recognition using Vision Transformer
- Multi-modal emotion fusion algorithm
- Confidence scoring and validation
**Key Files**: `emotion_service.py`, AI model integrations

#### 3. Conversation Management Module
**Purpose**: Handles chat functionality and conversation persistence
**Components**:
- Real-time message processing
- Conversation history storage and retrieval
- Context-aware response generation
- Message threading and organization
**Key Files**: `app.py` (chat endpoints), `models.py` (Conversation, Message models)

#### 4. Wellness Recommendation Module
**Purpose**: Provides personalized wellness suggestions based on emotional state
**Components**:
- Mood pattern analysis
- Evidence-based recommendation engine
- Personalized wellness content delivery
- Progress tracking and feedback collection
**Key Files**: `wellness_service.py`, `mood_journal_service.py`

#### 5. User Interface Module
**Purpose**: Frontend components for user interaction
**Components**:
- Responsive React components
- Real-time emotion visualization
- Chat interface with typing indicators
- Dashboard and analytics displays
**Key Files**: React components in `frontend/src/components/`

#### 6. Data Management Module
**Purpose**: Database operations and data persistence
**Components**:
- SQLAlchemy ORM models
- Database migration scripts
- Data validation and sanitization
- Backup and recovery procedures
**Key Files**: `database.py`, `models.py`, migration scripts

#### 7. Security Module
**Purpose**: Ensures application security and data protection
**Components**:
- Input validation and sanitization
- CORS configuration
- Rate limiting and DDoS protection
- Secure file upload handling
**Key Files**: Security middleware, validation schemas

### Tools Used:

#### Backend Development Tools
- **Python 3.8+**: Primary programming language for backend development
- **FastAPI**: Modern, fast web framework for building APIs with automatic documentation
- **SQLAlchemy**: Python SQL toolkit and Object-Relational Mapping (ORM) library
- **Pydantic**: Data validation and settings management using Python type annotations
- **Uvicorn**: Lightning-fast ASGI server implementation for Python
- **JWT (PyJWT)**: JSON Web Token implementation for secure authentication
- **bcrypt**: Password hashing library for secure password storage
- **python-multipart**: For handling file uploads and form data

#### AI/ML Tools
- **Hugging Face Transformers**: State-of-the-art machine learning library for NLP
- **DistilBERT**: Lightweight BERT model for text emotion classification
- **Vision Transformer (ViT)**: Transformer-based model for image classification
- **PyTorch**: Deep learning framework (dependency of Transformers)
- **Pillow (PIL)**: Python Imaging Library for image processing
- **NumPy**: Numerical computing library for array operations

#### Frontend Development Tools
- **React 18+**: JavaScript library for building user interfaces
- **JavaScript ES6+**: Modern JavaScript features and syntax
- **HTML5**: Latest version of HyperText Markup Language
- **CSS3**: Latest version of Cascading Style Sheets
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Axios**: Promise-based HTTP client for API communication
- **React Router**: Declarative routing for React applications
- **React Hot Toast**: Elegant toast notifications for React

#### Database Tools
- **SQLite**: Lightweight database for development and testing
- **PostgreSQL**: Advanced open-source relational database for production
- **Alembic**: Database migration tool for SQLAlchemy
- **DB Browser for SQLite**: Visual tool for SQLite database management

#### Development and Deployment Tools
- **Git**: Version control system for source code management
- **GitHub**: Cloud-based Git repository hosting service
- **Visual Studio Code**: Integrated development environment
- **Postman**: API development and testing tool
- **Docker**: Containerization platform for consistent deployments
- **npm/yarn**: Package managers for Node.js dependencies
- **pip**: Package installer for Python
- **Virtual Environment (venv)**: Python environment isolation tool

#### Testing Tools
- **pytest**: Testing framework for Python applications
- **pytest-asyncio**: Async support for pytest
- **httpx**: Async HTTP client for testing FastAPI applications
- **Jest**: JavaScript testing framework for React components
- **React Testing Library**: Testing utilities for React components

### Process

#### 1. Emotion Detection and Response Generation Process

Our EmotiAI system follows a sophisticated multi-modal emotion detection process that combines text sentiment analysis with facial expression recognition to provide accurate emotional understanding and appropriate responses.

```
User Input → Multi-Modal Analysis → Emotion Fusion → Response Generation → Wellness Recommendations
```

**Step 1: User Input Collection**
- **Text Input**: User types a message in the chat interface
- **Image Input**: Optional webcam capture or image upload for facial expression analysis
- **Input Validation**: System validates and sanitizes all inputs for security

**Step 2: Text Emotion Analysis**
```python
# Text processing using DistilBERT model
text_input = "I'm feeling really stressed about work today"
text_emotions = emotion_service.analyze_text(text_input)
# Output: {'sadness': 0.7, 'anxiety': 0.8, 'neutral': 0.2}
```
- **Preprocessing**: Text is cleaned and tokenized
- **DistilBERT Analysis**: Pre-trained model analyzes sentiment and emotions
- **Confidence Scoring**: Each emotion gets a confidence score (0-1)
- **Primary Emotion**: Highest scoring emotion is selected as primary

**Step 3: Facial Expression Analysis (if image provided)**
```python
# Facial expression analysis using Vision Transformer
image_data = webcam_capture_or_upload()
facial_emotions = emotion_service.analyze_face(image_data)
# Output: {'sadness': 0.6, 'neutral': 0.4, 'surprise': 0.1}
```
- **Face Detection**: System detects faces in the uploaded image
- **Feature Extraction**: Vision Transformer extracts facial features
- **Expression Classification**: Classifies into 7 emotion categories
- **Confidence Assessment**: Provides reliability score for the prediction

**Step 4: Multi-Modal Emotion Fusion**
```python
# Combining text and facial emotion analysis
final_emotion = emotion_service.fuse_emotions(text_emotions, facial_emotions)
# Weighted combination based on confidence scores
# Output: {'primary': 'sadness', 'intensity': 'high', 'confidence': 0.85}
```
- **Weight Assignment**: Text and facial emotions are weighted based on confidence
- **Fusion Algorithm**: Combines both modalities using weighted average
- **Conflict Resolution**: Handles cases where text and facial emotions differ
- **Final Classification**: Determines primary emotion with overall confidence

**Step 5: Context-Aware Response Generation**
```python
# Generate empathetic response based on detected emotion
response = response_generator.generate_response(
    emotion='sadness',
    intensity='high',
    user_context=conversation_history,
    user_preferences=user_profile
)
# Output: Personalized, empathetic response with appropriate tone
```
- **Emotion Mapping**: Maps detected emotion to appropriate response templates
- **Context Integration**: Considers conversation history and user profile
- **Tone Adjustment**: Adjusts response tone based on emotion intensity
- **Personalization**: Customizes response based on user preferences and history

**Step 6: Wellness Recommendation Generation**
```python
# Generate personalized wellness recommendations
recommendations = wellness_service.get_recommendations(
    current_emotion='sadness',
    user_id=user.id,
    emotion_history=mood_patterns
)
# Output: Immediate, short-term, and long-term wellness suggestions
```
- **Pattern Analysis**: Analyzes user's emotional patterns over time
- **Recommendation Matching**: Selects appropriate wellness strategies
- **Personalization**: Adapts recommendations based on user feedback
- **Evidence-Based**: Uses clinically proven wellness techniques

#### 2. Real-Time Chat Processing Flow

```
Message Received → Emotion Detection → Database Storage → Response Generation → UI Update
```

**Implementation in Our System:**
```javascript
// Frontend: Real-time message processing
const sendMessage = async (message, image = null) => {
  // 1. Send message to backend
  const response = await fetch('/api/predict', {
    method: 'POST',
    body: formData // Contains text and optional image
  });
  
  // 2. Receive emotion analysis and response
  const result = await response.json();
  
  // 3. Update UI with emotion indicator
  setCurrentEmotion(result.emotion_analysis);
  
  // 4. Display AI response
  addMessageToChat(result.ai_response);
  
  // 5. Show wellness recommendations
  setWellnessRecommendations(result.recommendations);
};
```

#### 3. Mood Journaling and Analytics Process

```
Conversation Analysis → Mood Extraction → Pattern Recognition → Insights Generation
```

**Automated Mood Tracking:**
```python
# Backend: Automatic mood journaling from conversations
def analyze_conversation_mood(conversation_id):
    messages = get_conversation_messages(conversation_id)
    mood_entries = []
    
    for message in messages:
        if message.emotion_data:
            mood_entry = {
                'timestamp': message.created_at,
                'primary_emotion': message.emotion_data['primary'],
                'intensity': message.emotion_data['intensity'],
                'confidence': message.emotion_data['confidence']
            }
            mood_entries.append(mood_entry)
    
    # Store mood patterns for analytics
    mood_journal_service.save_mood_entries(mood_entries)
    return mood_entries
```

#### 4. Wellness Recommendation Engine Process

```
Emotion Detection → Pattern Analysis → Recommendation Selection → Personalization → Delivery
```

**Smart Recommendation System:**
```python
# Backend: Intelligent wellness recommendation engine
class WellnessRecommendationEngine:
    def get_personalized_recommendations(self, user_id, current_emotion):
        # 1. Analyze user's emotional patterns
        patterns = self.analyze_emotional_patterns(user_id)
        
        # 2. Select base recommendations for current emotion
        base_recommendations = self.get_base_recommendations(current_emotion)
        
        # 3. Personalize based on user history and feedback
        personalized = self.personalize_recommendations(
            base_recommendations, 
            patterns, 
            user_feedback_history
        )
        
        # 4. Categorize by timeframe (immediate, short-term, long-term)
        categorized = self.categorize_by_timeframe(personalized)
        
        return categorized
```

#### 5. User Authentication and Security Process

```
Registration → Email Validation → Password Hashing → JWT Generation → Session Management
```

**Secure Authentication Flow:**
```python
# Backend: Secure user authentication
@app.post("/auth/register")
async def register_user(user_data: UserCreate):
    # 1. Validate input data
    validate_user_input(user_data)
    
    # 2. Check if user already exists
    existing_user = get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # 3. Hash password securely
    hashed_password = bcrypt.hashpw(user_data.password.encode(), bcrypt.gensalt())
    
    # 4. Create user in database
    new_user = create_user(user_data, hashed_password)
    
    # 5. Generate JWT token
    access_token = create_access_token(data={"sub": new_user.username})
    
    return {"access_token": access_token, "token_type": "bearer"}
```

#### 6. Database Operations and Data Management Process

```
Data Input → Validation → Sanitization → Storage → Retrieval → Analytics
```

**Efficient Data Management:**
```python
# Backend: Database operations with SQLAlchemy
class ConversationService:
    def save_conversation_with_emotions(self, user_id, message, emotion_data):
        # 1. Create conversation if not exists
        conversation = self.get_or_create_conversation(user_id)
        
        # 2. Save user message
        user_message = Message(
            conversation_id=conversation.id,
            content=message,
            sender_type="user",
            emotion_data=emotion_data
        )
        
        # 3. Generate and save AI response
        ai_response = self.generate_ai_response(emotion_data)
        ai_message = Message(
            conversation_id=conversation.id,
            content=ai_response,
            sender_type="assistant"
        )
        
        # 4. Update conversation metadata
        conversation.last_activity = datetime.utcnow()
        conversation.message_count += 2
        
        # 5. Commit to database
        db.session.add_all([user_message, ai_message])
        db.session.commit()
        
        return conversation
```

#### 7. Frontend Real-Time Updates Process

```
User Action → API Call → State Update → Component Re-render → UI Refresh
```

**React State Management:**
```javascript
// Frontend: Real-time emotion updates using React hooks
const ChatInterface = () => {
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  // Real-time emotion detection
  const handleMessageSend = async (message, image) => {
    try {
      // 1. Add user message to UI immediately
      setMessages(prev => [...prev, { content: message, sender: 'user' }]);
      
      // 2. Call emotion detection API
      const re

### Importance

#### 1. Business Impact
- **Accessibility**: Makes mental health support accessible to a broader audience
- **Cost-Effectiveness**: Reduces the cost of emotional support compared to traditional therapy
- **Scalability**: Can serve thousands of users simultaneously without human intervention
- **24/7 Availability**: Provides round-the-clock emotional support when needed most
- **Data-Driven Insights**: Generates valuable insights about emotional patterns and trends

#### 2. Technical Significance
- **Innovation**: Combines cutting-edge AI with practical mental health applications
- **Modularity**: Demonstrates best practices in software architecture and design
- **Performance**: Showcases real-time AI processing capabilities
- **Security**: Implements comprehensive security measures for sensitive health data
- **Scalability**: Designed to handle growth from prototype to enterprise-level deployment

#### 3. Social Impact
- **Mental Health Awareness**: Promotes understanding and awareness of emotional well-being
- **Stigma Reduction**: Provides a private, judgment-free environment for emotional expression
- **Early Intervention**: Enables early detection of emotional distress patterns
- **Educational Value**: Teaches users about emotional intelligence and coping strategies
- **Community Building**: Creates a supportive environment for users with similar experiences

#### 4. Research and Development Value
- **AI Model Validation**: Provides real-world testing ground for emotion recognition models
- **Data Collection**: Generates valuable datasets for improving emotion detection accuracy
- **User Behavior Analysis**: Offers insights into how people interact with AI-powered mental health tools
- **Technology Integration**: Demonstrates successful integration of multiple AI technologies
- **Best Practices**: Establishes patterns for future mental health technology development

#### 5. Future Implications
- **Healthcare Integration**: Foundation for integration with electronic health records
- **Preventive Care**: Potential for early intervention in mental health crises
- **Personalized Medicine**: Contributes to personalized mental health treatment approaches
- **Global Health**: Scalable solution for addressing global mental health challenges
- **AI Ethics**: Demonstrates responsible AI development in sensitive healthcare applications

### Development Methodology
- **Agile Development**: Iterative development with continuous integration
- **Test-Driven Development**: Unit tests and integration tests for reliability
- **Component-Driven Development**: Modular frontend components
- **API-First Design**: Backend API designed before frontend implementation
- **Version Control**: Git with feature branches and pull requests

### AI/ML Methodology
- **Pre-trained Models**: Leveraging Hugging Face transformer models
- **Multi-modal Fusion**: Combining text and visual emotion detection
- **Confidence Scoring**: Providing reliability metrics for predictions
- **Model Evaluation**: Continuous monitoring of prediction accuracy
- **Fallback Mechanisms**: Graceful handling of model failures

### Data Management Methodology
- **Data Privacy**: GDPR-compliant data handling and user consent
- **Data Validation**: Pydantic schemas for input/output validation
- **Database Migrations**: Version-controlled schema changes
- **Backup Strategy**: Regular database backups and recovery procedures
- **Data Retention**: Configurable data retention policies

### Security Methodology
- **Defense in Depth**: Multiple layers of security controls
- **Input Sanitization**: Validation and sanitization of all user inputs
- **Authentication & Authorization**: Role-based access control
- **Secure Communication**: HTTPS/TLS encryption for all communications
- **Security Testing**: Regular vulnerability assessments and penetration testing

### Quality Assurance Methodology
- **Code Reviews**: Peer review process for all code changes
- **Automated Testing**: Unit, integration, and end-to-end tests
- **Continuous Integration**: Automated build and test pipelines
- **Performance Monitoring**: Real-time application performance tracking
- **User Acceptance Testing**: Validation with actual users

### Deployment Methodology
- **Infrastructure as Code**: Automated deployment configurations
- **Blue-Green Deployment**: Zero-downtime deployment strategy
- **Environment Parity**: Consistent development, staging, and production environments
- **Monitoring & Logging**: Comprehensive application and infrastructure monitoring
- **Rollback Strategy**: Quick rollback procedures for failed deployments

## 🏗️ Architecture

```
emotion-recognition/
├── backend/                 # FastAPI server
│   ├── app.py              # Main application
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # Authentication logic
│   ├── emotion_service.py  # AI emotion detection
│   ├── wellness_service.py # Wellness recommendations
│   ├── mood_journal_service.py # Mood tracking
│   ├── database.py         # Database configuration
│   ├── config.py           # Application settings
│   └── requirements.txt    # Python dependencies
└── frontend/               # React application
    ├── src/
    │   ├── components/     # React components
    │   ├── contexts/       # React contexts
    │   ├── api/           # API integration
    │   ├── utils/         # Utility functions
    │   └── App.js         # Main app component
    └── package.json       # Node.js dependencies
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd emotion-recognition/backend
   ```

2. **Run the setup script**:
   
   **Windows:**
   ```cmd
   run.bat
   ```
   
   **Linux/Mac:**
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

3. **Manual setup (alternative)**:
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create environment file
   cp .env.example .env
   
   # Start server
   python start.py
   ```

The backend will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd emotion-recognition/frontend
   ```

2. **Run the setup script**:
   
   **Windows:**
   ```cmd
   start.bat
   ```
   
   **Manual setup:**
   ```bash
   # Install dependencies
   npm install
   
   # Start development server
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration (.env)
```env
DATABASE_URL=sqlite:///./emotion_app.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379  # Optional
ENVIRONMENT=development
```

### Environment Variables
- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT signing key (change in production!)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `ENVIRONMENT`: Set to "production" for production deployment

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Conversation Endpoints
- `GET /conversations` - List user conversations
- `POST /conversations` - Create new conversation
- `GET /conversations/{id}` - Get specific conversation
- `DELETE /conversations/{id}` - Delete conversation

### Emotion Detection Endpoints
- `POST /predict` - Predict emotion with conversation saving
- `POST /predict_multimodal` - Legacy endpoint for emotion prediction

### Example API Usage

**Register User:**
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Predict Emotion:**
```bash
curl -X POST "http://localhost:8000/predict_multimodal" \
  -F "text=I'm feeling great today!" \
  -F "image=@photo.jpg"
```

## 🤖 AI Models

### Text Emotion Detection
- **Model**: `bhadresh-savani/distilbert-base-uncased-emotion`
- **Emotions**: sadness, joy, anger, fear, surprise, disgust, neutral
- **Technology**: DistilBERT transformer model

### Facial Emotion Recognition
- **Model**: `trpakov/vit-face-expression`
- **Technology**: Vision Transformer (ViT)
- **Input**: RGB images from webcam

### Emotion Response System
- Contextual responses based on detected emotions
- Empathetic and supportive conversation style
- Example inputs provided for each emotion category

## 🎨 Frontend Features

### Components
- **ChatInterface**: Main chat application
- **Login/Register**: Authentication forms
- **ProtectedRoute**: Route protection wrapper
- **Conversation Management**: Sidebar with chat history

### Styling
- **Styled Components**: CSS-in-JS styling
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, intuitive interface
- **Real-time Updates**: Live emotion detection display

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt password encryption
- **CORS Protection**: Configured for frontend domain
- **Input Validation**: Pydantic schema validation
- **SQL Injection Protection**: SQLAlchemy ORM
- **File Upload Security**: Validated image uploads

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**:
   ```bash
   # Set environment variables
   export ENVIRONMENT=production
   export SECRET_KEY=your-production-secret-key
   export DATABASE_URL=your-production-database-url
   
   # Install production dependencies
   pip install -r requirements.txt
   
   # Run with production server
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

2. **Frontend Deployment**:
   ```bash
   # Build for production
   npm run build
   
   # Serve static files (example with serve)
   npx serve -s build -l 3000
   ```

### Docker Deployment (Optional)

Create `Dockerfile` for backend:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🧪 Testing

### Backend Testing
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Frontend Testing
```bash
# Run React tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Hugging Face**: For providing the emotion detection models
- **FastAPI**: For the excellent web framework
- **React**: For the frontend framework
- **Transformers**: For the AI model integration

## 📞 Support

For support, email kalailoki@gmail.com.com or create an issue in the repository.

---

**Built with ❤️ using FastAPI, React, and AI**