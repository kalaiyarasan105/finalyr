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

## 🏗️ Architecture

```
emotion-recognition/
├── backend/                 # FastAPI server
│   ├── app.py              # Main application
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # Authentication logic
│   ├── emotion_service.py  # AI emotion detection
│   ├── database.py         # Database configuration
│   ├── config.py           # Application settings
│   └── requirements.txt    # Python dependencies
└── frontend/               # React application
    ├── src/
    │   ├── components/     # React components
    │   ├── contexts/       # React contexts
    │   ├── api/           # API integration
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

For support, email support@example.com or create an issue in the repository.

---

**Built with ❤️ using FastAPI, React, and AI**