#!/usr/bin/env python3
"""
Database migration script to add new emotion fields to existing database
"""

import sqlite3
import os

def migrate_database():
    """Add new columns to the messages table"""
    db_path = "emotion_app.db"
    
    if not os.path.exists(db_path):
        print("Database doesn't exist yet - will be created with new schema")
        return
    
    print("🔄 Migrating database to add new emotion fields...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if new columns already exist
    cursor.execute("PRAGMA table_info(messages)")
    columns = [column[1] for column in cursor.fetchall()]
    
    new_columns = [
        ("final_emotion", "VARCHAR(50)"),
        ("final_confidence", "FLOAT"),
        ("emotion_intensity", "VARCHAR(20)"),
        ("fusion_method", "VARCHAR(50)")
    ]
    
    for column_name, column_type in new_columns:
        if column_name not in columns:
            try:
                cursor.execute(f"ALTER TABLE messages ADD COLUMN {column_name} {column_type}")
                print(f"✅ Added column: {column_name}")
            except sqlite3.Error as e:
                print(f"❌ Error adding column {column_name}: {e}")
        else:
            print(f"⏭️  Column {column_name} already exists")
    
    conn.commit()
    conn.close()
    print("✅ Database migration completed!")

if __name__ == "__main__":
    migrate_database()