"""
Advanced Analytics Service for Emotion Recognition
Provides detailed insights and statistics about user emotions
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from models import User, Conversation, Message
import json

class AnalyticsService:
    def __init__(self):
        pass
    
    def get_user_analytics(self, db: Session, user_id: int, days: int = 30) -> Dict:
        """Get comprehensive analytics for a user"""
        
        # Date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get user conversations
        conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.created_at >= start_date
        ).all()
        
        # Get all user messages with emotions
        messages = db.query(Message).join(Conversation).filter(
            Conversation.user_id == user_id,
            Message.is_user_message == True,
            Message.final_emotion.isnot(None),
            Message.created_at >= start_date
        ).all()
        
        return {
            "overview": self._calculate_overview_stats(conversations, messages),
            "emotion_distribution": self._calculate_emotion_distribution(messages),
            "emotion_trends": self._calculate_emotion_trends(messages, days),
            "confidence_analysis": self._calculate_confidence_analysis(messages),
            "intensity_analysis": self._calculate_intensity_analysis(messages),
            "fusion_method_stats": self._calculate_fusion_stats(messages),
            "conversation_patterns": self._calculate_conversation_patterns(conversations),
            "time_patterns": self._calculate_time_patterns(messages),
            "emotional_journey": self._calculate_emotional_journey(messages),
            "insights": self._generate_insights(messages, conversations)
        }
    
    def _calculate_overview_stats(self, conversations: List, messages: List) -> Dict:
        """Calculate basic overview statistics"""
        total_messages = len(messages)
        total_conversations = len(conversations)
        
        if total_messages == 0:
            return {
                "total_conversations": total_conversations,
                "total_messages": total_messages,
                "avg_messages_per_conversation": 0,
                "avg_confidence": 0,
                "most_frequent_emotion": None,
                "emotional_diversity": 0
            }
        
        # Calculate averages
        avg_messages_per_conv = total_messages / max(total_conversations, 1)
        
        # Calculate average confidence
        confidences = [m.final_confidence for m in messages if m.final_confidence]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # Most frequent emotion
        emotion_counts = {}
        for msg in messages:
            if msg.final_emotion:
                emotion_counts[msg.final_emotion] = emotion_counts.get(msg.final_emotion, 0) + 1
        
        most_frequent_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else None
        emotional_diversity = len(emotion_counts)
        
        return {
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "avg_messages_per_conversation": round(avg_messages_per_conv, 1),
            "avg_confidence": round(avg_confidence, 3),
            "most_frequent_emotion": most_frequent_emotion,
            "emotional_diversity": emotional_diversity
        }
    
    def _calculate_emotion_distribution(self, messages: List) -> Dict:
        """Calculate emotion distribution with percentages"""
        emotion_counts = {}
        total_messages = len(messages)
        
        for msg in messages:
            if msg.final_emotion:
                emotion_counts[msg.final_emotion] = emotion_counts.get(msg.final_emotion, 0) + 1
        
        # Convert to percentages
        emotion_percentages = {}
        for emotion, count in emotion_counts.items():
            emotion_percentages[emotion] = {
                "count": count,
                "percentage": round((count / total_messages) * 100, 1) if total_messages > 0 else 0
            }
        
        return emotion_percentages
    
    def _calculate_emotion_trends(self, messages: List, days: int) -> List[Dict]:
        """Calculate daily emotion trends"""
        trends = []
        end_date = datetime.now().date()
        
        for i in range(days):
            current_date = end_date - timedelta(days=i)
            day_messages = [
                msg for msg in messages 
                if msg.created_at.date() == current_date and msg.final_emotion
            ]
            
            emotion_counts = {}
            for msg in day_messages:
                emotion_counts[msg.final_emotion] = emotion_counts.get(msg.final_emotion, 0) + 1
            
            trends.append({
                "date": current_date.isoformat(),
                "total_messages": len(day_messages),
                "emotions": emotion_counts,
                "dominant_emotion": max(emotion_counts, key=emotion_counts.get) if emotion_counts else None
            })
        
        return list(reversed(trends))  # Chronological order
    
    def _calculate_confidence_analysis(self, messages: List) -> Dict:
        """Analyze confidence scores"""
        confidences = [msg.final_confidence for msg in messages if msg.final_confidence]
        
        if not confidences:
            return {
                "average": 0,
                "min": 0,
                "max": 0,
                "distribution": {"high": 0, "medium": 0, "low": 0, "very_low": 0}
            }
        
        # Calculate distribution
        distribution = {"high": 0, "medium": 0, "low": 0, "very_low": 0}
        for conf in confidences:
            if conf >= 0.8:
                distribution["high"] += 1
            elif conf >= 0.6:
                distribution["medium"] += 1
            elif conf >= 0.4:
                distribution["low"] += 1
            else:
                distribution["very_low"] += 1
        
        return {
            "average": round(sum(confidences) / len(confidences), 3),
            "min": round(min(confidences), 3),
            "max": round(max(confidences), 3),
            "distribution": distribution
        }
    
    def _calculate_intensity_analysis(self, messages: List) -> Dict:
        """Analyze emotion intensity patterns"""
        intensity_counts = {}
        emotion_intensities = {}
        
        for msg in messages:
            if msg.emotion_intensity:
                # Overall intensity distribution
                intensity_counts[msg.emotion_intensity] = intensity_counts.get(msg.emotion_intensity, 0) + 1
                
                # Intensity by emotion
                if msg.final_emotion:
                    if msg.final_emotion not in emotion_intensities:
                        emotion_intensities[msg.final_emotion] = {}
                    
                    emotion_intensities[msg.final_emotion][msg.emotion_intensity] = \
                        emotion_intensities[msg.final_emotion].get(msg.emotion_intensity, 0) + 1
        
        return {
            "overall_distribution": intensity_counts,
            "by_emotion": emotion_intensities
        }
    
    def _calculate_fusion_stats(self, messages: List) -> Dict:
        """Analyze fusion method usage"""
        fusion_counts = {}
        
        for msg in messages:
            if msg.fusion_method:
                fusion_counts[msg.fusion_method] = fusion_counts.get(msg.fusion_method, 0) + 1
        
        # Calculate percentages
        total = sum(fusion_counts.values())
        fusion_percentages = {}
        for method, count in fusion_counts.items():
            fusion_percentages[method] = {
                "count": count,
                "percentage": round((count / total) * 100, 1) if total > 0 else 0
            }
        
        return fusion_percentages
    
    def _calculate_conversation_patterns(self, conversations: List) -> Dict:
        """Analyze conversation patterns"""
        if not conversations:
            return {
                "avg_length": 0,
                "length_distribution": {},
                "most_active_day": None,
                "conversation_frequency": 0
            }
        
        # Calculate conversation lengths
        lengths = []
        for conv in conversations:
            message_count = len([msg for msg in conv.messages if msg.is_user_message])
            lengths.append(message_count)
        
        # Length distribution
        length_distribution = {"short": 0, "medium": 0, "long": 0}
        for length in lengths:
            if length <= 5:
                length_distribution["short"] += 1
            elif length <= 15:
                length_distribution["medium"] += 1
            else:
                length_distribution["long"] += 1
        
        # Most active day
        day_counts = {}
        for conv in conversations:
            day = conv.created_at.strftime("%A")
            day_counts[day] = day_counts.get(day, 0) + 1
        
        most_active_day = max(day_counts, key=day_counts.get) if day_counts else None
        
        return {
            "avg_length": round(sum(lengths) / len(lengths), 1) if lengths else 0,
            "length_distribution": length_distribution,
            "most_active_day": most_active_day,
            "conversation_frequency": len(conversations) / 30  # conversations per day
        }
    
    def _calculate_time_patterns(self, messages: List) -> Dict:
        """Analyze temporal patterns in emotions"""
        hour_emotions = {}
        day_emotions = {}
        
        for msg in messages:
            if msg.final_emotion:
                # Hour analysis
                hour = msg.created_at.hour
                if hour not in hour_emotions:
                    hour_emotions[hour] = {}
                hour_emotions[hour][msg.final_emotion] = hour_emotions[hour].get(msg.final_emotion, 0) + 1
                
                # Day analysis
                day = msg.created_at.strftime("%A")
                if day not in day_emotions:
                    day_emotions[day] = {}
                day_emotions[day][msg.final_emotion] = day_emotions[day].get(msg.final_emotion, 0) + 1
        
        return {
            "hourly_patterns": hour_emotions,
            "daily_patterns": day_emotions
        }
    
    def _calculate_emotional_journey(self, messages: List) -> List[Dict]:
        """Track emotional journey over time"""
        journey = []
        
        # Sort messages by timestamp
        sorted_messages = sorted(messages, key=lambda x: x.created_at)
        
        for msg in sorted_messages:
            if msg.final_emotion:
                journey.append({
                    "timestamp": msg.created_at.isoformat(),
                    "emotion": msg.final_emotion,
                    "confidence": msg.final_confidence,
                    "intensity": msg.emotion_intensity
                })
        
        return journey
    
    def _generate_insights(self, messages: List, conversations: List) -> List[str]:
        """Generate AI-powered insights"""
        insights = []
        
        if not messages:
            insights.append("Start chatting to generate personalized insights!")
            return insights
        
        # Emotion diversity insight
        unique_emotions = len(set(msg.final_emotion for msg in messages if msg.final_emotion))
        if unique_emotions >= 5:
            insights.append(f"🌈 You express a rich emotional range with {unique_emotions} different emotions detected.")
        elif unique_emotions >= 3:
            insights.append(f"😊 You show good emotional variety with {unique_emotions} different emotions.")
        else:
            insights.append(f"🎯 Your emotional expression is focused on {unique_emotions} main emotions.")
        
        # Confidence insight
        confidences = [msg.final_confidence for msg in messages if msg.final_confidence]
        if confidences:
            avg_conf = sum(confidences) / len(confidences)
            if avg_conf >= 0.8:
                insights.append("🎯 Your emotions are detected with high confidence - you express yourself clearly!")
            elif avg_conf >= 0.6:
                insights.append("👍 Good emotional clarity in your expressions.")
            else:
                insights.append("💡 Your emotional expressions could be more distinct for better detection.")
        
        # Conversation pattern insight
        if conversations:
            avg_length = sum(len([m for m in conv.messages if m.is_user_message]) for conv in conversations) / len(conversations)
            if avg_length >= 10:
                insights.append("💬 You engage in deep, meaningful conversations.")
            elif avg_length >= 5:
                insights.append("🗣️ You maintain good conversation flow.")
            else:
                insights.append("⚡ You prefer quick, concise interactions.")
        
        # Most frequent emotion insight
        emotion_counts = {}
        for msg in messages:
            if msg.final_emotion:
                emotion_counts[msg.final_emotion] = emotion_counts.get(msg.final_emotion, 0) + 1
        
        if emotion_counts:
            most_frequent = max(emotion_counts, key=emotion_counts.get)
            percentage = (emotion_counts[most_frequent] / len(messages)) * 100
            
            emotion_descriptions = {
                "joy": "positive and optimistic",
                "sadness": "reflective and thoughtful", 
                "anger": "passionate and assertive",
                "fear": "cautious and analytical",
                "surprise": "curious and open-minded",
                "disgust": "discerning and principled",
                "neutral": "balanced and composed"
            }
            
            description = emotion_descriptions.get(most_frequent, "unique")
            insights.append(f"✨ You tend to be {description} - {most_frequent} appears in {percentage:.0f}% of your messages.")
        
        return insights

# Global analytics service instance
analytics_service = AnalyticsService()