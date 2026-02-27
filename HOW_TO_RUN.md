# 🚀 How to Run the Emotion Recognition Application

## Quick Start Guide

### Prerequisites
- Python 3.8+ installed
- Node.js 14+ and npm installed
- Backend virtual environment activated (if using venv)

---

## 🔧 Backend Setup & Run

### Option 1: Using start.py (Recommended)
```bash
# Navigate to backend directory
cd backend

# Run the server
python start.py
```

### Option 2: Using uvicorn directly
```bash
# Navigate to backend directory
cd backend

# Run with uvicorn
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Option 3: Using run.bat (Windows)
```bash
# Navigate to backend directory
cd backend

# Run the batch file
run.bat
```

### Backend will start at:
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Expected Output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 🎨 Frontend Setup & Run

### Option 1: Development Mode (Recommended)
```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm start
```

### Option 2: Build and Serve Production
```bash
# Navigate to frontend directory
cd frontend

# Build for production
npm run build

# Serve the build (install serve if needed)
npm install -g serve
serve -s build
```

### Frontend will start at:
- **Development**: http://localhost:3000
- **Production**: http://localhost:3000 (or port shown by serve)

### Expected Output:
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

---

## 📋 Complete Startup Sequence

### Step 1: Start Backend
```bash
# Terminal 1 - Backend
cd backend
python start.py
```

Wait for: `Application startup complete.`

### Step 2: Start Frontend
```bash
# Terminal 2 - Frontend (new terminal window)
cd frontend
npm start
```

Wait for: `Compiled successfully!`

### Step 3: Access Application
Open your browser and go to: **http://localhost:3000**

---

## 🔍 Verification Checklist

### Backend Health Check
```bash
# Test if backend is running
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","version":"2.0.0"}
```

### Frontend Check
- Browser should automatically open to http://localhost:3000
- You should see the login/register page
- No console errors in browser DevTools

### API Endpoints Check
Visit: http://localhost:8000/docs
- You should see Swagger UI with all endpoints
- Look for the new recommendation endpoints:
  - GET `/api/recommendations/categories`
  - GET `/api/recommendations/{emotion}/{category}`
  - GET `/api/recommendations/color-theme/{emotion}`
  - POST `/api/recommendations/feedback`

---

## 🧪 Testing the Recommendation System

### 1. Register/Login
- Go to http://localhost:3000
- Register a new account or login

### 2. Start a Conversation
- Click "New Conversation"
- Enable camera if you want facial emotion detection

### 3. Trigger Recommendations
Send a message expressing a negative emotion:
- **For Sadness**: "I'm feeling really sad today"
- **For Anger**: "I'm so angry right now"
- **For Fear**: "I'm scared and anxious"
- **For Disgust**: "This makes me feel disgusted"

### 4. Interact with Recommendations
- Modal should appear with 5 category options
- Click any category (Siddha, Idioms, Quotes, Music, All)
- View recommendations
- Try the feedback buttons (👍/👎)
- Notice the background color changes

---

## 🛠️ Troubleshooting

### Backend Issues

#### Port 8000 already in use
```bash
# Windows - Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use a different port
uvicorn app:app --reload --port 8001
```

#### Module not found errors
```bash
# Make sure you're in backend directory
cd backend

# Install requirements
pip install -r requirements.txt
```

#### Database errors
```bash
# Re-run migrations
python migrate_database.py
python migrate_wellness_mood.py
python migrate_recommendations.py
```

### Frontend Issues

#### Port 3000 already in use
```bash
# The app will ask if you want to use another port
# Press 'Y' to use port 3001

# Or manually specify port (Windows)
set PORT=3001 && npm start
```

#### Module not found errors
```bash
# Make sure you're in frontend directory
cd frontend

# Reinstall dependencies
npm install
```

#### Build errors
```bash
# Clear cache and rebuild
npm run build
```

#### CORS errors in browser
- Make sure backend is running on port 8000
- Check that frontend .env has: `REACT_APP_API_URL=http://localhost:8000`

---

## 📁 Project Structure

```
emotion-recognition/
├── backend/
│   ├── app.py                    ← Main application (USE THIS)
│   ├── start.py                  ← Startup script
│   ├── requirements.txt          ← Python dependencies
│   ├── emotion_app.db            ← SQLite database
│   └── ...
└── frontend/
    ├── package.json              ← Node dependencies
    ├── src/
    │   ├── components/           ← React components
    │   ├── store/                ← State management
    │   └── hooks/                ← Custom hooks
    └── ...
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./emotion_app.db
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 📊 Default Ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8000 | http://localhost:8000 |
| Frontend Dev | 3000 | http://localhost:3000 |
| API Docs | 8000 | http://localhost:8000/docs |

---

## 🎯 Quick Commands Reference

### Backend
```bash
# Start server
python start.py

# Or with uvicorn
uvicorn app:app --reload

# Run migrations
python migrate_recommendations.py

# Check Python syntax
python -m py_compile app.py
```

### Frontend
```bash
# Install dependencies
npm install

# Start development
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## ✅ Success Indicators

### Backend Running Successfully
- ✅ No error messages in terminal
- ✅ "Application startup complete" message
- ✅ http://localhost:8000/health returns `{"status":"healthy"}`
- ✅ http://localhost:8000/docs shows Swagger UI

### Frontend Running Successfully
- ✅ "Compiled successfully!" message
- ✅ Browser opens automatically
- ✅ Login page loads without errors
- ✅ No red errors in browser console

### Recommendation System Working
- ✅ Negative emotion triggers modal
- ✅ Category cards display with animations
- ✅ Recommendations load from API
- ✅ Background color changes
- ✅ Feedback buttons work

---

## 🆘 Need Help?

### Check Logs
- **Backend**: Look at terminal where `python start.py` is running
- **Frontend**: Look at terminal where `npm start` is running
- **Browser**: Open DevTools (F12) → Console tab

### Common Issues
1. **"Connection refused"** → Backend not running
2. **"CORS error"** → Backend not on port 8000 or frontend .env wrong
3. **"404 Not Found"** → Wrong URL or endpoint doesn't exist
4. **White screen** → Check browser console for errors

---

## 🎉 You're Ready!

Once both servers are running:
1. Go to http://localhost:3000
2. Register/Login
3. Start chatting
4. Express a negative emotion
5. Enjoy the recommendations! 🌟
