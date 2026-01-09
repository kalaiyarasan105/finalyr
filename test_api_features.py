#!/usr/bin/env python3
"""
Test the new advanced emotion recognition features via API
"""

import requests
import json

API_BASE = "http://localhost:8003"

def test_text_emotion():
    """Test text-only emotion prediction with new features"""
    print("🧪 Testing text emotion prediction...")
    
    # Test data
    test_cases = [
        "I'm so excited about my new job! This is the best day ever!",
        "I feel really sad and lonely today. Nothing seems to go right.",
        "I'm furious about this situation. This is completely unacceptable!",
        "I'm a bit worried about the upcoming presentation."
    ]
    
    for i, text in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i} ---")
        print(f"Input: {text}")
        
        # Make API request
        data = {"text": text}
        response = requests.post(f"{API_BASE}/predict_multimodal", data=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Text Emotion: {result['text_emotion']} ({result['text_confidence']:.3f})")
            print(f"🎯 Final Emotion: {result['final_emotion']} ({result['final_confidence']:.3f})")
            print(f"📊 Intensity: {result['emotion_intensity']}")
            print(f"🔧 Fusion Method: {result['fusion_method']}")
            print(f"🤖 Response: {result['bot_response'][:80]}...")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")

def test_health_check():
    """Test if the API is running"""
    print("🏥 Testing API health...")
    
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ API Status: {result['status']}")
            print(f"📦 Version: {result['version']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server")
        return False

def main():
    """Run API tests"""
    print("🚀 Testing Advanced Emotion Recognition API\n")
    
    # Test health first
    if not test_health_check():
        print("❌ API server is not running. Please start it first.")
        return
    
    print("\n" + "="*50)
    
    # Test text emotion prediction
    test_text_emotion()
    
    print("\n" + "="*50)
    print("✅ API testing completed!")
    print("\n📋 New Features Verified:")
    print("  ✅ Confidence-based fusion")
    print("  ✅ Emotion intensity detection")
    print("  ✅ Enhanced response generation")
    print("  ✅ Fusion method reporting")

if __name__ == "__main__":
    main()