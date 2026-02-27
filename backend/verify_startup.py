"""Verify that all imports work correctly"""
print("Testing imports...")

try:
    print("1. Importing database...")
    from database import engine, get_db, Base
    print("   ✓ Database imported")
    
    print("2. Importing models...")
    from models import User, Conversation, Message
    print("   ✓ Models imported")
    
    print("3. Importing recommendation_models...")
    import recommendation_models
    print("   ✓ Recommendation models imported")
    
    print("4. Importing recommendation_service...")
    from recommendation_service import get_recommendation_service
    print("   ✓ Recommendation service imported")
    
    print("5. Testing service...")
    from database import SessionLocal
    db = SessionLocal()
    service = get_recommendation_service(db)
    print("   ✓ Service created successfully")
    
    print("6. Testing query...")
    quotes = service.get_motivational_quotes('anger', limit=1)
    print(f"   ✓ Query successful, found {len(quotes)} quotes")
    
    db.close()
    
    print("\n✅ All imports and queries work correctly!")
    print("Backend should start without errors.")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
