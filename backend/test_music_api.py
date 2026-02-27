"""Test the music recommendation API with new tracks"""
import requests

BASE_URL = "http://localhost:8000"

# Test getting music for different emotions
emotions = ['sadness', 'anger', 'anxiety', 'joy', 'fear']

print("=== TESTING MUSIC RECOMMENDATION API ===\n")

for emotion in emotions:
    try:
        response = requests.get(f"{BASE_URL}/api/recommendations/music/{emotion}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {emotion.upper()}: {len(data)} tracks available")
            if data:
                # Show first track
                track = data[0]
                print(f"   Sample: {track['title']} by {track['artist']}")
                print(f"   YouTube: {track.get('youtube_link', 'N/A')}")
        else:
            print(f"❌ {emotion.upper()}: Error {response.status_code}")
    except Exception as e:
        print(f"❌ {emotion.upper()}: {str(e)}")
    print()

print("\n🎵 Music API test complete!")
