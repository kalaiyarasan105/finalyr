import torch
import random
import io
from PIL import Image
from transformers import (
    pipeline,
    AutoFeatureExtractor,
    AutoModelForImageClassification,
    AutoTokenizer,
    AutoModelForSequenceClassification
)
from typing import Optional, Tuple, Dict, List

class EmotionService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_models()
        self._load_emotion_library()
        # Context tracking for better responses
        self.conversation_context = {}  # conversation_id -> context data
        self.recent_responses = {}  # conversation_id -> list of recent responses
        print(f"✅ EmotionService initialized on {self.device}")
    
    def get_contextual_response(self, emotion: str, intensity: str, conversation_id: Optional[int] = None) -> str:
        """Generate context-aware empathetic response based on emotion, intensity, and conversation history"""
        if emotion not in self.emotion_library:
            emotion = "neutral"
        
        # Get base responses for emotion and intensity
        responses = self.emotion_library[emotion]["responses"].get(intensity, 
                    self.emotion_library[emotion]["responses"]["medium"])
        
        # If no conversation context, return random response
        if not conversation_id:
            return random.choice(responses)
        
        # Get conversation context
        context = self.conversation_context.get(conversation_id, {})
        recent_responses = self.recent_responses.get(conversation_id, [])
        
        # Apply context-aware filtering
        filtered_responses = self._filter_responses_by_context(responses, context, recent_responses, emotion, intensity)
        
        # Select best response
        selected_response = self._select_best_response(filtered_responses, context, emotion, intensity)
        
        # Update context and response history
        self._update_conversation_context(conversation_id, emotion, intensity, selected_response)
        
        return selected_response
    
    def _filter_responses_by_context(self, responses: List[str], context: Dict, 
                                   recent_responses: List[str], emotion: str, intensity: str) -> List[str]:
        """Filter responses based on conversation context to avoid repetition"""
        
        # Remove recently used responses (last 3 responses)
        recent_set = set(recent_responses[-3:])
        available_responses = [r for r in responses if r not in recent_set]
        
        # If all responses were recent, use all but the most recent
        if not available_responses:
            available_responses = [r for r in responses if r != recent_responses[-1]] if recent_responses else responses
        
        # Context-based filtering
        emotion_history = context.get('emotion_history', [])
        
        # If user has been consistently sad, add more supportive responses
        if emotion == 'sadness' and self._count_recent_emotion(emotion_history, 'sadness') >= 2:
            supportive_responses = self._get_supportive_responses(emotion, intensity)
            available_responses.extend(supportive_responses)
        
        # If user was angry and now calmer, add acknowledgment responses
        if (emotion in ['neutral', 'sadness'] and 
            len(emotion_history) > 0 and emotion_history[-1] == 'anger'):
            calming_responses = self._get_calming_responses(emotion, intensity)
            available_responses.extend(calming_responses)
        
        # If user shows joy after sadness, add celebration responses
        if (emotion == 'joy' and 
            len(emotion_history) > 0 and emotion_history[-1] in ['sadness', 'fear']):
            celebration_responses = self._get_celebration_responses(intensity)
            available_responses.extend(celebration_responses)
        
        return available_responses if available_responses else responses
    
    def _select_best_response(self, responses: List[str], context: Dict, emotion: str, intensity: str) -> str:
        """Select the most appropriate response based on context"""
        
        # If user is new (no context), prefer welcoming responses
        if not context.get('message_count', 0):
            welcoming_responses = [r for r in responses if any(word in r.lower() 
                                 for word in ['welcome', 'nice', 'glad', 'here'])]
            if welcoming_responses:
                return random.choice(welcoming_responses)
        
        # For high intensity emotions, prefer longer, more detailed responses
        if intensity == 'high':
            detailed_responses = [r for r in responses if len(r) > 100]
            if detailed_responses:
                return random.choice(detailed_responses)
        
        # For low intensity, prefer shorter responses
        if intensity in ['low', 'very_low']:
            brief_responses = [r for r in responses if len(r) < 80]
            if brief_responses:
                return random.choice(brief_responses)
        
        # Default: random selection
        return random.choice(responses)
    
    def _update_conversation_context(self, conversation_id: int, emotion: str, 
                                   intensity: str, response: str):
        """Update conversation context with new interaction"""
        
        if conversation_id not in self.conversation_context:
            self.conversation_context[conversation_id] = {
                'emotion_history': [],
                'intensity_history': [],
                'message_count': 0,
                'dominant_emotion': None,
                'last_emotion_change': None
            }
        
        if conversation_id not in self.recent_responses:
            self.recent_responses[conversation_id] = []
        
        context = self.conversation_context[conversation_id]
        
        # Update emotion history (keep last 10)
        context['emotion_history'].append(emotion)
        context['emotion_history'] = context['emotion_history'][-10:]
        
        # Update intensity history
        context['intensity_history'].append(intensity)
        context['intensity_history'] = context['intensity_history'][-10:]
        
        # Update message count
        context['message_count'] += 1
        
        # Update dominant emotion
        context['dominant_emotion'] = self._calculate_dominant_emotion(context['emotion_history'])
        
        # Track emotion changes
        if len(context['emotion_history']) > 1 and context['emotion_history'][-1] != context['emotion_history'][-2]:
            context['last_emotion_change'] = len(context['emotion_history']) - 1
        
        # Update recent responses (keep last 5)
        self.recent_responses[conversation_id].append(response)
        self.recent_responses[conversation_id] = self.recent_responses[conversation_id][-5:]
    
    def _count_recent_emotion(self, emotion_history: List[str], target_emotion: str, window: int = 3) -> int:
        """Count occurrences of an emotion in recent history"""
        recent_emotions = emotion_history[-window:]
        return recent_emotions.count(target_emotion)
    
    def _calculate_dominant_emotion(self, emotion_history: List[str]) -> str:
        """Calculate the most frequent emotion in conversation"""
        if not emotion_history:
            return "neutral"
        
        emotion_counts = {}
        for emotion in emotion_history:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        return max(emotion_counts, key=emotion_counts.get)
    
    def _get_supportive_responses(self, emotion: str, intensity: str) -> List[str]:
        """Get additional supportive responses for persistent sadness"""
        supportive_responses = {
            "high": [
                "I've noticed you've been going through a really difficult time. Please know that your feelings are completely valid, and it's okay to take things one moment at a time. You don't have to face this alone.",
                "It seems like you're carrying a heavy emotional burden right now. I want you to know that reaching out and sharing these feelings takes courage. You're stronger than you might feel in this moment."
            ],
            "medium": [
                "I can see this has been weighing on you for a while. It's important to acknowledge these ongoing feelings rather than dismiss them.",
                "You've been dealing with some challenging emotions lately. Remember that it's okay to feel this way, and healing isn't always linear."
            ],
            "low": [
                "I notice there's been a consistent undercurrent of sadness in our conversations. These feelings are valid and worth addressing.",
                "It seems like there might be something that's been quietly bothering you. Sometimes talking about persistent feelings can help."
            ]
        }
        return supportive_responses.get(intensity, supportive_responses["medium"])
    
    def _get_calming_responses(self, emotion: str, intensity: str) -> List[str]:
        """Get responses for when user has calmed down from anger"""
        return [
            "I'm glad to sense that you're feeling a bit calmer now. It takes strength to work through intense emotions like anger.",
            "It seems like you've been able to process some of those difficult feelings. That's really positive progress.",
            "I can feel that the intensity of your earlier frustration has settled somewhat. How are you feeling now?"
        ]
    
    def _get_celebration_responses(self, intensity: str) -> List[str]:
        """Get responses for when user shows joy after difficult emotions"""
        celebration_responses = {
            "high": [
                "What a wonderful shift in your emotional energy! It's beautiful to see you experiencing joy after going through some difficult feelings. This kind of emotional resilience is truly remarkable!",
                "I'm so happy to witness this positive change in your mood! After the challenges you've been facing, this joy feels especially meaningful and well-deserved."
            ],
            "medium": [
                "It's really heartening to see this positive shift in how you're feeling. Joy after difficulty can feel especially sweet.",
                "I'm so glad to hear this happier tone in your words. It's wonderful when we can find moments of joy even after tough times."
            ],
            "low": [
                "I'm pleased to notice this lighter feeling in your words. Even small shifts toward positivity are worth celebrating.",
                "It's nice to sense this gentle upturn in your mood. These positive moments are important to acknowledge."
            ]
        }
        return celebration_responses.get(intensity, celebration_responses["medium"])
    
    def _load_models(self):
        """Load text and face emotion recognition models"""
        # Text emotion model
        TEXT_MODEL = "bhadresh-savani/distilbert-base-uncased-emotion"
        self.text_tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL)
        self.text_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL)
        self.text_pipeline = pipeline(
            "text-classification", 
            model=self.text_model, 
            tokenizer=self.text_tokenizer, 
            top_k=None
        )
        
        # Face emotion model
        FER_MODEL = "trpakov/vit-face-expression"
        self.face_extractor = AutoFeatureExtractor.from_pretrained(FER_MODEL)
        self.face_model = AutoModelForImageClassification.from_pretrained(FER_MODEL)
        
        # Move models to device
        self.face_model.to(self.device)
        self.text_model.to(self.device)
    
    def _calculate_emotion_intensity(self, confidence: float) -> str:
        """Calculate emotion intensity based on confidence score"""
        if confidence >= 0.8:
            return "high"
        elif confidence >= 0.6:
            return "medium"
        elif confidence >= 0.4:
            return "low"
        else:
            return "very_low"
    
    def _load_emotion_library(self):
        """Load emotion examples and responses with intensity levels"""
        self.emotion_library = {
            "sadness": {
                "examples": [
                    "I feel so lonely today.",
                    "Why does everything go wrong in my life?",
                    "I miss my friends, nothing feels the same anymore."
                ],
                "responses": {
                    "high": [
                        "I can really sense the deep sadness you're feeling right now. This seems like a particularly difficult moment for you. Remember, even in the darkest times, you have inner strength that can carry you through. Would you like to talk about what's weighing so heavily on your heart?",
                        "Your pain feels very real and intense right now. It's completely okay to feel this deeply - it shows how much you care. You don't have to carry this burden alone. I'm here to listen, and there are people who want to support you through this.",
                    ],
                    "medium": [
                        "I can sense you're feeling sad right now. These feelings are valid and it's okay to experience them. Sometimes talking about what's bothering you can help lighten the load a little.",
                        "It sounds like you're going through a tough time. Sadness is a natural part of life, and it's important to acknowledge these feelings rather than push them away.",
                    ],
                    "low": [
                        "I notice you might be feeling a bit down. That's completely normal - we all have those moments. Is there anything specific that's been on your mind?",
                        "You seem a little sad today. Sometimes just acknowledging these feelings can be the first step toward feeling better.",
                    ],
                    "very_low": [
                        "I sense there might be a touch of sadness in what you're sharing. These subtle feelings are important too.",
                        "There seems to be a gentle melancholy in your words. Even small feelings deserve attention.",
                    ]
                }
            },
            "joy": {
                "examples": [
                    "I just got selected for an internship!",
                    "Today was such a beautiful day, I'm feeling great.",
                    "I love spending time with my family, it makes me so happy!"
                ],
                "responses": {
                    "high": [
                        "Wow! Your excitement is absolutely contagious! 🎉 This level of joy is wonderful to witness - you're practically glowing with happiness! Whatever brought this on must be truly special. I'm so thrilled to share in this amazing moment with you!",
                        "Your happiness is radiating through every word! This is the kind of pure, unbridled joy that makes life beautiful. I can feel how genuinely ecstatic you are, and it's bringing a smile to my face too! Tell me more about this incredible feeling!",
                    ],
                    "medium": [
                        "I can hear the genuine happiness in your words! 😊 It's wonderful to see you in such good spirits. There's something really uplifting about your positive energy right now.",
                        "You sound really happy, and that's fantastic! Your joy is quite evident and it's lovely to experience. What's been bringing you this happiness?",
                    ],
                    "low": [
                        "I can sense some happiness in what you're sharing. It's nice to hear a positive note in your voice today.",
                        "There's a gentle contentment in your words that's quite pleasant. Small joys can be just as meaningful.",
                    ],
                    "very_low": [
                        "I detect a hint of positivity in your message. Even subtle happiness is worth celebrating.",
                        "There's a quiet satisfaction in what you're saying that's quite nice to hear.",
                    ]
                }
            },
            "anger": {
                "examples": [
                    "I'm really frustrated with my exam results.",
                    "Why can't people just respect my opinion?",
                    "I hate it when things don't go my way."
                ],
                "responses": {
                    "high": [
                        "I can feel the intense frustration and anger you're experiencing right now. These feelings are completely valid - something has clearly pushed you to your limit. Take a deep breath with me. Your anger is telling you that something important to you has been threatened or violated. Let's work through this together.",
                        "Your anger is very real and very intense right now. I understand that you're feeling overwhelmed by frustration. It's okay to feel this way - anger often comes from caring deeply about something. Let's find a way to channel this energy constructively.",
                    ],
                    "medium": [
                        "I can tell you're feeling quite frustrated and angry about this situation. These feelings make complete sense given what you're dealing with. Anger can be a signal that something needs to change.",
                        "Your frustration is coming through clearly, and I understand why you'd feel this way. It's important to acknowledge these feelings rather than suppress them.",
                    ],
                    "low": [
                        "I sense some frustration in what you're sharing. It sounds like something has been bothering you, which is completely understandable.",
                        "There seems to be a bit of irritation in your words. Sometimes these smaller frustrations can build up over time.",
                    ],
                    "very_low": [
                        "I detect a slight edge of frustration in your message. Even minor irritations are worth acknowledging.",
                        "There's a hint of annoyance in what you're saying. These feelings are valid too.",
                    ]
                }
            },
            "fear": {
                "examples": [
                    "I'm scared about my upcoming interview.",
                    "What if I fail in my exams?",
                    "I'm worried that I won't be good enough."
                ],
                "responses": {
                    "high": [
                        "I can sense the deep fear and anxiety you're experiencing right now. This level of worry can feel overwhelming and paralyzing. Please know that you're not alone in this - fear is our mind's way of trying to protect us, even when it feels excessive. Let's take this one step at a time and find ways to manage these intense feelings.",
                        "Your fear feels very intense and consuming right now. I understand how frightening this must be for you. These overwhelming feelings of anxiety are more common than you might think, and there are ways to work through them. You have more strength than you realize.",
                    ],
                    "medium": [
                        "I can tell you're feeling quite worried and anxious about this. Fear can be really challenging to deal with, but it's also completely normal. Your concerns are valid, and it's okay to feel this way.",
                        "There's a clear sense of anxiety in what you're sharing. These fears are understandable given the situation you're facing. Remember that feeling afraid doesn't mean you can't handle what's ahead.",
                    ],
                    "low": [
                        "I sense some worry in your words. It's natural to feel a bit anxious about uncertain situations. These concerns show that you care about the outcome.",
                        "There seems to be some underlying anxiety in what you're sharing. A little nervousness is completely normal and often shows we care about doing well.",
                    ],
                    "very_low": [
                        "I detect a subtle undercurrent of concern in your message. Even small worries deserve acknowledgment.",
                        "There's a gentle nervousness in your words that's quite understandable given the circumstances.",
                    ]
                }
            },
            "surprise": {
                "examples": [
                    "Oh wow, I wasn't expecting that message!",
                    "I just found out my friend is moving abroad.",
                    "You won't believe what happened today!"
                ],
                "responses": {
                    "high": [
                        "Wow! You seem absolutely stunned by whatever just happened! That must have been quite a shock to your system. I can practically feel the surprise radiating from your words - it sounds like something completely unexpected just turned your world upside down!",
                        "You sound completely taken aback! That level of surprise suggests something truly unexpected just occurred. I'm curious about what could have caught you so off guard - it must be quite significant!",
                    ],
                    "medium": [
                        "I can tell something unexpected just happened! You sound genuinely surprised by whatever occurred. It's always interesting when life throws us these curveballs.",
                        "There's a clear sense of surprise in your words. Something clearly caught you off guard, which can be both exciting and unsettling at the same time.",
                    ],
                    "low": [
                        "I sense a bit of surprise in what you're sharing. Something seems to have been a little unexpected for you.",
                        "There's a gentle surprise in your words - something seems to have been different than you anticipated.",
                    ],
                    "very_low": [
                        "I detect a subtle note of surprise in your message. Even small unexpected moments can be noteworthy.",
                        "There's a hint of the unexpected in what you're saying, which can be quite interesting.",
                    ]
                }
            },
            "disgust": {
                "examples": [
                    "That food tasted awful.",
                    "I hate how people lie to get ahead.",
                    "Ugh, this place smells terrible."
                ],
                "responses": {
                    "high": [
                        "I can sense your strong revulsion and disgust about this situation. Something has clearly violated your values or standards in a significant way. These intense feelings of disgust often arise when we encounter something that goes against our core beliefs or sense of what's right.",
                        "Your disgust is very apparent and completely understandable. When something deeply offends our sensibilities, it can create this powerful feeling of revulsion. Your reaction shows you have strong principles and standards.",
                    ],
                    "medium": [
                        "I can tell something has really bothered you and created a sense of disgust. These feelings often arise when we encounter something that conflicts with our values or expectations.",
                        "There's a clear sense of distaste in what you're sharing. It sounds like something has really rubbed you the wrong way, which is completely valid.",
                    ],
                    "low": [
                        "I sense some distaste or mild disgust in your words. Something seems to have been off-putting or unpleasant for you.",
                        "There appears to be something that's bothering you or creating a sense of unease. These reactions are completely normal.",
                    ],
                    "very_low": [
                        "I detect a subtle sense of distaste in your message. Even minor things that bother us are worth acknowledging.",
                        "There's a gentle sense of something being 'off' in what you're sharing, which is quite understandable.",
                    ]
                }
            },
            "neutral": {
                "examples": [
                    "What is AI?",
                    "Can you explain Python basics?",
                    "Tell me something interesting."
                ],
                "responses": {
                    "high": [
                        "I appreciate your balanced and thoughtful approach to our conversation. There's something refreshing about this calm, centered energy you're bringing.",
                        "Your measured and composed demeanor creates a nice foundation for our discussion. I'm here and ready to engage with whatever you'd like to explore.",
                    ],
                    "medium": [
                        "I sense a calm, steady energy in our conversation. You seem quite centered and balanced right now, which is lovely.",
                        "There's a pleasant equilibrium in your communication style. I'm here and listening, ready for whatever direction you'd like to take our chat.",
                    ],
                    "low": [
                        "You seem fairly neutral and composed at the moment. I'm here and ready to engage with whatever you'd like to discuss.",
                        "I sense a calm, steady presence in your words. What would you like to explore together?",
                    ],
                    "very_low": [
                        "I'm here and listening. What's on your mind today?",
                        "Ready when you are. What would you like to talk about?",
                    ]
                }
            }
        }
    
    def predict_text_emotion(self, text: str) -> Tuple[Optional[str], Optional[float]]:
        """Predict emotion from text"""
        if not text or not text.strip():
            return None, None
        
        try:
            results = self.text_pipeline(text)[0]
            best = max(results, key=lambda x: x["score"])
            emotion = best["label"].lower()
            confidence = float(best["score"])
            return emotion, confidence
        except Exception as e:
            print(f"Error in text emotion prediction: {e}")
            return None, None
    
    def predict_face_emotion(self, image_bytes: bytes) -> Tuple[Optional[str], Optional[float]]:
        """Predict emotion from face image"""
        if not image_bytes:
            return None, None
        
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            inputs = self.face_extractor(images=img, return_tensors="pt").to(self.device)
            
            with torch.no_grad():
                outputs = self.face_model(**inputs)
                probs = torch.softmax(outputs.logits, dim=1)[0]
                pred_idx = probs.argmax().item()
                emotion = self.face_model.config.id2label[pred_idx].lower()
                confidence = float(probs[pred_idx].item())
                return emotion, confidence
        except Exception as e:
            print(f"Error in face emotion prediction: {e}")
            return None, None
    
    def get_bot_response(self, emotion: str) -> str:
        """Get appropriate bot response for detected emotion"""
        if emotion not in self.emotion_library:
            emotion = "neutral"
        return random.choice(self.emotion_library[emotion]["responses"])
    
    def get_emotion_examples(self, emotion: str) -> List[str]:
        """Get example inputs for the detected emotion"""
        if emotion not in self.emotion_library:
            emotion = "neutral"
        return self.emotion_library[emotion]["examples"]
    
    def predict_multimodal(self, text: Optional[str] = None, image_bytes: Optional[bytes] = None, 
                          conversation_id: Optional[int] = None) -> Dict:
        """Predict emotion from text and/or image with advanced confidence-based fusion"""
        text_emotion, text_confidence = self.predict_text_emotion(text) if text else (None, None)
        face_emotion, face_confidence = self.predict_face_emotion(image_bytes) if image_bytes else (None, None)
        
        # Advanced confidence-based fusion
        final_emotion, final_confidence, fusion_method = self._confidence_based_fusion(
            text_emotion, text_confidence, face_emotion, face_confidence
        )
        
        # Determine emotion intensity
        emotion_intensity = self._calculate_emotion_intensity(final_confidence)
        
        # Generate context-aware response
        bot_response = self.get_contextual_response(final_emotion, emotion_intensity, conversation_id)
        example_inputs = self.get_emotion_examples(final_emotion)
        
        return {
            "text_emotion": text_emotion,
            "text_confidence": text_confidence,
            "face_emotion": face_emotion,
            "face_confidence": face_confidence,
            "final_emotion": final_emotion,
            "final_confidence": final_confidence,
            "emotion_intensity": emotion_intensity,
            "fusion_method": fusion_method,
            "bot_response": bot_response,
            "example_inputs": example_inputs
        }
    
    def _confidence_based_fusion(self, text_emotion: Optional[str], text_conf: Optional[float], 
                                face_emotion: Optional[str], face_conf: Optional[float]) -> Tuple[str, float, str]:
        """Advanced emotion fusion based on confidence scores"""
        
        # If only one modality is available
        if text_emotion and not face_emotion:
            return text_emotion, text_conf, "text_only"
        elif face_emotion and not text_emotion:
            return face_emotion, face_conf, "face_only"
        elif not text_emotion and not face_emotion:
            return "neutral", 0.5, "default"
        
        # Both modalities available - apply confidence-based fusion
        text_conf = text_conf or 0.0
        face_conf = face_conf or 0.0
        
        # Confidence thresholds
        HIGH_CONFIDENCE = 0.8
        MEDIUM_CONFIDENCE = 0.6
        
        # Case 1: Both emotions are the same
        if text_emotion == face_emotion:
            combined_confidence = min(0.95, (text_conf + face_conf) / 2 + 0.1)  # Boost for agreement
            return text_emotion, combined_confidence, "agreement_boost"
        
        # Case 2: High confidence difference - trust the higher one
        confidence_diff = abs(text_conf - face_conf)
        if confidence_diff > 0.3:
            if text_conf > face_conf:
                return text_emotion, text_conf, "text_dominant"
            else:
                return face_emotion, face_conf, "face_dominant"
        
        # Case 3: Similar confidences - use weighted average with emotion compatibility
        emotion_compatibility = self._check_emotion_compatibility(text_emotion, face_emotion)
        
        if emotion_compatibility > 0.5:  # Compatible emotions
            # Weighted fusion favoring text slightly (text often more reliable for context)
            text_weight = 0.6
            face_weight = 0.4
            
            if text_conf * text_weight > face_conf * face_weight:
                final_confidence = text_conf * 0.9  # Slight penalty for disagreement
                return text_emotion, final_confidence, "weighted_text"
            else:
                final_confidence = face_conf * 0.9
                return face_emotion, final_confidence, "weighted_face"
        else:
            # Incompatible emotions - choose the one with higher confidence but penalize
            if text_conf > face_conf:
                return text_emotion, text_conf * 0.8, "conflict_text"
            else:
                return face_emotion, face_conf * 0.8, "conflict_face"
    
    def _check_emotion_compatibility(self, emotion1: str, emotion2: str) -> float:
        """Check how compatible two emotions are (0.0 = incompatible, 1.0 = very compatible)"""
        compatibility_matrix = {
            ("joy", "surprise"): 0.8,
            ("sadness", "fear"): 0.7,
            ("anger", "disgust"): 0.6,
            ("fear", "surprise"): 0.5,
            ("sadness", "disgust"): 0.4,
            ("joy", "neutral"): 0.6,
            ("sadness", "neutral"): 0.5,
            ("anger", "neutral"): 0.4,
        }
        
        # Check both directions
        pair1 = (emotion1, emotion2)
        pair2 = (emotion2, emotion1)
        
        return compatibility_matrix.get(pair1, compatibility_matrix.get(pair2, 0.2))

# Global instance
emotion_service = EmotionService()