#!/usr/bin/env python3
"""
Database migration script for wellness and mood journaling features
Adds new tables: mood_journal_entries, wellness_recommendations, wellness_feedback
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, get_db
from models import Base, MoodJournalEntry, WellnessRecommendation, WellnessFeedback

def migrate_database():
    """Create new tables for wellness and mood journaling features"""
    print("🔄 Starting database migration for wellness and mood journaling features...")
    
    try:
        # Create all tables (this will only create new ones)
        Base.metadata.create_all(bind=engine)
        print("✅ Successfully created new tables:")
        print("   - mood_journal_entries")
        print("   - wellness_recommendations") 
        print("   - wellness_feedback")
        
        # Verify tables were created
        with engine.connect() as connection:
            # Check if tables exist
            result = connection.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name IN ('mood_journal_entries', 'wellness_recommendations', 'wellness_feedback')
            """))
            
            existing_tables = [row[0] for row in result]
            print(f"✅ Verified tables exist: {existing_tables}")
            
            if len(existing_tables) == 3:
                print("🎉 Migration completed successfully!")
                return True
            else:
                print(f"⚠️  Warning: Only {len(existing_tables)} out of 3 tables were created")
                return False
                
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

def rollback_migration():
    """Rollback the migration by dropping the new tables"""
    print("🔄 Rolling back wellness and mood journaling migration...")
    
    try:
        with engine.connect() as connection:
            # Drop tables in reverse order due to foreign key constraints
            connection.execute(text("DROP TABLE IF EXISTS wellness_feedback"))
            connection.execute(text("DROP TABLE IF EXISTS wellness_recommendations"))
            connection.execute(text("DROP TABLE IF EXISTS mood_journal_entries"))
            connection.commit()
            
        print("✅ Rollback completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Rollback failed: {str(e)}")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Migrate database for wellness and mood journaling")
    parser.add_argument("--rollback", action="store_true", help="Rollback the migration")
    
    args = parser.parse_args()
    
    if args.rollback:
        success = rollback_migration()
    else:
        success = migrate_database()
    
    sys.exit(0 if success else 1)