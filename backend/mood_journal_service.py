"""
Mood Journal Service
Automatically generates mood journal entries from chat conversations
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from dataclasses import dataclass
import re
import json
from sqlalchemy.orm import Session
from models import Message, Conversation

@dataclass
class EmotionalTrigger:
    trigger_text: str
    category: str
    emotion_before: str
    emotion_after: str
    intensity_change: float
    timestamp: datetime
    context: str

@dataclass
class CopingStrategy:
    strategy_description: str
    category: str
    effectiveness: float
    emotional_context: str
    timestamp: datetime

@dataclass
class MoodJournalEntry:
    date: datetime
    user_id: int
    dominant_emotions: Dict[str, float]
    emotion_intensity_curve: List[Tuple[datetime, str, float]]
    identified_triggers: List[EmotionalTrigger]
    natural_coping_strategies: List[CopingStrategy]
    activity_correlations: Dict[str, List[str]]
    social_context: Dict[str, int]
    physical_symptoms: List[str]
    environmental_factors: List[str]
    sleep_mentions: List[str]
    work_stress_indicators: List[str]
    overall_mood_trend: str
    key_insights: List[str]

class ConversationPatternAnalyzer:
    def __init__(self):
        self.trigger_keywords = self._load_trigger_keywords()
        self.coping_keywords = self._load_coping_keywords()
        self.activity_keywords = self._load_activity_keywords()
        self.physical_symptom_keywords = self._load_physical_symptom_keywords()
        self.environmental_keywords = self._load_environmental_keywords()
    
    def _load_trigger_keywords(self) -> Dict[str, List[str]]:
        """Load keywords that indicate emotional triggers"""
        return {
            'work_related': [
                'boss', 'work', 'job', 'meeting', 'deadline', 'project', 'colleague',
                'presentation', 'interview', 'performance review', 'overtime', 'stress at work'
            ],
            'relationship_related': [
                'boyfriend', 'girlfriend', 'husband', 'wife', 'partner', 'relationship',
                'argument', 'fight', 'breakup', 'divorce', 'dating', 'marriage'
            ],
            'family_related': [
                'mom', 'dad', 'mother', 'father', 'parents', 'family', 'siblings',
                'children', 'kids', 'family drama', 'family issues'
            ],
            'health_related': [
                'sick', 'illness', 'doctor', 'hospital', 'pain', 'health',
                'medical', 'symptoms', 'diagnosis', 'treatment'
            ],
            'financial_related': [
                'money', 'bills', 'debt', 'financial', 'budget', 'expensive',
                'broke', 'salary', 'income', 'financial stress'
            ],
            'social_related': [
                'friends', 'social', 'party', 'event', 'lonely', 'isolated',
                'social anxiety', 'people', 'crowd', 'social situation'
            ]
        }
    
    def _load_coping_keywords(self) -> Dict[str, List[str]]:
        """Load keywords that indicate coping strategies"""
        return {
            'problem_focused': [
                'decided to', 'talked to', 'made a plan', 'took action',
                'addressed the issue', 'confronted', 'solved', 'fixed'
            ],
            'emotion_focused': [
                'went for a walk', 'listened to music', 'took a bath',
                'deep breathing', 'meditation', 'relaxation', 'self-care'
            ],
            'social_support': [
                'called a friend', 'talked to someone', 'reached out',
                'got support', 'vented to', 'shared with'
            ],
            'avoidance': [
                'tried not to think', 'avoided', 'distracted myself',
                'ignored it', 'pushed it away', 'didn\'t deal with'
            ],
            'cognitive': [
                'reminded myself', 'tried to think positive', 'reframed',
                'put it in perspective', 'told myself', 'rationalized'
            ],
            'physical': [
                'exercised', 'went to gym', 'ran', 'yoga', 'sports',
                'physical activity', 'worked out'
            ]
        }
    
    def _load_activity_keywords(self) -> Dict[str, List[str]]:
        """Load keywords for different activities"""
        return {
            'exercise': ['gym', 'workout', 'run', 'walk', 'yoga', 'sports', 'exercise'],
            'social': ['friends', 'party', 'dinner', 'hangout', 'social', 'people'],
            'work': ['work', 'office', 'meeting', 'project', 'job', 'career'],
            'hobbies': ['hobby', 'reading', 'music', 'art', 'cooking', 'gaming'],
            'relaxation': ['relax', 'rest', 'sleep', 'nap', 'meditation', 'bath']
        }
    
    def _load_physical_symptom_keywords(self) -> List[str]:
        """Load keywords for physical symptoms"""
        return [
            'headache', 'tired', 'exhausted', 'fatigue', 'pain', 'sore',
            'tense', 'tight', 'stomach ache', 'nausea', 'dizzy', 'shaky',
            'heart racing', 'sweating', 'trouble sleeping', 'insomnia'
        ]
    
    def _load_environmental_keywords(self) -> List[str]:
        """Load keywords for environmental factors"""
        return [
            'weather', 'rain', 'sunny', 'cold', 'hot', 'seasonal',
            'winter', 'summer', 'spring', 'fall', 'dark', 'bright'
        ]
    
    def analyze_conversations(self, conversations: List[Message]) -> Dict:
        """Analyze conversations to extract mood patterns"""
        analysis = {
            'emotion_timeline': self._build_emotion_timeline(conversations),
            'triggers': self._identify_triggers(conversations),
            'coping_strategies': self._identify_coping_strategies(conversations),
            'activity_correlations': self._analyze_activity_correlations(conversations),
            'social_context': self._analyze_social_context(conversations),
            'physical_symptoms': self._extract_physical_symptoms(conversations),
            'environmental_factors': self._extract_environmental_factors(conversations),
            'sleep_patterns': self._extract_sleep_patterns(conversations),
            'work_stress': self._analyze_work_stress(conversations)
        }
        
        return analysis
    
    def _build_emotion_timeline(self, conversations: List[Message]) -> List[Tuple[datetime, str, float]]:
        """Build a timeline of emotions throughout the day"""
        timeline = []
        for msg in conversations:
            if msg.final_emotion and msg.final_confidence:
                timeline.append((
                    msg.created_at,
                    msg.final_emotion,
                    msg.final_confidence
                ))
        
        return sorted(timeline, key=lambda x: x[0])
    
    def _identify_triggers(self, conversations: List[Message]) -> List[EmotionalTrigger]:
        """Identify emotional triggers from conversation content"""
        triggers = []
        
        for i, msg in enumerate(conversations):
            if not msg.final_emotion or not msg.content:
                continue
            
            # Look for emotional spikes (significant emotion changes)
            if i > 0:
                prev_msg = conversations[i-1]
                if prev_msg.final_emotion and prev_msg.final_emotion != msg.final_emotion:
                    # Check if this represents a negative emotional change
                    if self._is_negative_emotion_change(prev_msg.final_emotion, msg.final_emotion):
                        # Analyze the content for trigger keywords
                        trigger_category = self._categorize_trigger(msg.content)
                        if trigger_category:
                            triggers.append(EmotionalTrigger(
                                trigger_text=msg.content[:100],  # First 100 chars
                                category=trigger_category,
                                emotion_before=prev_msg.final_emotion,
                                emotion_after=msg.final_emotion,
                                intensity_change=msg.final_confidence - (prev_msg.final_confidence or 0),
                                timestamp=msg.created_at,
                                context=msg.content
                            ))
        
        return triggers
    
    def _identify_coping_strategies(self, conversations: List[Message]) -> List[CopingStrategy]:
        """Identify natural coping strategies mentioned in conversations"""
        strategies = []
        
        for msg in conversations:
            if not msg.content:
                continue
            
            content_lower = msg.content.lower()
            
            for category, keywords in self.coping_keywords.items():
                for keyword in keywords:
                    if keyword in content_lower:
                        # Assess effectiveness by looking at emotion after mentioning the strategy
                        effectiveness = self._assess_coping_effectiveness(msg, conversations)
                        
                        strategies.append(CopingStrategy(
                            strategy_description=msg.content[:150],
                            category=category,
                            effectiveness=effectiveness,
                            emotional_context=msg.final_emotion or 'unknown',
                            timestamp=msg.created_at
                        ))
                        break
        
        return strategies
    
    def _analyze_activity_correlations(self, conversations: List[Message]) -> Dict[str, List[str]]:
        """Analyze correlations between activities and emotions"""
        correlations = defaultdict(list)
        
        for msg in conversations:
            if not msg.content or not msg.final_emotion:
                continue
            
            content_lower = msg.content.lower()
            
            for activity, keywords in self.activity_keywords.items():
                for keyword in keywords:
                    if keyword in content_lower:
                        correlations[activity].append(msg.final_emotion)
                        break
        
        # Convert to regular dict with emotion summaries
        result = {}
        for activity, emotions in correlations.items():
            emotion_counts = Counter(emotions)
            result[activity] = [f"{emotion}({count})" for emotion, count in emotion_counts.most_common()]
        
        return result
    
    def _analyze_social_context(self, conversations: List[Message]) -> Dict[str, int]:
        """Analyze social interactions mentioned in conversations"""
        social_mentions = {
            'friends': 0,
            'family': 0,
            'colleagues': 0,
            'partner': 0,
            'isolation': 0
        }
        
        social_keywords = {
            'friends': ['friend', 'friends', 'buddy', 'pal'],
            'family': ['family', 'mom', 'dad', 'mother', 'father', 'parents', 'siblings'],
            'colleagues': ['colleague', 'coworker', 'boss', 'team', 'work friends'],
            'partner': ['boyfriend', 'girlfriend', 'husband', 'wife', 'partner'],
            'isolation': ['alone', 'lonely', 'isolated', 'no one to talk to']
        }
        
        for msg in conversations:
            if not msg.content:
                continue
            
            content_lower = msg.content.lower()
            
            for category, keywords in social_keywords.items():
                for keyword in keywords:
                    if keyword in content_lower:
                        social_mentions[category] += 1
        
        return social_mentions
    
    def _extract_physical_symptoms(self, conversations: List[Message]) -> List[str]:
        """Extract mentions of physical symptoms"""
        symptoms = []
        
        for msg in conversations:
            if not msg.content:
                continue
            
            content_lower = msg.content.lower()
            
            for symptom in self.physical_symptom_keywords:
                if symptom in content_lower:
                    symptoms.append(symptom)
        
        return list(set(symptoms))  # Remove duplicates
    
    def _extract_environmental_factors(self, conversations: List[Message]) -> List[str]:
        """Extract environmental factors that might affect mood"""
        factors = []
        
        for msg in conversations:
            if not msg.content:
                continue
            
            content_lower = msg.content.lower()
            
            for factor in self.environmental_keywords:
                if factor in content_lower:
                    factors.append(factor)
        
        return list(set(factors))
    
    def _extract_sleep_patterns(self, conversations: List[Message]) -> List[str]:
        """Extract mentions of sleep patterns"""
        sleep_mentions = []
        sleep_keywords = [
            'couldn\'t sleep', 'insomnia', 'tired', 'exhausted',
            'slept well', 'good sleep', 'bad sleep', 'woke up'
        ]
        
        for msg in conversations:
            if not msg.content:
                continue
            
            content_lower = msg.content.lower()
            
            for keyword in sleep_keywords:
                if keyword in content_lower:
                    sleep_mentions.append(keyword)
        
        return sleep_mentions
    
    def _analyze_work_stress(self, conversations: List[Message]) -> List[str]:
        """Analyze work-related stress indicators"""
        work_stress = []
        work_stress_keywords = [
            'work stress', 'deadline', 'overtime', 'boss is demanding',
            'too much work', 'work pressure', 'job stress'
        ]
        
        for msg in conversations:
            if not msg.content:
                continue
            
            content_lower = msg.content.lower()
            
            for keyword in work_stress_keywords:
                if keyword in content_lower:
                    work_stress.append(keyword)
        
        return work_stress
    
    def _is_negative_emotion_change(self, emotion_before: str, emotion_after: str) -> bool:
        """Determine if an emotion change is negative"""
        positive_emotions = ['joy', 'surprise']
        negative_emotions = ['sadness', 'anger', 'fear', 'disgust']
        
        if emotion_before in positive_emotions and emotion_after in negative_emotions:
            return True
        
        # Also consider intensity increases in negative emotions
        if emotion_before in negative_emotions and emotion_after in negative_emotions:
            return True
        
        return False
    
    def _categorize_trigger(self, content: str) -> Optional[str]:
        """Categorize the type of trigger based on content"""
        content_lower = content.lower()
        
        for category, keywords in self.trigger_keywords.items():
            for keyword in keywords:
                if keyword in content_lower:
                    return category
        
        return None
    
    def _assess_coping_effectiveness(self, msg: Message, all_conversations: List[Message]) -> float:
        """Assess how effective a coping strategy was"""
        # Look at emotions in subsequent messages
        msg_index = all_conversations.index(msg)
        
        if msg_index < len(all_conversations) - 1:
            # Check emotions in next few messages
            subsequent_emotions = []
            for i in range(msg_index + 1, min(msg_index + 4, len(all_conversations))):
                if all_conversations[i].final_emotion:
                    subsequent_emotions.append(all_conversations[i].final_emotion)
            
            # If subsequent emotions are more positive, strategy was effective
            positive_emotions = ['joy', 'neutral']
            positive_count = sum(1 for emotion in subsequent_emotions if emotion in positive_emotions)
            
            if subsequent_emotions:
                return positive_count / len(subsequent_emotions)
        
        return 0.5  # Default neutral effectiveness

class SmartPromptGenerator:
    def __init__(self):
        self.prompt_templates = self._load_prompt_templates()
    
    def _load_prompt_templates(self) -> Dict[str, List[str]]:
        """Load templates for generating smart prompts"""
        return {
            'recurring_triggers': [
                "I noticed you mentioned feeling {emotion} about {trigger} {count} times this week. What specific aspects of {trigger} worry you most?",
                "You've brought up {trigger} several times when feeling {emotion}. What would help you feel more confident about these situations?",
                "I see {trigger} has been on your mind lately. What's the most challenging part about dealing with {trigger}?"
            ],
            'positive_patterns': [
                "Your mood seems to improve when you talk about {activity}. How can we incorporate more of that into your routine?",
                "I notice you feel {positive_emotion} when you mention {activity}. What's stopping you from doing more of what makes you happy?",
                "You mentioned {coping_strategy} helped you feel better. What is it about this approach that works for you?"
            ],
            'social_patterns': [
                "I've noticed you haven't mentioned spending time with others lately. How are you feeling about your social connections?",
                "You seem to feel better after talking to {person}. What makes that relationship particularly supportive?",
                "I see you've been feeling {emotion} and mentioned being alone. What would make it easier for you to reach out to people?"
            ],
            'physical_patterns': [
                "You've mentioned {physical_symptom} a few times. How has this been affecting your mood?",
                "I notice you feel {emotion} when you mention {physical_symptom}. Have you been able to address this?",
                "Your sleep seems to be affecting how you feel. What usually helps you sleep better?"
            ],
            'reflection_prompts': [
                "Looking at your week, what patterns do you notice in your emotions?",
                "What's one thing that consistently makes you feel better when you're {emotion}?",
                "If you could change one thing about how you handle {trigger}, what would it be?"
            ]
        }
    
    def generate_contextual_prompts(self, mood_analysis: Dict, user_history: Dict) -> List[Dict[str, str]]:
        """Generate personalized prompts based on mood patterns"""
        prompts = []
        
        # Analyze patterns for prompt generation
        patterns = self._analyze_patterns_for_prompts(mood_analysis, user_history)
        
        # Generate prompts based on identified patterns
        if patterns.get('recurring_triggers'):
            prompts.extend(self._generate_trigger_prompts(patterns['recurring_triggers']))
        
        if patterns.get('positive_activities'):
            prompts.extend(self._generate_positive_prompts(patterns['positive_activities']))
        
        if patterns.get('social_isolation'):
            prompts.extend(self._generate_social_prompts(patterns['social_isolation']))
        
        if patterns.get('physical_symptoms'):
            prompts.extend(self._generate_physical_prompts(patterns['physical_symptoms']))
        
        # Always include some reflection prompts
        prompts.extend(self._generate_reflection_prompts(mood_analysis))
        
        return prompts[:5]  # Return top 5 prompts
    
    def _analyze_patterns_for_prompts(self, mood_analysis: Dict, user_history: Dict) -> Dict:
        """Analyze patterns to determine what prompts to generate"""
        patterns = {}
        
        # Check for recurring triggers
        triggers = mood_analysis.get('triggers', [])
        if triggers:
            trigger_counts = Counter([t.category for t in triggers])
            most_common_trigger = trigger_counts.most_common(1)
            if most_common_trigger and most_common_trigger[0][1] >= 2:
                patterns['recurring_triggers'] = {
                    'trigger': most_common_trigger[0][0],
                    'count': most_common_trigger[0][1],
                    'emotion': triggers[0].emotion_after
                }
        
        # Check for positive activity correlations
        activity_correlations = mood_analysis.get('activity_correlations', {})
        for activity, emotions in activity_correlations.items():
            positive_emotions = [e for e in emotions if 'joy' in e or 'neutral' in e]
            if len(positive_emotions) > len(emotions) / 2:
                patterns['positive_activities'] = {
                    'activity': activity,
                    'positive_emotion': 'joy'
                }
                break
        
        # Check for social isolation
        social_context = mood_analysis.get('social_context', {})
        if social_context.get('isolation', 0) > social_context.get('friends', 0) + social_context.get('family', 0):
            patterns['social_isolation'] = True
        
        # Check for physical symptoms
        physical_symptoms = mood_analysis.get('physical_symptoms', [])
        if physical_symptoms:
            patterns['physical_symptoms'] = physical_symptoms[0]  # Most mentioned symptom
        
        return patterns
    
    def _generate_trigger_prompts(self, trigger_info: Dict) -> List[Dict[str, str]]:
        """Generate prompts about recurring triggers"""
        template = self.prompt_templates['recurring_triggers'][0]
        prompt = template.format(
            emotion=trigger_info['emotion'],
            trigger=trigger_info['trigger'].replace('_', ' '),
            count=trigger_info['count']
        )
        
        return [{
            'type': 'exploration',
            'prompt': prompt,
            'follow_up': f"What would help you feel more confident about {trigger_info['trigger'].replace('_', ' ')} situations?",
            'wellness_connection': trigger_info['trigger']
        }]
    
    def _generate_positive_prompts(self, activity_info: Dict) -> List[Dict[str, str]]:
        """Generate prompts about positive activities"""
        template = self.prompt_templates['positive_patterns'][0]
        prompt = template.format(
            activity=activity_info['activity'],
            positive_emotion=activity_info['positive_emotion']
        )
        
        return [{
            'type': 'positive_reinforcement',
            'prompt': prompt,
            'follow_up': "What's stopping you from doing more of what makes you happy?",
            'wellness_connection': 'hobby_engagement'
        }]
    
    def _generate_social_prompts(self, isolation_info: bool) -> List[Dict[str, str]]:
        """Generate prompts about social connections"""
        if isolation_info:
            return [{
                'type': 'social_connection',
                'prompt': "I've noticed you haven't mentioned spending time with others lately. How are you feeling about your social connections?",
                'follow_up': "What would make it easier for you to reach out to people?",
                'wellness_connection': 'social_support'
            }]
        return []
    
    def _generate_physical_prompts(self, symptom: str) -> List[Dict[str, str]]:
        """Generate prompts about physical symptoms"""
        return [{
            'type': 'physical_wellness',
            'prompt': f"You've mentioned {symptom} a few times. How has this been affecting your mood?",
            'follow_up': f"What usually helps with your {symptom}?",
            'wellness_connection': 'physical_health'
        }]
    
    def _generate_reflection_prompts(self, mood_analysis: Dict) -> List[Dict[str, str]]:
        """Generate general reflection prompts"""
        return [{
            'type': 'reflection',
            'prompt': "Looking at your recent conversations, what patterns do you notice in your emotions?",
            'follow_up': "What's one thing that consistently helps you feel better?",
            'wellness_connection': 'self_awareness'
        }]

class MoodJournalService:
    def __init__(self):
        self.pattern_analyzer = ConversationPatternAnalyzer()
        self.prompt_generator = SmartPromptGenerator()
    
    def generate_daily_entry(self, user_id: int, date: datetime, db: Session) -> MoodJournalEntry:
        """Generate a comprehensive mood journal entry for a specific day"""
        
        # Get all conversations for the day
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        messages = db.query(Message).join(Conversation).filter(
            Conversation.user_id == user_id,
            Message.created_at >= start_of_day,
            Message.created_at < end_of_day,
            Message.is_user_message == True
        ).order_by(Message.created_at).all()
        
        if not messages:
            return self._create_empty_entry(user_id, date)
        
        # Analyze conversations
        analysis = self.pattern_analyzer.analyze_conversations(messages)
        
        # Calculate dominant emotions
        emotions = [msg.final_emotion for msg in messages if msg.final_emotion]
        emotion_counts = Counter(emotions)
        dominant_emotions = {emotion: count/len(emotions) for emotion, count in emotion_counts.items()}
        
        # Determine overall mood trend
        mood_trend = self._calculate_mood_trend(analysis['emotion_timeline'])
        
        # Generate key insights
        key_insights = self._generate_key_insights(analysis, dominant_emotions)
        
        return MoodJournalEntry(
            date=date,
            user_id=user_id,
            dominant_emotions=dominant_emotions,
            emotion_intensity_curve=analysis['emotion_timeline'],
            identified_triggers=analysis['triggers'],
            natural_coping_strategies=analysis['coping_strategies'],
            activity_correlations=analysis['activity_correlations'],
            social_context=analysis['social_context'],
            physical_symptoms=analysis['physical_symptoms'],
            environmental_factors=analysis['environmental_factors'],
            sleep_mentions=analysis['sleep_patterns'],
            work_stress_indicators=analysis['work_stress'],
            overall_mood_trend=mood_trend,
            key_insights=key_insights
        )
    
    def generate_smart_prompts(self, user_id: int, recent_days: int, db: Session) -> List[Dict[str, str]]:
        """Generate smart prompts based on recent mood patterns"""
        
        # Get recent conversations
        cutoff_date = datetime.now() - timedelta(days=recent_days)
        
        messages = db.query(Message).join(Conversation).filter(
            Conversation.user_id == user_id,
            Message.created_at >= cutoff_date,
            Message.is_user_message == True
        ).order_by(Message.created_at).all()
        
        if not messages:
            return self._get_default_prompts()
        
        # Analyze recent patterns
        analysis = self.pattern_analyzer.analyze_conversations(messages)
        
        # Generate contextual prompts
        prompts = self.prompt_generator.generate_contextual_prompts(analysis, {})
        
        return prompts
    
    def _create_empty_entry(self, user_id: int, date: datetime) -> MoodJournalEntry:
        """Create an empty mood journal entry for days with no data"""
        return MoodJournalEntry(
            date=date,
            user_id=user_id,
            dominant_emotions={},
            emotion_intensity_curve=[],
            identified_triggers=[],
            natural_coping_strategies=[],
            activity_correlations={},
            social_context={},
            physical_symptoms=[],
            environmental_factors=[],
            sleep_mentions=[],
            work_stress_indicators=[],
            overall_mood_trend="neutral",
            key_insights=["No conversation data available for this day"]
        )
    
    def _calculate_mood_trend(self, emotion_timeline: List[Tuple[datetime, str, float]]) -> str:
        """Calculate overall mood trend for the day"""
        if not emotion_timeline:
            return "neutral"
        
        # Simple trend calculation based on emotion progression
        positive_emotions = ['joy', 'surprise']
        negative_emotions = ['sadness', 'anger', 'fear', 'disgust']
        
        positive_count = sum(1 for _, emotion, _ in emotion_timeline if emotion in positive_emotions)
        negative_count = sum(1 for _, emotion, _ in emotion_timeline if emotion in negative_emotions)
        
        if positive_count > negative_count:
            return "improving"
        elif negative_count > positive_count:
            return "declining"
        else:
            return "stable"
    
    def _generate_key_insights(self, analysis: Dict, dominant_emotions: Dict[str, float]) -> List[str]:
        """Generate key insights from the day's analysis"""
        insights = []
        
        # Dominant emotion insight
        if dominant_emotions:
            top_emotion = max(dominant_emotions, key=dominant_emotions.get)
            percentage = dominant_emotions[top_emotion] * 100
            insights.append(f"Your dominant emotion today was {top_emotion} ({percentage:.0f}% of conversations)")
        
        # Trigger insights
        if analysis['triggers']:
            most_common_trigger = Counter([t.category for t in analysis['triggers']]).most_common(1)[0]
            insights.append(f"Most common emotional trigger: {most_common_trigger[0].replace('_', ' ')}")
        
        # Coping strategy insights
        if analysis['coping_strategies']:
            effective_strategies = [s for s in analysis['coping_strategies'] if s.effectiveness > 0.6]
            if effective_strategies:
                insights.append(f"Effective coping strategy: {effective_strategies[0].category.replace('_', ' ')}")
        
        # Activity correlation insights
        if analysis['activity_correlations']:
            for activity, emotions in analysis['activity_correlations'].items():
                positive_emotions = [e for e in emotions if 'joy' in e]
                if positive_emotions:
                    insights.append(f"{activity.title()} activities were associated with positive emotions")
                    break
        
        # Social context insights
        social_context = analysis['social_context']
        total_social = sum(social_context.values()) - social_context.get('isolation', 0)
        if social_context.get('isolation', 0) > total_social:
            insights.append("You mentioned feeling isolated more than social connections")
        elif total_social > 0:
            insights.append("You had positive social interactions today")
        
        return insights[:5]  # Return top 5 insights
    
    def _get_default_prompts(self) -> List[Dict[str, str]]:
        """Get default prompts when no conversation data is available"""
        return [
            {
                'type': 'general',
                'prompt': "How are you feeling today?",
                'follow_up': "What's been on your mind lately?",
                'wellness_connection': 'general_check_in'
            },
            {
                'type': 'reflection',
                'prompt': "What's one thing you're grateful for today?",
                'follow_up': "How did that make you feel?",
                'wellness_connection': 'gratitude'
            }
        ]

# Global mood journal service instance
mood_journal_service = MoodJournalService()