#!/usr/bin/env python3
"""
Test script for advanced emotion recognition features:
1. Confidence-Based Fusion
2. Emotion Intensity Detection  
3. Context-Aware Empathetic Responses
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from emotion_service import emotion_service

def test_confidence_based_fusion():
    """Test the confidence-based fusion feature"""
    print("🧪 Testing Confidence-Based Fusion...")
    
    # Test case 1: Agreement boost (same emotions)
    result = emotion_service._confidence_based_fusion("joy", 0.7, "joy", 0.6)
    print(f"Same emotions (joy, joy): {result}")
    assert result[2] == "agreement_boost"
    
    # Test case 2: High confidence difference
    result = emotion_service._confidence_based_fusion("sadness", 0.9, "joy", 0.5)
    print(f"High confidence diff: {result}")
    assert result[2] == "text_dominant"
    
    # Test case 3: Compatible emotions
    result = emotion_service._confidence_based_fusion("sadness", 0.6, "fear", 0.6)
    print(f"Compatible emotions: {result}")
    
    print("✅ Confidence-based fusion tests passed!\n")

def test_emotion_intensity():
    """Test emotion intensity detection"""
    print("🧪 Testing Emotion Intensity Detection...")
    
    # Test different confidence levels
    intensities = [
        (0.9, "high"),
        (0.7, "medium"), 
        (0.5, "low"),
        (0.3, "very_low")
    ]
    
    for confidence, expected in intensities:
        result = emotion_service._calculate_emotion_intensity(confidence)
        print(f"Confidence {confidence} -> Intensity: {result}")
        assert result == expected
    
    print("✅ Emotion intensity tests passed!\n")

def test_context_aware_responses():
    """Test context-aware empathetic responses"""
    print("🧪 Testing Context-Aware Responses...")
    
    # Test conversation 1: First interaction (should be welcoming)
    response1 = emotion_service.get_contextual_response("joy", "medium", conversation_id=1)
    print(f"First interaction (joy, medium): {response1}")
    
    # Test conversation 1: Second interaction (should avoid repetition)
    response2 = emotion_service.get_contextual_response("joy", "medium", conversation_id=1)
    print(f"Second interaction (joy, medium): {response2}")
    assert response1 != response2  # Should be different
    
    # Test persistent sadness (should get supportive responses)
    for i in range(3):
        response = emotion_service.get_contextual_response("sadness", "high", conversation_id=2)
        print(f"Persistent sadness #{i+1}: {response[:50]}...")
    
    # Test emotion transition (anger -> neutral)
    emotion_service.get_contextual_response("anger", "high", conversation_id=3)
    calm_response = emotion_service.get_contextual_response("neutral", "medium", conversation_id=3)
    print(f"After anger -> neutral: {calm_response[:50]}...")
    
    print("✅ Context-aware response tests passed!\n")

def test_multimodal_prediction():
    """Test the complete multimodal prediction with new features"""
    print("🧪 Testing Complete Multimodal Prediction...")
    
    # Test text-only prediction
    result = emotion_service.predict_multimodal(
        text="I'm so excited about my new job!", 
        conversation_id=4
    )
    
    print("Text-only prediction:")
    print(f"  Final emotion: {result['final_emotion']}")
    print(f"  Confidence: {result['final_confidence']:.3f}")
    print(f"  Intensity: {result['emotion_intensity']}")
    print(f"  Fusion method: {result['fusion_method']}")
    print(f"  Response: {result['bot_response'][:50]}...")
    
    # Verify all new fields are present
    required_fields = ['final_emotion', 'final_confidence', 'emotion_intensity', 'fusion_method']
    for field in required_fields:
        assert field in result, f"Missing field: {field}"
    
    print("✅ Multimodal prediction tests passed!\n")

def test_emotion_compatibility():
    """Test emotion compatibility matrix"""
    print("🧪 Testing Emotion Compatibility...")
    
    compatibility_tests = [
        ("joy", "surprise", 0.8),
        ("sadness", "fear", 0.7),
        ("anger", "disgust", 0.6),
        ("joy", "anger", 0.2),  # Should be low/default
    ]
    
    for emotion1, emotion2, expected in compatibility_tests:
        result = emotion_service._check_emotion_compatibility(emotion1, emotion2)
        print(f"Compatibility {emotion1} <-> {emotion2}: {result}")
        assert result == expected or abs(result - expected) < 0.1
    
    print("✅ Emotion compatibility tests passed!\n")

def main():
    """Run all tests"""
    print("🚀 Starting Advanced Emotion Recognition Feature Tests\n")
    
    try:
        test_confidence_based_fusion()
        test_emotion_intensity()
        test_context_aware_responses()
        test_multimodal_prediction()
        test_emotion_compatibility()
        
        print("🎉 All tests passed! Advanced features are working correctly.")
        print("\n📊 Feature Summary:")
        print("✅ Confidence-Based Fusion: Intelligently combines text and face emotions")
        print("✅ Emotion Intensity Detection: Detects high/medium/low/very_low intensity")
        print("✅ Context-Aware Responses: Generates personalized responses based on conversation history")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)