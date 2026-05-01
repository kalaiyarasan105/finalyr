# EmotiAI — Tech Stacks, Algorithms & How It All Works

---

# Part 1: How the Project Works (End to End)

## Step-by-Step Flow

### Step 1 — User Opens the App
The user visits the React web app running on `localhost:3000`. They log in with their credentials. The backend issues a **JWT token** which is stored in the browser and sent with every API request.

---

### Step 2 — User Sends a Message
The user types something in the chat box — for example: *"I'm feeling really stressed about my exams."*

Optionally, they allow webcam access. The app captures a photo of their face at that moment.

Both the text and the image are sent together as a `multipart/form-data` POST request to `/predict` on the FastAPI backend.

---

### Step 3 — Text Emotion Detection
The backend passes the text through the **DistilBERT** model:

```
"I'm feeling really stressed about my exams."
        ↓
DistilBERT tokenizes the sentence into subword tokens
        ↓
Transformer encoder processes the tokens through 6 attention layers
        ↓
Softmax classifier outputs probabilities for 6 emotions:
  joy: 0.03
  sadness: 0.12
  anger: 0.08
  fear: 0.71   ← highest
  surprise: 0.04
  disgust: 0.02
        ↓
Result: text_emotion = "fear", text_confidence = 0.71
```

---

### Step 4 — Face Emotion Detection
The captured webcam image is passed through the **ViT (Vision Transformer)** model:

```
Image (224x224 pixels)
        ↓
Split into 16x16 patches (196 patches total)
        ↓
Each patch is embedded as a vector
        ↓
Transformer encoder processes all patches with self-attention
        ↓
Softmax classifier outputs probabilities for 7 expressions:
  happy: 0.05
  sad: 0.08
  angry: 0.06
  fearful: 0.68   ← highest
  surprised: 0.07
  disgusted: 0.03
  neutral: 0.03
        ↓
Result: face_emotion = "fearful", face_confidence = 0.68
```

---

### Step 5 — Multimodal Fusion
Both results are combined using **weighted average fusion**:

```
text_emotion = "fear"   (confidence: 0.71)
face_emotion = "fear"   (confidence: 0.68)
        ↓
Both agree → final_emotion = "fear"
final_confidence = (0.71 + 0.68) / 2 = 0.695
        ↓
Intensity calculation:
  confidence >= 0.8 → "high"
  confidence >= 0.6 → "medium"   ← 0.695 falls here
  confidence >= 0.4 → "low"
  else             → "very_low"
        ↓
emotion_intensity = "medium"
```

If text and face disagree, the one with higher confidence wins.

---

### Step 6 — Bot Response Generation
The system picks an empathetic response from the emotion library based on:
- Detected emotion (fear)
- Intensity level (medium)
- Conversation history (avoids repeating the last 3 responses)
- Emotional trajectory (e.g., if user was angry before and is now calmer, a different response is chosen)

---

### Step 7 — Wellness Recommendations
Since the emotion is negative (fear), the **WellnessRecommendationEngine** kicks in:

1. Fetches the user's last 20 messages from the past 7 days
2. Analyzes mood patterns (triggers, coping strategies, activity correlations)
3. Generates personalized recommendations from the base library
4. Ranks them using the hybrid recommendation algorithm
5. Returns top 3 recommendations (e.g., grounding technique, breathing exercise, meditation)

---

### Step 8 — Data Saved to Database
The following is saved to SQLite:
- User message with full emotion metadata (text_emotion, face_emotion, final_emotion, confidence, intensity, fusion_method)
- Bot response
- Wellness recommendations linked to the user

---

### Step 9 — Frontend Displays Everything
- Chat bubble with bot response appears
- Emotion badge shows detected emotion + confidence
- Wellness recommendation cards appear below the chat
- Background color changes dynamically (color therapy) based on the emotion
- Mood journal and analytics dashboard update automatically

---

# Part 2: Algorithms Used and Why

## 1. DistilBERT — Text Emotion Classification

**What it does:** Classifies the emotion in a user's typed message.

**Why DistilBERT specifically:**
- It is a distilled (compressed) version of BERT — 40% smaller, 60% faster, but retains 97% of BERT's accuracy
- Pre-trained on massive text corpora, so it understands nuanced language like sarcasm, idioms, and indirect expressions
- The fine-tuned version (`bhadresh-savani/distilbert-base-uncased-emotion`) is specifically trained on emotion classification — not a generic model

**Why not other options:**

| Alternative | Why Not Used |
|---|---|
| LSTM / RNN | Cannot capture long-range dependencies in text; outdated for NLP tasks |
| Naive Bayes | Too simple — relies on word frequency, misses context entirely |
| Full BERT | 2x slower than DistilBERT with minimal accuracy gain for this task |
| GPT-based models | Overkill for classification; much heavier and slower |
| Rule-based keyword matching | Fails on indirect expressions like "I don't know how to go on" |

DistilBERT is the sweet spot — fast enough for real-time inference, accurate enough for production use.

---

## 2. ViT (Vision Transformer) — Facial Emotion Recognition

**What it does:** Analyzes a webcam photo and detects the facial expression.

**Why ViT specifically:**
- Traditional CNNs (like VGG, ResNet) process images locally — they look at small patches and miss global relationships between facial features
- ViT treats an image as a sequence of patches and applies self-attention across all patches simultaneously — it understands how the eyes relate to the mouth, how the forehead relates to the cheeks
- The fine-tuned version (`trpakov/vit-face-expression`) is specifically trained on facial expression datasets

**Why not other options:**

| Alternative | Why Not Used |
|---|---|
| Haar Cascade + SVM | Very old approach, poor accuracy on varied lighting and angles |
| DeepFace | Heavy dependency, slower inference, less accurate on non-Western faces |
| ResNet-50 | Good but CNN-based — misses global facial context that ViT captures |
| OpenCV emotion detection | Rule-based, not ML — very inaccurate |
| MediaPipe | Detects landmarks, not emotions — needs additional classification layer |

ViT gives better accuracy on real-world webcam images because it understands the full face holistically.

---

## 3. Weighted Average Fusion — Multimodal Combination

**What it does:** Combines text emotion and face emotion into one final result.

**How it works:**
- Each modality (text, face) produces an emotion + confidence score
- The final emotion is determined by which modality has higher confidence
- If both agree, confidence is averaged
- If they disagree, the higher-confidence modality wins

**Why weighted average fusion:**
- Simple, interpretable, and fast — no additional model needed
- Confidence scores from both models are already reliable indicators of certainty
- Works well when one modality is missing (e.g., no webcam) — falls back gracefully to the other

**Why not other fusion approaches:**

| Alternative | Why Not Used |
|---|---|
| Simple majority voting | Doesn't account for confidence — a 51% face result would override a 95% text result |
| Learned fusion (neural network) | Requires labeled multimodal training data — overkill for this use case |
| Late fusion with equal weights | Ignores confidence — treats a 0.5 and 0.9 confidence equally |
| Early fusion (concatenate features) | Requires both modalities always present — breaks when webcam is off |

---

## 4. KNN (K-Nearest Neighbors) — User Similarity for Recommendations

**What it does:** Finds users with similar emotional profiles to the current user, then uses their recommendation history to suggest relevant content.

**Why KNN:**
- Emotion-based recommendation is a sparse problem — not every user has rated every recommendation
- KNN works well in sparse spaces by finding the closest neighbors without needing a full matrix
- No training phase needed — it's instance-based, so it adapts as new users join

**Why not other options:**

| Alternative | Why Not Used |
|---|---|
| Matrix Factorization (SVD) | Requires dense interaction matrix — too sparse for a new app |
| Deep learning recommender | Needs massive data to train; overkill for this scale |
| Random recommendations | No personalization — defeats the purpose |
| Rule-based (emotion → fixed list) | Same recommendations for everyone with the same emotion |

---

## 5. Cosine Similarity — Content Relevance Ranking

**What it does:** Measures how similar a recommendation's content is to the user's current emotional context.

**Why cosine similarity:**
- It measures the angle between two vectors, not their magnitude — so it's not affected by the length of text descriptions
- Works perfectly for comparing emotion vectors and content feature vectors
- Computationally cheap — runs in milliseconds

**Why not other options:**

| Alternative | Why Not Used |
|---|---|
| Euclidean distance | Sensitive to magnitude — a longer description would score differently than a short one with the same meaning |
| Pearson correlation | Better for rating data, not feature vectors |
| Jaccard similarity | Works for sets, not continuous feature vectors |

---

## 6. Thompson Sampling — Exploration vs. Exploitation

**What it does:** Decides whether to show the user a recommendation they've liked before (exploitation) or try a new one they haven't seen (exploration).

**Why Thompson Sampling:**
- It's a Multi-Armed Bandit algorithm — perfect for recommendation systems where you want to balance showing proven recommendations vs. discovering new ones
- It uses a Beta distribution to model uncertainty — recommendations with fewer interactions have wider uncertainty, so they get explored more
- It naturally converges over time — as more feedback is collected, it exploits more and explores less

**Why not other options:**

| Alternative | Why Not Used |
|---|---|
| Epsilon-greedy | Explores randomly — wastes time on clearly bad recommendations |
| UCB (Upper Confidence Bound) | Deterministic — less natural for recommendation diversity |
| Pure exploitation | Never tries new recommendations — user gets stuck in a loop |
| Pure exploration | Ignores what works — frustrating for users |

---

## 7. Hybrid Recommendation (Content-Based + Collaborative Filtering)

**What it does:** Combines two recommendation strategies for better results.

- **Content-Based Filtering:** Recommends based on the properties of the content itself (emotion tag, category, duration, difficulty)
- **Collaborative Filtering:** Recommends based on what similar users found helpful

**Why hybrid:**
- Content-based alone suffers from the "filter bubble" — user only sees the same type of content
- Collaborative alone suffers from the "cold start" problem — new users have no history
- Hybrid solves both: content-based handles new users, collaborative improves over time

---

## 8. Intensity Threshold Classification

**What it does:** Converts a raw confidence score (0.0–1.0) into a human-readable intensity level.

```
>= 0.8  → "high"
>= 0.6  → "medium"
>= 0.4  → "low"
< 0.4   → "very_low"
```

**Why threshold-based:**
- Simple, fast, and interpretable
- The bot response library is organized by intensity — this mapping is direct and reliable
- Confidence scores from transformer models are well-calibrated, making thresholds meaningful

---

# Part 3: Tech Stack — What We Used and Why

## Backend

### FastAPI (Python)
**What it is:** A modern, async Python web framework for building APIs.

**Why FastAPI:**
- Async by default — handles multiple requests concurrently without blocking, critical when ML inference takes 200–500ms
- Auto-generates Swagger UI documentation at `/docs` — no extra work needed
- Pydantic integration for automatic request/response validation
- Fastest Python web framework — benchmarks show it's on par with Node.js and Go for I/O-bound tasks

**Why not others:**

| Alternative | Why Not |
|---|---|
| Flask | Synchronous by default — blocks during ML inference; no built-in validation |
| Django | Too heavy — includes ORM, admin, templates we don't need; slower startup |
| Node.js/Express | Python is the standard for ML — would require a separate ML microservice |
| Spring Boot (Java) | Massive overhead; Python ML libraries don't have Java equivalents |

---

### PyTorch
**What it is:** The ML framework used to run DistilBERT and ViT models.

**Why PyTorch:**
- Hugging Face Transformers library is built on PyTorch — the models we use require it
- Dynamic computation graphs — easier to debug than TensorFlow's static graphs
- Industry standard for research and production ML in 2024–2026
- CUDA support for GPU acceleration when available

**Why not TensorFlow:**
- The specific pre-trained models we use (`distilbert-base-uncased-emotion`, `vit-face-expression`) are PyTorch-native on Hugging Face
- TensorFlow has a steeper learning curve for transformer models
- PyTorch has overtaken TensorFlow in adoption for NLP tasks

---

### Hugging Face Transformers
**What it is:** The library that provides pre-trained DistilBERT and ViT models.

**Why Hugging Face:**
- The largest repository of pre-trained models in the world — 500,000+ models
- The specific fine-tuned emotion models we need exist here and nowhere else
- `pipeline()` API makes inference a 3-line operation
- Active community, regular updates, production-tested

**Why not training from scratch:**
- Training DistilBERT from scratch requires millions of labeled samples and weeks of GPU time
- Fine-tuned models on Hugging Face already achieve 93%+ accuracy on emotion datasets
- Using pre-trained models is the industry standard approach

---

### SQLAlchemy + SQLite
**What it is:** SQLAlchemy is the ORM (Object Relational Mapper). SQLite is the database.

**Why SQLAlchemy:**
- Prevents SQL injection by default — all queries are parameterized
- Database-agnostic — switching from SQLite to PostgreSQL for production requires changing one line
- Relationship management (User → Conversations → Messages) is handled automatically

**Why SQLite for development:**
- Zero configuration — no server to install or manage
- Single file database — easy to reset, backup, and share
- Sufficient for development and small-scale deployment

**Why not MongoDB:**
- Our data is highly relational (users → conversations → messages → emotions)
- Relational databases handle joins and foreign keys far better than document stores
- Emotion analytics queries (aggregations, time-series) are more natural in SQL

---

### JWT (JSON Web Tokens) + bcrypt
**What it is:** Authentication system.

**Why JWT:**
- Stateless — the server doesn't need to store session data; the token itself contains the user identity
- Works perfectly for React SPA + FastAPI API architecture
- Standard for REST API authentication

**Why bcrypt for passwords:**
- Intentionally slow hashing algorithm — makes brute-force attacks computationally expensive
- Includes salt automatically — prevents rainbow table attacks
- Industry standard for password storage

---

### Uvicorn (ASGI Server)
**What it is:** The server that runs the FastAPI application.

**Why Uvicorn:**
- ASGI (Asynchronous Server Gateway Interface) — required for FastAPI's async capabilities
- Extremely fast — one of the fastest Python servers available
- Supports hot reload in development

**Why not Gunicorn alone:**
- Gunicorn is WSGI (synchronous) — it can't handle FastAPI's async routes properly
- In production, Gunicorn is used as a process manager with Uvicorn workers — best of both worlds

---

## Frontend

### React 18
**What it is:** The JavaScript UI library.

**Why React:**
- Component-based architecture — each UI piece (chat bubble, emotion badge, recommendation card) is an isolated, reusable component
- Virtual DOM — only re-renders what changed, keeping the UI fast even with real-time emotion updates
- Largest ecosystem of any frontend framework — every library we need exists

**Why not others:**

| Alternative | Why Not |
|---|---|
| Vue.js | Smaller ecosystem; fewer UI component libraries available |
| Angular | Too opinionated and heavy for a single-page chat app |
| Vanilla JS | No component reuse; managing state manually would be a nightmare |
| Next.js | Server-side rendering is unnecessary for a real-time chat app behind auth |

---

### Zustand (State Management)
**What it is:** A lightweight state management library for React.

**Why Zustand:**
- Minimal boilerplate — a store is just a function, not 5 files of Redux boilerplate
- Works outside React components — can be called from API functions directly
- Tiny bundle size (1.1kb) vs Redux (7kb+)
- Handles the recommendation store, auth state, and emotion state cleanly

**Why not Redux:**
- Redux requires actions, reducers, selectors, middleware — massive overhead for a project this size
- Zustand achieves the same result in 10 lines vs Redux's 50+
- Redux Toolkit helps but still adds unnecessary complexity

---

### Tailwind CSS
**What it is:** A utility-first CSS framework.

**Why Tailwind:**
- No context switching between JS and CSS files — styles are written inline as class names
- Consistent design system out of the box — spacing, colors, typography are all standardized
- Purges unused CSS in production — tiny final bundle size
- Perfect for rapid UI development

**Why not Bootstrap:**
- Bootstrap components look generic and are hard to customize without overriding styles
- Tailwind gives full control over every pixel
- Bootstrap's JavaScript components conflict with React's DOM management

---

### Axios
**What it is:** HTTP client for making API requests from React to FastAPI.

**Why Axios:**
- Automatic JSON serialization/deserialization
- Request/response interceptors — JWT token is automatically attached to every request in one place
- Better error handling than native `fetch` — automatically throws on 4xx/5xx responses
- Supports `multipart/form-data` for sending text + image together in one request

**Why not fetch:**
- `fetch` doesn't throw on HTTP errors — you have to manually check `response.ok`
- No interceptors — you'd have to add the auth token to every single request manually
- No automatic JSON parsing

---

### Framer Motion
**What it is:** Animation library for React.

**Why Framer Motion:**
- Declarative animations — `animate={{ opacity: 1 }}` is all you need
- Spring physics — animations feel natural, not mechanical
- Used for chat bubble entrance animations, recommendation card transitions, and emotion badge updates

---

### React Webcam
**What it is:** Library for accessing the webcam in React.

**Why React Webcam:**
- Wraps the browser's `getUserMedia` API in a React component
- Provides `getScreenshot()` to capture a frame as base64 — directly usable for the API call
- Handles browser permissions gracefully

---

### Howler.js
**What it is:** Audio library for playing music recommendations.

**Why Howler:**
- Cross-browser audio support — handles codec differences automatically
- Supports streaming audio, volume control, and playback events
- Used for playing Carnatic music track previews in the recommendation cards

---

## Summary Table

| Layer | Technology | Key Reason |
|---|---|---|
| Frontend Framework | React 18 | Component model, virtual DOM, ecosystem |
| State Management | Zustand | Zero boilerplate, tiny size |
| Styling | Tailwind CSS | Utility-first, no CSS files needed |
| HTTP Client | Axios | Interceptors, auto JSON, multipart support |
| Animations | Framer Motion | Declarative, spring physics |
| Audio | Howler.js | Cross-browser, streaming support |
| Backend Framework | FastAPI | Async, auto-docs, Pydantic validation |
| ML Framework | PyTorch | Required by Hugging Face models |
| Model Hub | Hugging Face Transformers | Pre-trained emotion models |
| Text Emotion Model | DistilBERT | Fast, accurate, fine-tuned for emotion |
| Face Emotion Model | ViT | Global attention, better than CNN for faces |
| ORM | SQLAlchemy | SQL injection prevention, DB-agnostic |
| Database | SQLite | Zero config, file-based, dev-friendly |
| Auth | JWT + bcrypt | Stateless, secure, industry standard |
| Server | Uvicorn | ASGI, async-compatible, fast |
| Recommendation | KNN + Cosine + Thompson Sampling | Handles cold start, personalization, exploration |
| Fusion | Weighted Average | Simple, confidence-aware, modality-agnostic |
