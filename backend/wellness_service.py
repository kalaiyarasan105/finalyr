"""
Wellness Recommendation Service
Provides personalized wellness recommendations based on emotional state and mood patterns
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import json
import re
from collections import defaultdict, Counter
from dataclasses import dataclass
from enum import Enum

class RecommendationType(Enum):
    IMMEDIATE = "immediate"
    SHORT_TERM = "short_term"
    LONG_TERM = "long_term"

class WellnessCategory(Enum):
    BREATHING = "breathing"
    PHYSICAL_ACTIVITY = "physical_activity"
    SOCIAL = "social"
    MINDFULNESS = "mindfulness"
    COGNITIVE = "cognitive"
    CREATIVE = "creative"
    SELF_CARE = "self_care"

@dataclass
class WellnessRecommendation:
    id: str
    action: str
    duration: str
    type: WellnessCategory
    priority: int
    confidence: str
    rationale: str
    instructions: Optional[str] = None
    adaptations: Optional[Dict[str, str]] = None
    personalized: bool = False

@dataclass
class UserFeedback:
    recommendation_id: str
    completed: bool
    rating: Optional[int]  # 1-5 scale
    notes: Optional[str]
    timestamp: datetime

class WellnessRecommendationEngine:
    def __init__(self):
        self.base_recommendations = self._load_base_recommendations()
        self.user_effectiveness_data = {}  # user_id -> effectiveness data
        self.adaptation_patterns = self._load_adaptation_patterns()
    
    def _load_base_recommendations(self) -> Dict[str, Dict[str, List[WellnessRecommendation]]]:
        """Load base wellness recommendations for each emotion"""
        return {
            "joy": {
                "immediate": [
                    WellnessRecommendation(
                        id="joy_gratitude_1",
                        action="Take a moment to savor this positive feeling",
                        duration="2-3 minutes",
                        type=WellnessCategory.MINDFULNESS,
                        priority=3,
                        confidence="high",
                        rationale="Savoring positive emotions helps build resilience and lasting happiness",
                        instructions="Close your eyes, take three deep breaths, and really feel the joy in your body",
                        adaptations={
                            "user_mentions_achievement": "Celebrate this achievement - you've earned this happiness!",
                            "user_mentions_gratitude": "Write down three things you're grateful for right now"
                        }
                    ),
                    WellnessRecommendation(
                        id="joy_share_1",
                        action="Share your happiness with someone you care about",
                        duration="5-10 minutes",
                        type=WellnessCategory.SOCIAL,
                        priority=4,
                        confidence="high",
                        rationale="Sharing positive emotions strengthens relationships and amplifies joy",
                        instructions="Call, text, or tell someone about what's making you happy",
                        adaptations={
                            "user_mentions_specific_person": "Share this joy with {supportive_person} who would love to hear about it",
                            "user_mentions_social_anxiety": "Send a happy text or photo to someone close to you"
                        }
                    ),
                    WellnessRecommendation(
                        id="joy_movement_1",
                        action="Express your joy through movement or dance",
                        duration="3-5 minutes",
                        type=WellnessCategory.PHYSICAL_ACTIVITY,
                        priority=2,
                        confidence="medium",
                        rationale="Physical expression of joy releases endorphins and reinforces positive feelings",
                        instructions="Put on your favorite upbeat song and move however feels good",
                        adaptations={
                            "user_mentions_music_preference": "Dance to that {music_preference} music you love",
                            "user_mentions_physical_limitations": "Express joy through gentle arm movements or clapping"
                        }
                    )
                ],
                "short_term": [
                    WellnessRecommendation(
                        id="joy_creative_1",
                        action="Channel your positive energy into a creative activity",
                        duration="30-60 minutes",
                        type=WellnessCategory.CREATIVE,
                        priority=3,
                        confidence="high",
                        rationale="Creative expression during positive states builds lasting positive memories",
                        adaptations={
                            "user_mentions_creative_hobby": "Work on that {creative_hobby} project you've been excited about",
                            "user_new_to_creativity": "Try drawing, writing, or crafting something simple and fun"
                        }
                    ),
                    WellnessRecommendation(
                        id="joy_help_others_1",
                        action="Use your positive energy to help someone else",
                        duration="20-30 minutes",
                        type=WellnessCategory.SOCIAL,
                        priority=4,
                        confidence="high",
                        rationale="Helping others when we feel good creates a positive cycle and deeper fulfillment",
                        instructions="Offer help to a friend, volunteer, or do a random act of kindness",
                        adaptations={
                            "user_mentions_community": "Get involved in that {community_activity} you mentioned",
                            "user_mentions_time_constraints": "Send an encouraging message to someone who might need it"
                        }
                    )
                ],
                "long_term": [
                    WellnessRecommendation(
                        id="joy_gratitude_practice_1",
                        action="Start a daily gratitude practice",
                        duration="ongoing",
                        type=WellnessCategory.MINDFULNESS,
                        priority=4,
                        confidence="high",
                        rationale="Regular gratitude practice increases baseline happiness and life satisfaction",
                        instructions="Write down 3 things you're grateful for each day",
                        adaptations={
                            "user_mentions_journaling": "Add gratitude to your existing journaling practice",
                            "user_prefers_digital": "Use a gratitude app or digital journal"
                        }
                    ),
                    WellnessRecommendation(
                        id="joy_positive_habits_1",
                        action="Build habits that support sustained happiness",
                        duration="ongoing",
                        type=WellnessCategory.SELF_CARE,
                        priority=3,
                        confidence="high",
                        rationale="Consistent positive habits create a foundation for long-term well-being",
                        adaptations={
                            "user_mentions_specific_activity": "Make {enjoyed_activity} a regular part of your routine",
                            "user_mentions_goals": "Set small, achievable goals that align with your values"
                        }
                    )
                ]
            },
            "sadness": {
                "immediate": [
                    WellnessRecommendation(
                        id="sadness_breathing_1",
                        action="Take 5 deep breaths and notice how your body feels",
                        duration="2-3 minutes",
                        type=WellnessCategory.BREATHING,
                        priority=3,
                        confidence="high",
                        rationale="Deep breathing activates the parasympathetic nervous system",
                        instructions="Breathe in for 4 counts, hold for 4, exhale for 6",
                        adaptations={
                            "user_mentions_breathing_helps": "Try the 4-7-8 breathing technique you mentioned works for you",
                            "user_has_anxiety_too": "Focus on slow, gentle breaths to calm both sadness and anxiety"
                        }
                    ),
                    WellnessRecommendation(
                        id="sadness_music_1",
                        action="Listen to your favorite uplifting song",
                        duration="3-5 minutes",
                        type=WellnessCategory.CREATIVE,
                        priority=2,
                        confidence="medium",
                        rationale="Music can shift emotional state and provide comfort",
                        adaptations={
                            "user_mentions_specific_music": "Put on that {music_preference} music you mentioned loving",
                            "user_mentions_music_doesnt_help": "Try nature sounds or white noise instead"
                        }
                    ),
                    WellnessRecommendation(
                        id="sadness_social_1",
                        action="Reach out to a friend or family member",
                        duration="10-15 minutes",
                        type=WellnessCategory.SOCIAL,
                        priority=4,
                        confidence="high",
                        rationale="Social connection provides emotional support and perspective",
                        adaptations={
                            "user_mentions_social_anxiety": "Send a text to someone close instead of calling",
                            "user_mentions_supportive_person": "Consider reaching out to {supportive_person} who you mentioned helps"
                        }
                    )
                ],
                "short_term": [
                    WellnessRecommendation(
                        id="sadness_walk_1",
                        action="Plan a gentle walk in nature this afternoon",
                        duration="20-30 minutes",
                        type=WellnessCategory.PHYSICAL_ACTIVITY,
                        priority=3,
                        confidence="high",
                        rationale="Physical activity and nature exposure boost mood-regulating neurotransmitters",
                        adaptations={
                            "user_mentions_loving_walks": "Take that walk in {favorite_location} you mentioned enjoying",
                            "user_mentions_mobility_issues": "Try gentle stretching by a window with natural light instead",
                            "weather_mentioned_as_trigger": "Consider an indoor activity if weather is affecting your mood"
                        }
                    ),
                    WellnessRecommendation(
                        id="sadness_social_2",
                        action="Schedule a video call with someone who makes you laugh",
                        duration="30-60 minutes",
                        type=WellnessCategory.SOCIAL,
                        priority=2,
                        confidence="medium",
                        rationale="Laughter releases endorphins and strengthens social bonds",
                        adaptations={
                            "user_mentions_funny_friend": "Call {funny_friend} who always makes you smile",
                            "user_prefers_in_person": "Plan to meet {friend} in person if possible"
                        }
                    )
                ],
                "long_term": [
                    WellnessRecommendation(
                        id="sadness_support_group_1",
                        action="Consider joining a support group",
                        duration="ongoing",
                        type=WellnessCategory.SOCIAL,
                        priority=2,
                        confidence="medium",
                        rationale="Peer support provides understanding and coping strategies",
                        adaptations={
                            "user_mentions_specific_struggles": "Look for support groups focused on {specific_struggle}",
                            "user_mentions_social_anxiety": "Consider online support groups to start"
                        }
                    ),
                    WellnessRecommendation(
                        id="sadness_exercise_routine_1",
                        action="Develop a regular exercise routine",
                        duration="ongoing",
                        type=WellnessCategory.PHYSICAL_ACTIVITY,
                        priority=3,
                        confidence="high",
                        rationale="Regular exercise is as effective as medication for mild to moderate depression",
                        adaptations={
                            "user_mentions_enjoying_activity": "Build a routine around {enjoyed_activity}",
                            "user_mentions_time_constraints": "Start with just 10 minutes of {simple_activity} daily"
                        }
                    )
                ]
            },
            "anxiety": {
                "immediate": [
                    WellnessRecommendation(
                        id="anxiety_grounding_1",
                        action="Use the 5-4-3-2-1 grounding technique",
                        duration="3-5 minutes",
                        type=WellnessCategory.MINDFULNESS,
                        priority=4,
                        confidence="high",
                        rationale="Grounding techniques redirect attention from anxious thoughts to present moment",
                        instructions="Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste",
                        adaptations={
                            "user_mentions_grounding_helps": "Use that grounding technique you mentioned works for you",
                            "user_in_public": "Try the discrete version: just focus on 5 things you can see and 3 you can hear"
                        }
                    ),
                    WellnessRecommendation(
                        id="anxiety_muscle_relaxation_1",
                        action="Practice progressive muscle relaxation",
                        duration="5-10 minutes",
                        type=WellnessCategory.PHYSICAL_ACTIVITY,
                        priority=3,
                        confidence="high",
                        rationale="Physical relaxation reduces anxiety symptoms and muscle tension",
                        instructions="Tense and release each muscle group, starting from your toes",
                        adaptations={
                            "user_mentions_physical_tension": "Focus especially on your {tense_areas} that you mentioned feeling tight",
                            "user_mentions_time_pressure": "Try the quick 2-minute version focusing just on shoulders and jaw"
                        }
                    )
                ],
                "short_term": [
                    WellnessRecommendation(
                        id="anxiety_meditation_1",
                        action="Try a 10-minute guided meditation",
                        duration="10 minutes",
                        type=WellnessCategory.MINDFULNESS,
                        priority=3,
                        confidence="high",
                        rationale="Meditation reduces anxiety by calming the nervous system",
                        adaptations={
                            "user_mentions_meditation_app": "Use that {meditation_app} you mentioned liking",
                            "user_new_to_meditation": "Start with a simple breathing meditation"
                        }
                    ),
                    WellnessRecommendation(
                        id="anxiety_light_exercise_1",
                        action="Engage in light physical activity",
                        duration="15-30 minutes",
                        type=WellnessCategory.PHYSICAL_ACTIVITY,
                        priority=2,
                        confidence="medium",
                        rationale="Physical activity helps metabolize stress hormones",
                        adaptations={
                            "user_mentions_exercise_helps": "Do that {preferred_exercise} that you said helps your anxiety",
                            "user_mentions_low_energy": "Try gentle yoga or stretching instead"
                        }
                    )
                ],
                "long_term": [
                    WellnessRecommendation(
                        id="anxiety_cbt_1",
                        action="Learn cognitive behavioral techniques",
                        duration="ongoing",
                        type=WellnessCategory.COGNITIVE,
                        priority=4,
                        confidence="high",
                        rationale="CBT is the gold standard treatment for anxiety disorders",
                        adaptations={
                            "user_mentions_negative_thoughts": "Focus on techniques for {specific_thought_patterns} you mentioned",
                            "user_mentions_therapy_interest": "Consider finding a CBT therapist to guide you"
                        }
                    ),
                    WellnessRecommendation(
                        id="anxiety_sleep_schedule_1",
                        action="Establish a regular sleep schedule",
                        duration="ongoing",
                        type=WellnessCategory.SELF_CARE,
                        priority=3,
                        confidence="high",
                        rationale="Poor sleep significantly worsens anxiety symptoms",
                        adaptations={
                            "user_mentions_sleep_issues": "Address the {sleep_issues} you mentioned first",
                            "user_mentions_work_schedule": "Work within your {work_schedule} constraints"
                        }
                    )
                ]
            },
            "depression": {
                "immediate": [
                    WellnessRecommendation(
                        id="depression_gentle_breathing_1",
                        action="Practice gentle, compassionate breathing",
                        duration="3-5 minutes",
                        type=WellnessCategory.BREATHING,
                        priority=4,
                        confidence="high",
                        rationale="Gentle breathing can provide immediate relief from overwhelming feelings",
                        instructions="Breathe in for 4 counts, hold gently for 2, exhale slowly for 6. Be kind to yourself.",
                        adaptations={
                            "user_mentions_panic": "Focus only on the exhale - let it be longer and slower than the inhale",
                            "user_mentions_physical_tension": "With each exhale, let your shoulders drop and soften"
                        }
                    ),
                    WellnessRecommendation(
                        id="depression_basic_needs_1",
                        action="Check in with your basic needs",
                        duration="5-10 minutes",
                        type=WellnessCategory.SELF_CARE,
                        priority=5,
                        confidence="high",
                        rationale="Depression often makes us neglect basic needs, which worsens symptoms",
                        instructions="Have you eaten today? Had water? When did you last sleep? Address one basic need.",
                        adaptations={
                            "user_mentions_not_eating": "Try to have something small and nourishing, even if you don't feel hungry",
                            "user_mentions_sleep_issues": "Rest your body even if you can't sleep - lie down in a comfortable space"
                        }
                    ),
                    WellnessRecommendation(
                        id="depression_safety_check_1",
                        action="Reach out to someone you trust",
                        duration="10-15 minutes",
                        type=WellnessCategory.SOCIAL,
                        priority=5,
                        confidence="high",
                        rationale="Connection is crucial during depressive episodes - you don't have to face this alone",
                        instructions="Text or call someone who cares about you. You don't have to explain everything.",
                        adaptations={
                            "user_mentions_isolation": "Even a simple 'thinking of you' text to someone can help break isolation",
                            "user_mentions_burden": "Remember: people who care about you want to help, you're not a burden"
                        }
                    )
                ],
                "short_term": [
                    WellnessRecommendation(
                        id="depression_tiny_steps_1",
                        action="Take one very small, manageable step",
                        duration="5-15 minutes",
                        type=WellnessCategory.COGNITIVE,
                        priority=4,
                        confidence="high",
                        rationale="Small accomplishments can help break the cycle of depression and build momentum",
                        instructions="Choose something tiny: brush teeth, make bed, step outside for 2 minutes",
                        adaptations={
                            "user_mentions_overwhelm": "Pick the smallest possible task - even putting on clean clothes counts",
                            "user_mentions_motivation_lack": "You don't need motivation, just move your body through one small action"
                        }
                    ),
                    WellnessRecommendation(
                        id="depression_gentle_movement_1",
                        action="Try gentle movement or stretching",
                        duration="10-20 minutes",
                        type=WellnessCategory.PHYSICAL_ACTIVITY,
                        priority=3,
                        confidence="medium",
                        rationale="Gentle movement can help shift brain chemistry and reduce depression symptoms",
                        instructions="Stretch in bed, walk to the mailbox, or do gentle yoga poses",
                        adaptations={
                            "user_mentions_fatigue": "Even gentle stretching while lying down can help",
                            "user_mentions_outdoor_preference": "Step outside for a few minutes if possible - fresh air helps"
                        }
                    ),
                    WellnessRecommendation(
                        id="depression_comfort_routine_1",
                        action="Create a small comfort routine",
                        duration="15-30 minutes",
                        type=WellnessCategory.SELF_CARE,
                        priority=3,
                        confidence="high",
                        rationale="Gentle self-care routines provide structure and self-compassion during difficult times",
                        instructions="Make tea, take a warm shower, listen to calming music, or wrap in a soft blanket",
                        adaptations={
                            "user_mentions_self_care_difficulty": "Start with just one gentle thing - maybe warm water on your hands",
                            "user_mentions_comfort_items": "Use that {comfort_item} that usually brings you some peace"
                        }
                    )
                ],
                "long_term": [
                    WellnessRecommendation(
                        id="depression_professional_help_1",
                        action="Consider reaching out to a mental health professional",
                        duration="ongoing",
                        type=WellnessCategory.SOCIAL,
                        priority=5,
                        confidence="high",
                        rationale="Professional support is often essential for managing depression effectively",
                        instructions="Research therapists, call your doctor, or contact a mental health helpline",
                        adaptations={
                            "user_mentions_therapy_interest": "Look into {therapy_type} therapists in your area or online",
                            "user_mentions_cost_concerns": "Look into community mental health centers or sliding scale options"
                        }
                    ),
                    WellnessRecommendation(
                        id="depression_support_system_1",
                        action="Build a support network",
                        duration="ongoing",
                        type=WellnessCategory.SOCIAL,
                        priority=4,
                        confidence="high",
                        rationale="Strong social connections are protective against depression and aid recovery",
                        instructions="Join a support group, reconnect with old friends, or find community activities",
                        adaptations={
                            "user_mentions_social_anxiety": "Start with online support groups or forums where you can connect safely",
                            "user_mentions_specific_interests": "Look for groups related to {user_interest} to meet like-minded people"
                        }
                    ),
                    WellnessRecommendation(
                        id="depression_routine_structure_1",
                        action="Develop a gentle daily structure",
                        duration="ongoing",
                        type=WellnessCategory.SELF_CARE,
                        priority=3,
                        confidence="medium",
                        rationale="Gentle routines provide stability and can help manage depression symptoms",
                        instructions="Create a simple morning routine, set regular meal times, or establish a bedtime ritual",
                        adaptations={
                            "user_mentions_chaos": "Start with just one consistent time each day - maybe morning coffee or evening tea",
                            "user_mentions_perfectionism": "Make routines flexible and forgiving - progress, not perfection"
                        }
                    )
                ]
            },
            "anger": {
                "immediate": [
                    WellnessRecommendation(
                        id="anger_breathing_1",
                        action="Take 10 slow, deep breaths to cool down",
                        duration="2-3 minutes",
                        type=WellnessCategory.BREATHING,
                        priority=4,
                        confidence="high",
                        rationale="Deep breathing activates the parasympathetic nervous system to reduce anger",
                        instructions="Count to 4 on inhale, hold for 4, exhale for 6. Focus only on the counting.",
                        adaptations={
                            "user_mentions_rage": "Breathe out longer than you breathe in - this helps calm the nervous system",
                            "user_mentions_physical_tension": "With each exhale, consciously relax your jaw, shoulders, and fists"
                        }
                    ),
                    WellnessRecommendation(
                        id="anger_physical_release_1",
                        action="Release anger energy through safe physical activity",
                        duration="5-10 minutes",
                        type=WellnessCategory.PHYSICAL_ACTIVITY,
                        priority=3,
                        confidence="high",
                        rationale="Physical activity helps metabolize stress hormones from anger",
                        instructions="Do jumping jacks, push-ups, punch a pillow, or go for a brisk walk",
                        adaptations={
                            "user_mentions_gym_access": "Hit the punching bag or do an intense workout to release the energy",
                            "user_mentions_limited_space": "Try wall push-ups, squeeze and release your fists, or stomp your feet"
                        }
                    ),
                    WellnessRecommendation(
                        id="anger_pause_technique_1",
                        action="Use the STOP technique before reacting",
                        duration="1-2 minutes",
                        type=WellnessCategory.COGNITIVE,
                        priority=5,
                        confidence="high",
                        rationale="Pausing prevents impulsive reactions that you might regret later",
                        instructions="STOP what you're doing, TAKE a breath, OBSERVE your feelings, PROCEED mindfully",
                        adaptations={
                            "user_mentions_impulsivity": "Count to 10 slowly before saying or doing anything",
                            "user_mentions_relationship_conflict": "Tell the other person 'I need a moment to collect my thoughts'"
                        }
                    ),
                    WellnessRecommendation(
                        id="anger_cold_water_1",
                        action="Use cold water to reset your nervous system",
                        duration="2-3 minutes",
                        type=WellnessCategory.PHYSICAL_ACTIVITY,
                        priority=2,
                        confidence="medium",
                        rationale="Cold water activates the vagus nerve and can quickly reduce anger intensity",
                        instructions="Splash cold water on your face, hold ice cubes, or drink cold water slowly",
                        adaptations={
                            "user_mentions_hot_feeling": "Focus on the cooling sensation - let it calm your whole body",
                            "user_at_work": "Go to the bathroom and run cold water over your wrists"
                        }
                    )
                ],
                "short_term": [
                    WellnessRecommendation(
                        id="anger_journaling_1",
                        action="Write down what triggered your anger",
                        duration="10-15 minutes",
                        type=WellnessCategory.COGNITIVE,
                        priority=3,
                        confidence="high",
                        rationale="Writing helps process emotions and identify patterns in anger triggers",
                        instructions="Write freely about what happened, how you felt, and what you need",
                        adaptations={
                            "user_mentions_recurring_trigger": "Look for patterns - is this {trigger_type} situation happening often?",
                            "user_mentions_relationship_issues": "Write about your needs and boundaries in this relationship"
                        }
                    ),
                    WellnessRecommendation(
                        id="anger_problem_solving_1",
                        action="Identify what you can and cannot control",
                        duration="15-20 minutes",
                        type=WellnessCategory.COGNITIVE,
                        priority=4,
                        confidence="high",
                        rationale="Focusing on what you can control reduces frustration and empowers action",
                        instructions="Make two lists: things you can control and things you cannot. Focus energy on the first list.",
                        adaptations={
                            "user_mentions_work_stress": "Focus on your responses, boundaries, and actions at work",
                            "user_mentions_other_people": "You can't control others, but you can control your reactions and choices"
                        }
                    ),
                    WellnessRecommendation(
                        id="anger_communication_prep_1",
                        action="Prepare for constructive communication",
                        duration="20-30 minutes",
                        type=WellnessCategory.SOCIAL,
                        priority=3,
                        confidence="medium",
                        rationale="Planned communication is more effective than reactive responses",
                        instructions="Think about what you need to say, practice 'I' statements, and choose the right time",
                        adaptations={
                            "user_mentions_conflict_avoidance": "Start with writing down your thoughts before speaking",
                            "user_mentions_communication_skills": "Use that {communication_technique} you've learned before"
                        }
                    ),
                    WellnessRecommendation(
                        id="anger_self_compassion_1",
                        action="Practice self-compassion for feeling angry",
                        duration="10-15 minutes",
                        type=WellnessCategory.MINDFULNESS,
                        priority=2,
                        confidence="medium",
                        rationale="Self-compassion reduces shame about anger and promotes emotional regulation",
                        instructions="Acknowledge that anger is human, treat yourself with kindness, and recognize your pain",
                        adaptations={
                            "user_mentions_anger_shame": "Anger often signals that something important to you has been threatened",
                            "user_mentions_self_criticism": "Talk to yourself like you would comfort a good friend"
                        }
                    )
                ],
                "long_term": [
                    WellnessRecommendation(
                        id="anger_management_1",
                        action="Learn structured anger management techniques",
                        duration="ongoing",
                        type=WellnessCategory.COGNITIVE,
                        priority=4,
                        confidence="high",
                        rationale="Structured anger management prevents escalation and improves relationships",
                        instructions="Take an anger management class, read books on anger, or work with a therapist",
                        adaptations={
                            "user_mentions_relationship_problems": "Consider couples therapy if anger is affecting your relationships",
                            "user_mentions_work_issues": "Look into workplace conflict resolution or communication training"
                        }
                    ),
                    WellnessRecommendation(
                        id="anger_stress_management_1",
                        action="Develop comprehensive stress management practices",
                        duration="ongoing",
                        type=WellnessCategory.SELF_CARE,
                        priority=3,
                        confidence="high",
                        rationale="Managing overall stress reduces anger frequency and intensity",
                        instructions="Regular exercise, adequate sleep, healthy diet, and relaxation practices",
                        adaptations={
                            "user_mentions_chronic_stress": "Address the underlying stressors that make you more prone to anger",
                            "user_mentions_lifestyle_factors": "Focus on {lifestyle_area} that you mentioned affects your mood"
                        }
                    ),
                    WellnessRecommendation(
                        id="anger_boundary_setting_1",
                        action="Learn to set and maintain healthy boundaries",
                        duration="ongoing",
                        type=WellnessCategory.SOCIAL,
                        priority=4,
                        confidence="high",
                        rationale="Clear boundaries prevent many anger-triggering situations",
                        instructions="Practice saying no, communicate your limits clearly, and enforce consequences",
                        adaptations={
                            "user_mentions_people_pleasing": "Start with small boundaries and work up to bigger ones",
                            "user_mentions_workplace_boundaries": "Learn professional ways to set limits at work"
                        }
                    )
                ]
            },
            "anxiety": {
                "immediate": [
                    WellnessRecommendation(
                        id="anxiety_grounding_1",
                        action="Use the 5-4-3-2-1 grounding technique",
                        duration="3-5 minutes",
                        type=WellnessCategory.MINDFULNESS,
                        priority=4,
                        confidence="high",
                        rationale="Grounding techniques redirect attention from anxious thoughts to present moment",
                        instructions="Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste",
                        adaptations={
                            "user_mentions_grounding_helps": "Use that grounding technique you mentioned works for you",
                            "user_in_public": "Try the discrete version: just focus on 5 things you can see and 3 you can hear"
                        }
                    ),
                    WellnessRecommendation(
                        id="anxiety_box_breathing_1",
                        action="Practice box breathing to calm your nervous system",
                        duration="3-5 minutes",
                        type=WellnessCategory.BREATHING,
                        priority=4,
                        confidence="high",
                        rationale="Box breathing regulates the nervous system and reduces anxiety symptoms",
                        instructions="Breathe in for 4, hold for 4, exhale for 4, hold for 4. Repeat.",
                        adaptations={
                            "user_mentions_panic": "If 4 counts feels too long, try 3-3-3-3 or even 2-2-2-2",
                            "user_mentions_breathing_difficulty": "Focus more on the exhale being longer than the inhale"
                        }
                    ),
                    WellnessRecommendation(
                        id="anxiety_muscle_relaxation_1",
                        action="Practice progressive muscle relaxation",
                        duration="5-10 minutes",
                        type=WellnessCategory.PHYSICAL_ACTIVITY,
                        priority=3,
                        confidence="high",
                        rationale="Physical relaxation reduces anxiety symptoms and muscle tension",
                        instructions="Tense and release each muscle group, starting from your toes",
                        adaptations={
                            "user_mentions_physical_tension": "Focus especially on your {tense_areas} that you mentioned feeling tight",
                            "user_mentions_time_pressure": "Try the quick 2-minute version focusing just on shoulders and jaw"
                        }
                    )
                ],
                "short_term": [
                    WellnessRecommendation(
                        id="anxiety_meditation_1",
                        action="Try a 10-minute guided meditation",
                        duration="10 minutes",
                        type=WellnessCategory.MINDFULNESS,
                        priority=3,
                        confidence="high",
                        rationale="Meditation reduces anxiety by calming the nervous system",
                        adaptations={
                            "user_mentions_meditation_app": "Use that {meditation_app} you mentioned liking",
                            "user_new_to_meditation": "Start with a simple breathing meditation"
                        }
                    ),
                    WellnessRecommendation(
                        id="anxiety_light_exercise_1",
                        action="Engage in light physical activity",
                        duration="15-30 minutes",
                        type=WellnessCategory.PHYSICAL_ACTIVITY,
                        priority=2,
                        confidence="medium",
                        rationale="Physical activity helps metabolize stress hormones",
                        adaptations={
                            "user_mentions_exercise_helps": "Do that {preferred_exercise} that you said helps your anxiety",
                            "user_mentions_low_energy": "Try gentle yoga or stretching instead"
                        }
                    ),
                    WellnessRecommendation(
                        id="anxiety_worry_time_1",
                        action="Set aside 'worry time' to process anxious thoughts",
                        duration="15-20 minutes",
                        type=WellnessCategory.COGNITIVE,
                        priority=3,
                        confidence="medium",
                        rationale="Scheduled worry time prevents anxiety from taking over your entire day",
                        instructions="Write down worries for 15 minutes, then consciously shift focus to the present",
                        adaptations={
                            "user_mentions_rumination": "Set a timer - when it goes off, you're done worrying for today",
                            "user_mentions_specific_worry": "Focus on {specific_worry} and what actions you can actually take"
                        }
                    )
                ],
                "long_term": [
                    WellnessRecommendation(
                        id="anxiety_cbt_1",
                        action="Learn cognitive behavioral techniques",
                        duration="ongoing",
                        type=WellnessCategory.COGNITIVE,
                        priority=4,
                        confidence="high",
                        rationale="CBT is the gold standard treatment for anxiety disorders",
                        adaptations={
                            "user_mentions_negative_thoughts": "Focus on techniques for {specific_thought_patterns} you mentioned",
                            "user_mentions_therapy_interest": "Consider finding a CBT therapist to guide you"
                        }
                    ),
                    WellnessRecommendation(
                        id="anxiety_sleep_schedule_1",
                        action="Establish a regular sleep schedule",
                        duration="ongoing",
                        type=WellnessCategory.SELF_CARE,
                        priority=3,
                        confidence="high",
                        rationale="Poor sleep significantly worsens anxiety symptoms",
                        adaptations={
                            "user_mentions_sleep_issues": "Address the {sleep_issues} you mentioned first",
                            "user_mentions_work_schedule": "Work within your {work_schedule} constraints"
                        }
                    )
                ]
            },
            "fear": {
                "immediate": [
                    WellnessRecommendation(
                        id="fear_grounding_1",
                        action="Use grounding techniques to feel safe",
                        duration="5-10 minutes",
                        type=WellnessCategory.MINDFULNESS,
                        priority=4,
                        confidence="high",
                        rationale="Grounding helps reconnect with safety in the present moment",
                        instructions="Feel your feet on the ground, name objects around you, remind yourself you are safe now",
                        adaptations={
                            "user_mentions_panic": "Focus on slow, deep breathing while naming 5 things you can see",
                            "user_mentions_specific_fear": "Remind yourself that {specific_fear} is not happening right now"
                        }
                    ),
                    WellnessRecommendation(
                        id="fear_safety_check_1",
                        action="Assess your actual safety in this moment",
                        duration="2-3 minutes",
                        type=WellnessCategory.COGNITIVE,
                        priority=5,
                        confidence="high",
                        rationale="Fear often makes us feel unsafe when we are actually secure",
                        instructions="Look around, check doors/windows, remind yourself of your current safe location",
                        adaptations={
                            "user_mentions_trauma": "Use your established safety cues and grounding objects",
                            "user_mentions_phobia": "Remind yourself that {phobia_object} cannot actually harm you right now"
                        }
                    ),
                    WellnessRecommendation(
                        id="fear_comfort_object_1",
                        action="Hold or touch something comforting",
                        duration="5 minutes",
                        type=WellnessCategory.SELF_CARE,
                        priority=2,
                        confidence="medium",
                        rationale="Physical comfort objects can provide immediate emotional regulation",
                        instructions="Hold a soft blanket, pet, stuffed animal, or meaningful object",
                        adaptations={
                            "user_mentions_comfort_item": "Use that {comfort_item} that usually helps you feel safe",
                            "user_away_from_home": "Find something soft to touch - even your own hands or arms"
                        }
                    )
                ],
                "short_term": [
                    WellnessRecommendation(
                        id="fear_support_1",
                        action="Talk to someone you trust about your fears",
                        duration="20-30 minutes",
                        type=WellnessCategory.SOCIAL,
                        priority=3,
                        confidence="high",
                        rationale="Sharing fears reduces their power and provides perspective",
                        adaptations={
                            "user_mentions_supportive_person": "Reach out to {supportive_person} who you trust",
                            "user_mentions_shame": "Remember that having fears is human - you're not weak or broken"
                        }
                    ),
                    WellnessRecommendation(
                        id="fear_information_1",
                        action="Gather factual information about your fear",
                        duration="15-30 minutes",
                        type=WellnessCategory.COGNITIVE,
                        priority=2,
                        confidence="medium",
                        rationale="Understanding fears with facts can reduce their emotional impact",
                        instructions="Research from reliable sources, talk to experts, or learn coping strategies",
                        adaptations={
                            "user_mentions_health_fear": "Consult with a healthcare provider for accurate medical information",
                            "user_mentions_irrational_fear": "Focus on learning about how fears work rather than the fear object itself"
                        }
                    ),
                    WellnessRecommendation(
                        id="fear_self_care_1",
                        action="Engage in extra self-care and comfort",
                        duration="30-60 minutes",
                        type=WellnessCategory.SELF_CARE,
                        priority=3,
                        confidence="high",
                        rationale="Self-care helps restore emotional balance after fear responses",
                        instructions="Take a warm bath, watch comfort shows, eat nourishing food, rest",
                        adaptations={
                            "user_mentions_self_care_preferences": "Do that {self_care_activity} that usually comforts you",
                            "user_mentions_guilt_about_self_care": "Remember: taking care of yourself helps you handle challenges better"
                        }
                    )
                ],
                "long_term": [
                    WellnessRecommendation(
                        id="fear_exposure_1",
                        action="Gradually face your fears in small steps",
                        duration="ongoing",
                        type=WellnessCategory.COGNITIVE,
                        priority=3,
                        confidence="medium",
                        rationale="Gradual exposure reduces fear through habituation",
                        adaptations={
                            "user_mentions_specific_phobia": "Work with a therapist on exposure therapy for {specific_phobia}",
                            "user_mentions_trauma": "Only do exposure work with professional trauma-informed support"
                        }
                    ),
                    WellnessRecommendation(
                        id="fear_therapy_1",
                        action="Consider therapy for persistent fears",
                        duration="ongoing",
                        type=WellnessCategory.SOCIAL,
                        priority=4,
                        confidence="high",
                        rationale="Professional help is often needed for fears that interfere with daily life",
                        instructions="Look into CBT, EMDR, or other evidence-based therapies for fear and anxiety",
                        adaptations={
                            "user_mentions_trauma_history": "Seek trauma-informed therapists who specialize in PTSD treatment",
                            "user_mentions_specific_phobia": "Look for therapists who specialize in phobia treatment"
                        }
                    )
                ]
            },
            "surprise": {
                "immediate": [
                    WellnessRecommendation(
                        id="surprise_pause_1",
                        action="Take a moment to process what just happened",
                        duration="2-3 minutes",
                        type=WellnessCategory.MINDFULNESS,
                        priority=3,
                        confidence="high",
                        rationale="Surprise can be overwhelming - taking time to process helps integration",
                        instructions="Take a few deep breaths and let yourself feel whatever emotions are coming up",
                        adaptations={
                            "user_mentions_good_surprise": "Savor this positive surprise - let yourself fully feel the joy",
                            "user_mentions_shock": "It's okay to feel disoriented - surprise can be a lot to process"
                        }
                    ),
                    WellnessRecommendation(
                        id="surprise_grounding_1",
                        action="Ground yourself in the present moment",
                        duration="3-5 minutes",
                        type=WellnessCategory.MINDFULNESS,
                        priority=2,
                        confidence="medium",
                        rationale="Surprise can make us feel unmoored - grounding restores stability",
                        instructions="Feel your feet on the ground, notice your surroundings, take slow breaths",
                        adaptations={
                            "user_mentions_disorientation": "Focus on physical sensations to reconnect with your body",
                            "user_mentions_overwhelm": "Just focus on breathing - everything else can wait"
                        }
                    )
                ],
                "short_term": [
                    WellnessRecommendation(
                        id="surprise_process_1",
                        action="Talk through or write about the surprise",
                        duration="15-30 minutes",
                        type=WellnessCategory.COGNITIVE,
                        priority=3,
                        confidence="high",
                        rationale="Processing surprise helps integrate the experience and plan next steps",
                        instructions="Call a friend, write in a journal, or just talk out loud about what happened",
                        adaptations={
                            "user_mentions_good_news": "Share this exciting news with people who will celebrate with you",
                            "user_mentions_difficult_surprise": "Process with someone who can provide support and perspective"
                        }
                    ),
                    WellnessRecommendation(
                        id="surprise_adjust_1",
                        action="Adjust your plans and expectations as needed",
                        duration="20-30 minutes",
                        type=WellnessCategory.COGNITIVE,
                        priority=2,
                        confidence="medium",
                        rationale="Surprises often require us to adapt our plans and mental models",
                        instructions="Think about what this surprise means for your day, week, or future plans",
                        adaptations={
                            "user_mentions_disrupted_plans": "It's okay to feel frustrated about changed plans - that's normal",
                            "user_mentions_opportunity": "Consider how this surprise might open new possibilities"
                        }
                    )
                ],
                "long_term": [
                    WellnessRecommendation(
                        id="surprise_flexibility_1",
                        action="Build resilience and flexibility for future surprises",
                        duration="ongoing",
                        type=WellnessCategory.COGNITIVE,
                        priority=2,
                        confidence="medium",
                        rationale="Life is full of surprises - building adaptability helps us handle them better",
                        instructions="Practice mindfulness, build support networks, and develop coping strategies",
                        adaptations={
                            "user_mentions_control_issues": "Work on accepting uncertainty as a normal part of life",
                            "user_mentions_anxiety_about_change": "Develop tools for managing anxiety around unexpected events"
                        }
                    )
                ]
            },
            "neutral": {
                "immediate": [
                    WellnessRecommendation(
                        id="neutral_check_in_1",
                        action="Take a moment to check in with yourself",
                        duration="2-3 minutes",
                        type=WellnessCategory.MINDFULNESS,
                        priority=2,
                        confidence="medium",
                        rationale="Regular self-check-ins maintain emotional awareness"
                    )
                ],
                "short_term": [
                    WellnessRecommendation(
                        id="neutral_gratitude_1",
                        action="Write down three things you're grateful for",
                        duration="5 minutes",
                        type=WellnessCategory.COGNITIVE,
                        priority=2,
                        confidence="medium",
                        rationale="Gratitude practice enhances overall well-being"
                    )
                ],
                "long_term": [
                    WellnessRecommendation(
                        id="neutral_routine_1",
                        action="Maintain healthy daily routines",
                        duration="ongoing",
                        type=WellnessCategory.SELF_CARE,
                        priority=3,
                        confidence="high",
                        rationale="Consistent routines support emotional stability"
                    )
                ]
            }
        }
    
    def _load_adaptation_patterns(self) -> Dict[str, str]:
        """Load patterns for adapting recommendations based on user context"""
        return {
            "user_mentions_breathing_helps": r"breathing|breath|deep breath",
            "user_mentions_specific_music": r"music|song|playlist|listen",
            "user_mentions_social_anxiety": r"social anxiety|shy|nervous around people",
            "user_mentions_supportive_person": r"my (friend|mom|dad|sister|brother|partner)",
            "user_mentions_loving_walks": r"walk|walking|hike|hiking",
            "user_mentions_mobility_issues": r"can't walk|wheelchair|mobility|physical limitation",
            "weather_mentioned_as_trigger": r"weather|rain|cold|hot|seasonal",
            "user_mentions_funny_friend": r"funny|makes me laugh|humor",
            "user_mentions_specific_struggles": r"depression|anxiety|grief|trauma|addiction",
            "user_mentions_enjoying_activity": r"love|enjoy|like doing|favorite activity",
            "user_mentions_time_constraints": r"no time|busy|schedule|work too much",
            "user_mentions_grounding_helps": r"grounding|5-4-3-2-1|present moment",
            "user_mentions_physical_tension": r"tense|tight|sore|stiff|shoulders|neck|jaw",
            "user_mentions_meditation_app": r"headspace|calm|insight timer|meditation app",
            "user_new_to_meditation": r"never meditated|new to meditation|don't know how",
            "user_mentions_exercise_helps": r"exercise|workout|gym|run|yoga",
            "user_mentions_low_energy": r"tired|exhausted|no energy|fatigue",
            "user_mentions_negative_thoughts": r"negative thoughts|worry|catastrophic|worst case",
            "user_mentions_therapy_interest": r"therapy|therapist|counseling|professional help",
            "user_mentions_sleep_issues": r"can't sleep|insomnia|sleep problems|wake up",
            "user_mentions_work_schedule": r"work schedule|shift work|irregular hours"
        }
    
    def generate_recommendations(self, emotion: str, mood_insights: Dict, user_history: Dict, user_id: str) -> List[WellnessRecommendation]:
        """Generate personalized wellness recommendations"""
        if emotion not in self.base_recommendations:
            emotion = "neutral"
        
        all_recommendations = []
        
        # Get base recommendations for the emotion
        for timeframe, recommendations in self.base_recommendations[emotion].items():
            for rec in recommendations:
                # Create a copy to avoid modifying the original
                personalized_rec = self._personalize_recommendation(rec, mood_insights, user_history, user_id)
                personalized_rec.timeframe = timeframe
                all_recommendations.append(personalized_rec)
        
        # Sort by priority and return top recommendations
        sorted_recs = sorted(all_recommendations, key=lambda x: x.priority, reverse=True)
        return sorted_recs[:8]  # Return top 8 recommendations
    
    def _personalize_recommendation(self, rec: WellnessRecommendation, mood_insights: Dict, user_history: Dict, user_id: str) -> WellnessRecommendation:
        """Personalize a recommendation based on user context"""
        personalized_rec = WellnessRecommendation(
            id=rec.id,
            action=rec.action,
            duration=rec.duration,
            type=rec.type,
            priority=rec.priority,
            confidence=rec.confidence,
            rationale=rec.rationale,
            instructions=rec.instructions,
            adaptations=rec.adaptations
        )
        
        # Check for adaptations based on mood insights and user history
        if rec.adaptations:
            for condition, adaptation in rec.adaptations.items():
                if self._condition_matches(condition, mood_insights, user_history):
                    # Apply the adaptation
                    personalized_rec.action = self._apply_adaptation(adaptation, mood_insights, user_history)
                    personalized_rec.personalized = True
                    personalized_rec.priority += 1  # Boost priority for personalized recommendations
                    break
        
        # Adjust priority based on user effectiveness data
        if user_id in self.user_effectiveness_data:
            effectiveness = self._get_strategy_effectiveness(user_id, rec.type)
            if effectiveness > 0.7:
                personalized_rec.priority += 2
                personalized_rec.confidence = "high"
                personalized_rec.rationale += f" (This type of strategy has worked well for you before)"
            elif effectiveness < 0.3:
                personalized_rec.priority -= 1
                personalized_rec.confidence = "low"
        
        return personalized_rec
    
    def _condition_matches(self, condition: str, mood_insights: Dict, user_history: Dict) -> bool:
        """Check if a condition matches the user's context"""
        if condition not in self.adaptation_patterns:
            return False
        
        pattern = self.adaptation_patterns[condition]
        
        # Check in recent conversations
        recent_text = ""
        if 'recent_conversations' in user_history:
            recent_text = " ".join([conv.get('content', '') for conv in user_history['recent_conversations']])
        
        # Check in mood insights
        if 'natural_coping_strategies' in mood_insights:
            recent_text += " " + " ".join([strategy.get('description', '') for strategy in mood_insights['natural_coping_strategies']])
        
        return bool(re.search(pattern, recent_text, re.IGNORECASE))
    
    def _apply_adaptation(self, adaptation: str, mood_insights: Dict, user_history: Dict) -> str:
        """Apply adaptation by replacing placeholders with user-specific information"""
        adapted_text = adaptation
        
        # Replace common placeholders
        placeholders = {
            '{music_preference}': self._extract_music_preference(mood_insights, user_history),
            '{supportive_person}': self._extract_supportive_person(mood_insights, user_history),
            '{favorite_location}': self._extract_favorite_location(mood_insights, user_history),
            '{funny_friend}': self._extract_funny_friend(mood_insights, user_history),
            '{specific_struggle}': self._extract_specific_struggle(mood_insights, user_history),
            '{enjoyed_activity}': self._extract_enjoyed_activity(mood_insights, user_history),
            '{simple_activity}': self._extract_simple_activity(mood_insights, user_history),
            '{tense_areas}': self._extract_tense_areas(mood_insights, user_history),
            '{meditation_app}': self._extract_meditation_app(mood_insights, user_history),
            '{preferred_exercise}': self._extract_preferred_exercise(mood_insights, user_history),
            '{specific_thought_patterns}': self._extract_thought_patterns(mood_insights, user_history),
            '{sleep_issues}': self._extract_sleep_issues(mood_insights, user_history),
            '{work_schedule}': self._extract_work_schedule(mood_insights, user_history)
        }
        
        for placeholder, value in placeholders.items():
            if placeholder in adapted_text and value:
                adapted_text = adapted_text.replace(placeholder, value)
        
        return adapted_text
    
    def _extract_music_preference(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract user's music preferences from context"""
        # This would analyze conversation history for music mentions
        return "uplifting"  # Default fallback
    
    def _extract_supportive_person(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract mentions of supportive people"""
        return "someone close to you"  # Default fallback
    
    def _extract_favorite_location(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract favorite locations for activities"""
        return "your favorite spot"  # Default fallback
    
    def _extract_funny_friend(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract mentions of funny friends"""
        return "that friend who makes you laugh"  # Default fallback
    
    def _extract_specific_struggle(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract specific struggles mentioned"""
        return "your specific challenges"  # Default fallback
    
    def _extract_enjoyed_activity(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract activities the user enjoys"""
        return "activities you enjoy"  # Default fallback
    
    def _extract_simple_activity(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract simple activities for busy users"""
        return "walking or stretching"  # Default fallback
    
    def _extract_tense_areas(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract areas of physical tension"""
        return "shoulders and neck"  # Default fallback
    
    def _extract_meditation_app(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract preferred meditation app"""
        return "a meditation app"  # Default fallback
    
    def _extract_preferred_exercise(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract preferred exercise type"""
        return "your preferred exercise"  # Default fallback
    
    def _extract_thought_patterns(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract specific negative thought patterns"""
        return "negative thought patterns"  # Default fallback
    
    def _extract_sleep_issues(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract specific sleep issues"""
        return "sleep difficulties"  # Default fallback
    
    def _extract_work_schedule(self, mood_insights: Dict, user_history: Dict) -> str:
        """Extract work schedule constraints"""
        return "work schedule"  # Default fallback
    
    def _get_strategy_effectiveness(self, user_id: str, strategy_type: WellnessCategory) -> float:
        """Get effectiveness score for a strategy type for a specific user"""
        if user_id not in self.user_effectiveness_data:
            return 0.5  # Neutral effectiveness for new users
        
        user_data = self.user_effectiveness_data[user_id]
        if strategy_type.value not in user_data:
            return 0.5
        
        return user_data[strategy_type.value].get('effectiveness', 0.5)
    
    def record_feedback(self, user_id: str, feedback: UserFeedback):
        """Record user feedback on recommendations"""
        if user_id not in self.user_effectiveness_data:
            self.user_effectiveness_data[user_id] = {}
        
        # Find the recommendation to get its type
        rec_type = self._get_recommendation_type(feedback.recommendation_id)
        if rec_type:
            if rec_type.value not in self.user_effectiveness_data[user_id]:
                self.user_effectiveness_data[user_id][rec_type.value] = {
                    'total_attempts': 0,
                    'successful_attempts': 0,
                    'effectiveness': 0.5,
                    'feedback_history': []
                }
            
            strategy_data = self.user_effectiveness_data[user_id][rec_type.value]
            strategy_data['total_attempts'] += 1
            strategy_data['feedback_history'].append(feedback)
            
            if feedback.completed and feedback.rating and feedback.rating >= 3:
                strategy_data['successful_attempts'] += 1
            
            # Recalculate effectiveness
            strategy_data['effectiveness'] = strategy_data['successful_attempts'] / strategy_data['total_attempts']
    
    def _get_recommendation_type(self, recommendation_id: str) -> Optional[WellnessCategory]:
        """Get the type of a recommendation by its ID"""
        for emotion_recs in self.base_recommendations.values():
            for timeframe_recs in emotion_recs.values():
                for rec in timeframe_recs:
                    if rec.id == recommendation_id:
                        return rec.type
        return None

# Global wellness engine instance
wellness_engine = WellnessRecommendationEngine()