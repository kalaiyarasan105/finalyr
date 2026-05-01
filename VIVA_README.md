# EmotiAI — Viva Presentation Guide

---

## 1. What Problem Are We Solving?

Mental health is one of the most underserved areas in everyday technology. People often struggle with stress, anxiety, sadness, and emotional burnout — but they either don't recognize it in time or don't know where to turn.

Existing chatbots and wellness apps treat everyone the same. They don't actually *understand* how you feel — they just respond to keywords. There's no real-time emotional awareness, no cultural sensitivity, and no personalized support.

**The core problem:**
- People can't always express how they feel in words
- Generic apps give generic advice — not helpful for real emotional states
- There's no system that combines facial expression + text + cultural context to truly understand a person's emotional state and respond meaningfully

---

## 2. What Are We Addressing?

EmotiAI addresses three specific gaps:

1. **Emotional blindness in technology** — Most apps don't know if you're sad, angry, or anxious. They just process text.
2. **Lack of personalized mental wellness support** — Recommendations are one-size-fits-all, not tailored to the individual's emotional history or cultural background.
3. **Cultural disconnect** — Existing systems ignore regional and cultural context. EmotiAI integrates Tamil Siddha remedies, Tamil idioms, and Carnatic music — making it deeply relevant to Tamil-speaking users.

---

## 3. How Are We Solving It?

EmotiAI uses a **multimodal emotion recognition system** — meaning it reads emotion from two sources at the same time:

### Text Analysis
- Uses **DistilBERT** (a transformer-based NLP model from Hugging Face)
- Reads what the user types and classifies the emotion: joy, sadness, anger, fear, surprise, disgust, or neutral
- Returns a confidence score for each emotion

### Facial Expression Analysis
- Uses **ViT (Vision Transformer)** model
- Captures a webcam photo and detects facial emotion in real time
- Returns a confidence score for the detected face emotion

### Multimodal Fusion
- Both results are combined using **weighted average fusion** based on confidence scores
- The final emotion is the most reliable combined result
- Intensity is calculated (high / medium / low / very low) based on confidence thresholds

### Personalized Recommendations
Once the emotion is detected, the system recommends:
- **Siddha Remedies** — Traditional Tamil healing practices
- **Tamil Idioms & Proverbs** — Culturally relevant wisdom
- **Motivational Quotes** — Tamil and general quotes with reflection prompts
- **Music Tracks** — Carnatic ragas and curated music matched to the emotion

Recommendations are ranked using a **hybrid algorithm** combining:
- KNN (K-Nearest Neighbors) for similar user matching
- Cosine Similarity for content relevance
- Thompson Sampling for exploration vs. exploitation balance
- Collaborative + Content-Based Filtering

---

## 4. How Does It Reach the End Customer?

The user journey is simple and intuitive:

1. User opens the web app and logs in
2. They type a message in the chat interface (like talking to a friend)
3. Optionally, they allow webcam access for facial emotion detection
4. The system detects their emotion in real time
5. The AI responds empathetically based on the detected emotion and intensity
6. Personalized wellness recommendations appear — Siddha remedies, music, quotes, idioms
7. The user can rate recommendations, and the system learns from that feedback
8. A mood journal and analytics dashboard track emotional patterns over time

The app is accessible via any modern browser — no installation needed. It works on desktop and mobile.

---

## 5. How Is It Better Than Existing Systems?

| Feature | Existing Apps (e.g., Wysa, Woebot) | EmotiAI |
|---|---|---|
| Emotion detection | Text only | Text + Face (multimodal) |
| Cultural relevance | Generic / Western | Tamil Siddha, idioms, Carnatic music |
| Personalization | Rule-based | ML-driven (KNN + Collaborative Filtering) |
| Real-time tracking | No | Yes (live emotion state updates) |
| Mood journal | Basic | AI-generated insights, trigger analysis |
| Recommendation learning | No | Yes (feedback loop with Thompson Sampling) |
| Analytics | Minimal | Full dashboard with emotion trends, intensity curves |

---

## 6. How Is It Used in the Existing System? (Technical Flow)

Here's exactly what happens when a user sends a message:

```
User types message + optional webcam photo
        ↓
Frontend (React) sends POST /predict
        ↓
Backend (FastAPI) receives text + image
        ↓
EmotionService runs:
  → DistilBERT on text → text_emotion + confidence
  → ViT model on image → face_emotion + confidence
  → Weighted fusion → final_emotion + intensity
        ↓
Bot response generated (context-aware, avoids repetition)
        ↓
WellnessEngine generates recommendations:
  → Siddha remedies, Tamil idioms, quotes, music
  → Ranked by KNN + Cosine Similarity + Thompson Sampling
        ↓
Message + emotion data saved to SQLite database
        ↓
Response returned to frontend with:
  → Bot reply
  → Detected emotion + confidence
  → Wellness recommendations
        ↓
Frontend displays response + recommendations
Color therapy background changes based on emotion
```

---

## 7. What Models and Algorithms Are Used?

**Machine Learning Models:**
- `bhadresh-savani/distilbert-base-uncased-emotion` — Text emotion classification (6 emotions)
- `trpakov/vit-face-expression` — Facial expression recognition via Vision Transformer

**Recommendation Algorithms:**
- K-Nearest Neighbors (KNN) — finds users with similar emotional profiles
- Cosine Similarity — ranks content relevance
- Thompson Sampling — balances showing familiar vs. new recommendations
- Content-Based Filtering — matches recommendations to emotion type
- Collaborative Filtering — learns from what worked for similar users

**Backend Framework:** FastAPI (Python) with SQLAlchemy ORM  
**Frontend Framework:** React 18 with Tailwind CSS and Zustand state management  
**Database:** SQLite (development), PostgreSQL-ready for production  
**Authentication:** JWT tokens with bcrypt password hashing

---

## 8. What Data Does the System Store?

The system stores:
- User accounts (username, email, hashed password — never plain text)
- Conversation history with emotion metadata per message
- Mood journal entries with trigger analysis and coping strategies
- Wellness recommendations and user feedback/ratings
- Emotion color themes, Siddha remedies, Tamil idioms, music tracks

All data is user-isolated — each user can only access their own data.

---

## 9. What Are the Key Features?

- **Multimodal emotion detection** — text + face simultaneously
- **Context-aware bot responses** — avoids repeating the same reply, adapts to emotional history
- **Color therapy** — background color changes dynamically based on detected emotion
- **Mood journal** — auto-generated daily entries with trigger identification
- **Analytics dashboard** — emotion distribution, trends, intensity curves over time
- **Smart prompts** — AI-generated journaling prompts based on recent patterns
- **Feedback loop** — user ratings improve future recommendations
- **Tamil cultural integration** — Siddha medicine, idioms, Carnatic music

---

## 10. What Are the Limitations and Future Scope?

**Current Limitations:**
- Webcam-based face detection requires good lighting
- Siddha and Tamil content is currently limited to a fixed dataset
- SQLite is not suitable for large-scale production deployment
- No real-time streaming (WebSocket) — currently polling-based

**Future Enhancements:**
- Real-time WebSocket emotion streaming
- Fine-tuned models on Indian emotional expression datasets
- OAuth2 / social login
- Mobile app (React Native)
- Multilingual support (Tamil script input)
- Federated learning for privacy-preserving personalization
- Integration with wearables (heart rate, sleep data)

---

## 11. How Do You Run the Project?

**Backend:**
```bash
cd emotion-recognition/backend
pip install -r requirements.txt
python app.py
# Server starts at http://localhost:8000
```

**Frontend:**
```bash
cd emotion-recognition/frontend
npm install
npm start
# App opens at http://localhost:3000
```

**API Documentation:**  
Visit `http://localhost:8000/docs` for the interactive Swagger UI.

---

## 12. Summary

EmotiAI is a culturally-aware, multimodal emotional wellness assistant. It detects how a user feels through both their words and their face, then responds with empathy and provides personalized recommendations rooted in Tamil tradition. Unlike generic mental wellness apps, it learns from user feedback, tracks emotional patterns over time, and adapts its responses to the individual — making it a genuinely intelligent companion for emotional well-being.
