# recommendation_service.py - Service for managing recommendations
from sqlalchemy.orm import Session
from recommendation_models import (
    SiddhaRemedy, TamilIdiom, MotivationalQuote, MusicTrack,
    UserRecommendationPreference, RecommendationFeedback, EmotionColorTheme
)
from typing import List, Dict, Optional
import random

class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_recommendations_by_category(
        self, 
        emotion: str, 
        category: str, 
        user_id: Optional[int] = None,
        limit: int = 5
    ) -> List[Dict]:
        """
        Get recommendations by emotion and category
        
        Args:
            emotion: Detected emotion (sadness, anger, anxiety, etc.)
            category: siddha, idioms, quotes, music, or all
            user_id: Optional user ID for personalization
            limit: Number of recommendations to return
            
        Returns:
            List of recommendation dictionaries
        """
        recommendations = []
        
        if category == 'siddha' or category == 'all':
            siddha_recs = self.get_siddha_remedies(emotion, limit)
            recommendations.extend(siddha_recs)
        
        if category == 'idioms' or category == 'all':
            idiom_recs = self.get_tamil_idioms(emotion, limit)
            recommendations.extend(idiom_recs)
        
        if category == 'quotes' or category == 'all':
            quote_recs = self.get_motivational_quotes(emotion, limit)
            recommendations.extend(quote_recs)
        
        if category == 'music' or category == 'all':
            music_recs = self.get_music_tracks(emotion, limit)
            recommendations.extend(music_recs)
        
        # Personalize based on user preferences if user_id provided
        if user_id:
            recommendations = self.personalize_recommendations(recommendations, user_id)
        
        return recommendations
    
    def get_siddha_remedies(self, emotion: str, limit: int = 5) -> List[Dict]:
        """Get Siddha remedies for specific emotion"""
        remedies = self.db.query(SiddhaRemedy).filter(
            SiddhaRemedy.emotion == emotion
        ).limit(limit).all()
        
        return [{
            'id': r.id,
            'type': 'siddha',
            'emotion': r.emotion,
            'title': r.title,
            'category': r.category,
            'duration': r.duration,
            'difficulty': r.difficulty,
            'instructions': r.instructions,
            'materials': r.materials,
            'benefits': r.benefits,
            'tamil_context': r.tamil_context,
            'best_time': r.best_time,
            'audio_guide_url': r.audio_guide_url,
            'video_guide_url': r.video_guide_url
        } for r in remedies]
    
    def get_tamil_idioms(self, emotion: str, limit: int = 5) -> List[Dict]:
        """Get Tamil idioms for specific emotion"""
        idioms = self.db.query(TamilIdiom).filter(
            TamilIdiom.emotion == emotion
        ).limit(limit).all()
        
        return [{
            'id': i.id,
            'type': 'idiom',
            'emotion': i.emotion,
            'tamil_text': i.tamil_text,
            'transliteration': i.transliteration,
            'english_translation': i.english_translation,
            'context': i.context,
            'usage_example': i.usage_example,
            'story': i.story,
            'audio_url': i.audio_url
        } for i in idioms]
    
    def get_motivational_quotes(self, emotion: str, limit: int = 5) -> List[Dict]:
        """Get motivational quotes for specific emotion"""
        quotes = self.db.query(MotivationalQuote).filter(
            MotivationalQuote.emotion == emotion
        ).limit(limit).all()
        
        return [{
            'id': q.id,
            'type': 'quote',
            'emotion': q.emotion,
            'quote_type': q.quote_type,
            'tamil_text': q.tamil_text,
            'transliteration': q.transliteration,
            'english_translation': q.english_translation,
            'source': q.source,
            'author': q.author,
            'context': q.context,
            'reflection_prompt': q.reflection_prompt,
            'image_url': q.image_url,
            'audio_url': q.audio_url,
            'shareable': q.shareable
        } for q in quotes]
    
    def get_music_tracks(self, emotion: str, limit: int = 5) -> List[Dict]:
        """Get music tracks for specific emotion"""
        tracks = self.db.query(MusicTrack).filter(
            MusicTrack.emotion == emotion
        ).limit(limit).all()
        
        return [{
            'id': t.id,
            'type': 'music',
            'emotion': t.emotion,
            'title': t.title,
            'music_type': t.music_type,
            'raga': t.raga,
            'duration': t.duration,
            'artist': t.artist,
            'description': t.description,
            'benefits': t.benefits,
            'best_time': t.best_time,
            'spotify_link': t.spotify_link,
            'youtube_link': t.youtube_link,
            'apple_music_link': t.apple_music_link,
            'preview_audio_url': t.preview_audio_url,
            'lyrics_available': t.lyrics_available,
            'instrumental_only': t.instrumental_only
        } for t in tracks]
    
    def get_emotion_color_theme(self, emotion: str) -> Optional[Dict]:
        """Get color theme for specific emotion"""
        theme = self.db.query(EmotionColorTheme).filter(
            EmotionColorTheme.emotion == emotion
        ).first()
        
        if theme:
            return {
                'emotion': theme.emotion,
                'primary_color': theme.primary_color,
                'secondary_color': theme.secondary_color,
                'accent_color': theme.accent_color,
                'gradient': theme.gradient,
                'reasoning': theme.reasoning,
                'avoid_colors': theme.avoid_colors,
                'transition_duration': theme.transition_duration
            }
        return None
    
    def save_recommendation_feedback(
        self,
        user_id: int,
        recommendation_id: int,
        recommendation_type: str,
        feedback_data: Dict
    ) -> RecommendationFeedback:
        """Save user feedback for a recommendation"""
        feedback = RecommendationFeedback(
            user_id=user_id,
            recommendation_id=recommendation_id,
            recommendation_type=recommendation_type,
            completed=feedback_data.get('completed', False),
            effectiveness_rating=feedback_data.get('effectiveness_rating'),
            time_spent=feedback_data.get('time_spent'),
            feedback_text=feedback_data.get('feedback_text'),
            mood_before=feedback_data.get('mood_before'),
            mood_after=feedback_data.get('mood_after')
        )
        
        self.db.add(feedback)
        self.db.commit()
        self.db.refresh(feedback)
        
        return feedback
    
    def get_user_preferences(self, user_id: int) -> Optional[Dict]:
        """Get user's recommendation preferences"""
        prefs = self.db.query(UserRecommendationPreference).filter(
            UserRecommendationPreference.user_id == user_id
        ).first()
        
        if prefs:
            return {
                'preferred_categories': prefs.preferred_categories,
                'language_preference': prefs.language_preference,
                'color_therapy_enabled': prefs.color_therapy_enabled,
                'audio_enabled': prefs.audio_enabled,
                'music_autoplay': prefs.music_autoplay
            }
        return None
    
    def update_user_preferences(
        self,
        user_id: int,
        preferences: Dict
    ) -> UserRecommendationPreference:
        """Update user's recommendation preferences"""
        prefs = self.db.query(UserRecommendationPreference).filter(
            UserRecommendationPreference.user_id == user_id
        ).first()
        
        if not prefs:
            prefs = UserRecommendationPreference(user_id=user_id)
            self.db.add(prefs)
        
        # Update fields
        if 'preferred_categories' in preferences:
            prefs.preferred_categories = preferences['preferred_categories']
        if 'language_preference' in preferences:
            prefs.language_preference = preferences['language_preference']
        if 'color_therapy_enabled' in preferences:
            prefs.color_therapy_enabled = preferences['color_therapy_enabled']
        if 'audio_enabled' in preferences:
            prefs.audio_enabled = preferences['audio_enabled']
        if 'music_autoplay' in preferences:
            prefs.music_autoplay = preferences['music_autoplay']
        
        self.db.commit()
        self.db.refresh(prefs)
        
        return prefs
    
    def personalize_recommendations(
        self,
        recommendations: List[Dict],
        user_id: int
    ) -> List[Dict]:
        """Personalize recommendations based on user history and preferences"""
        # Get user preferences
        prefs = self.get_user_preferences(user_id)
        
        if not prefs:
            return recommendations
        
        # Filter by preferred categories if set
        if prefs.get('preferred_categories'):
            preferred = prefs['preferred_categories']
            recommendations = [
                r for r in recommendations 
                if r['type'] in preferred
            ]
        
        # Get user's past feedback to prioritize effective recommendations
        past_feedback = self.db.query(RecommendationFeedback).filter(
            RecommendationFeedback.user_id == user_id,
            RecommendationFeedback.effectiveness_rating >= 4
        ).all()
        
        # Boost recommendations of types that worked well before
        effective_types = [f.recommendation_type for f in past_feedback]
        
        # Sort recommendations: effective types first, then random
        def sort_key(rec):
            if rec['type'] in effective_types:
                return (0, random.random())
            return (1, random.random())
        
        recommendations.sort(key=sort_key)
        
        return recommendations

# Global service instance
recommendation_service = None

def get_recommendation_service(db: Session) -> RecommendationService:
    """Get recommendation service instance"""
    return RecommendationService(db)
