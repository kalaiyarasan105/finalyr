from recommendation_service import RecommendationService
from database import SessionLocal
from models import User  # Import User to register it
from recommendation_models import MotivationalQuote, MusicTrack  # Import models

db = SessionLocal()
service = RecommendationService(db)

print("=== Testing Quotes for Anger ===")
quotes = service.get_motivational_quotes('anger', limit=5)
print(f"Found {len(quotes)} quotes")
for q in quotes:
    print(f"  - {q.get('english_translation', 'No translation')[:50]}...")

print("\n=== Testing Music for Anger ===")
music = service.get_music_tracks('anger', limit=5)
print(f"Found {len(music)} tracks")
for m in music:
    print(f"  - {m.get('title', 'No title')}")

print("\n=== Testing get_recommendations_by_category ===")
recs = service.get_recommendations_by_category('anger', 'quotes', limit=5)
print(f"Found {len(recs)} recommendations")

db.close()
