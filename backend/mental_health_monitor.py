"""
Mental Health Monitor
Silently tracks emotional patterns across recent messages and detects
prolonged negative emotional states without interfering with normal chat flow.
"""

from collections import deque
from typing import Dict, Optional
from datetime import datetime

# Emotions considered negative for risk tracking
NEGATIVE_EMOTIONS = {"sadness", "anger", "fear", "disgust", "depression", "anxiety"}

# How many recent messages to look at
WINDOW_SIZE = 5

# How many of those must be negative to trigger "at risk"
RISK_THRESHOLD = 3

# Per-user sliding window: user_id -> deque of (emotion, timestamp)
_emotion_windows: Dict[int, deque] = {}


def record_emotion(user_id: int, emotion: str) -> None:
    """Record a new emotion for a user. Call this on every prediction."""
    if user_id not in _emotion_windows:
        _emotion_windows[user_id] = deque(maxlen=WINDOW_SIZE)
    _emotion_windows[user_id].append({
        "emotion": emotion.lower().strip(),
        "timestamp": datetime.now().isoformat()
    })


def assess_risk(user_id: int) -> dict:
    """
    Assess whether the user is at risk based on their recent emotion history.

    Returns:
        {
            "risk_detected": bool,
            "alert_message": str | None,
            "suggestions": list[str] | None,
            "negative_count": int,
            "window_size": int
        }
    """
    window = _emotion_windows.get(user_id)

    # Not enough data yet
    if not window or len(window) < RISK_THRESHOLD:
        return {"risk_detected": False}

    recent = list(window)
    negative_count = sum(
        1 for entry in recent
        if entry["emotion"] in NEGATIVE_EMOTIONS
    )

    if negative_count < RISK_THRESHOLD:
        return {"risk_detected": False}

    # Determine dominant negative emotion for a more personalised message
    emotion_counts: Dict[str, int] = {}
    for entry in recent:
        e = entry["emotion"]
        if e in NEGATIVE_EMOTIONS:
            emotion_counts[e] = emotion_counts.get(e, 0) + 1

    dominant = max(emotion_counts, key=emotion_counts.get)

    alert_message, suggestions = _build_alert(dominant)

    return {
        "risk_detected": True,
        "alert_message": alert_message,
        "suggestions": suggestions,
        "negative_count": negative_count,
        "window_size": len(recent)
    }


def clear_window(user_id: int) -> None:
    """Clear the emotion window for a user (e.g. on logout)."""
    _emotion_windows.pop(user_id, None)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _build_alert(dominant_emotion: str):
    """Return a gentle, human-sounding alert and suggestions for the emotion."""

    messages = {
        "sadness": (
            "I've noticed you might be feeling a bit low lately. "
            "That's completely okay — you're not alone in this."
        ),
        "anger": (
            "It seems like things have been frustrating or overwhelming for you recently. "
            "It's okay to feel that way, and it's okay to take a breath."
        ),
        "fear": (
            "I've picked up on some worry or anxiety in our recent conversations. "
            "Whatever you're going through, you don't have to face it alone."
        ),
        "disgust": (
            "It sounds like something has been really bothering you lately. "
            "Your feelings are valid, and it's okay to talk about it."
        ),
        "depression": (
            "I've noticed a persistent heaviness in how you've been feeling. "
            "Please know that support is available and you deserve care."
        ),
        "anxiety": (
            "You seem to have been carrying a lot of worry recently. "
            "It's okay to slow down and reach out for support."
        ),
    }

    suggestions = {
        "sadness": [
            "Talk to someone you trust — a friend, family member, or counsellor.",
            "iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7)",
            "Try a short walk, some music, or just rest — small steps matter.",
            "If things feel too heavy, please consider speaking to a mental health professional.",
        ],
        "anger": [
            "Try stepping away for a few minutes — even a short break can help.",
            "Talk to someone you trust about what's been frustrating you.",
            "iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7)",
            "If anger feels uncontrollable, speaking to a counsellor can really help.",
        ],
        "fear": [
            "Grounding exercises can help — try the 5-4-3-2-1 technique.",
            "Talk to someone you trust about what's worrying you.",
            "iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7)",
            "A mental health professional can help you work through persistent anxiety.",
        ],
        "disgust": [
            "Talk to someone you trust about what's been bothering you.",
            "iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7)",
            "Journaling your feelings can sometimes help make sense of them.",
        ],
        "depression": [
            "Please consider reaching out to a mental health professional.",
            "iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7)",
            "NIMHANS Helpline: 080-46110007 | Snehi: 044-24640050",
            "You are not alone — support is available and things can get better.",
        ],
        "anxiety": [
            "Try slow, deep breathing — inhale for 4 counts, exhale for 6.",
            "Talk to someone you trust about what's been on your mind.",
            "iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7)",
            "A counsellor can help you build tools to manage persistent anxiety.",
        ],
    }

    default_message = (
        "I've noticed you've been going through some difficult emotions recently. "
        "You're not alone, and support is available."
    )
    default_suggestions = [
        "Talk to someone you trust — a friend, family member, or counsellor.",
        "iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345 (24/7)",
        "If things feel overwhelming, please consider speaking to a mental health professional.",
    ]

    return (
        messages.get(dominant_emotion, default_message),
        suggestions.get(dominant_emotion, default_suggestions),
    )
